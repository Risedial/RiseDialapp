import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { supabaseServer } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET /api/chats
// ---------------------------------------------------------------------------
// Returns the authenticated user's non-deleted chats ordered by the timestamp
// of their most recent message (descending). Chats without any messages are
// ordered by their own created_at descending.
//
// Response shape:
//   { chats: [{ id, title, created_at, last_message_at }] }
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const userId = user.user_id;

  // ── 2. Fetch non-deleted chats with last message timestamp ─────────────────
  // We join chats with the max created_at from messages to get last_message_at.
  // Supabase does not support aggregated joins in a single select, so we fetch
  // chats first and then resolve last_message_at via a subquery approach using
  // the service role client.
  //
  // Strategy: fetch all non-deleted chats for the user, then fetch the max
  // created_at per chat_id for messages in a single query using a group-by
  // via .select() with an aggregation. Supabase does not expose window
  // functions natively, so we use two queries and merge in-process.

  const { data: chats, error: chatsError } = await supabaseServer
    .from("chats")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (chatsError) {
    console.error("[GET /api/chats] chats query error:", chatsError);
    return NextResponse.json({ error: "Failed to fetch chats." }, { status: 500 });
  }

  if (!chats || chats.length === 0) {
    return NextResponse.json({ chats: [] }, { status: 200 });
  }

  const chatIds = chats.map((c) => c.id);

  // ── 3. Fetch max message timestamp per chat ────────────────────────────────
  // We fetch the most recently created message for each chat that belongs to
  // this user. We filter by chat_id IN (...) to scope to the user's own chats.
  const { data: lastMessages, error: messagesError } = await supabaseServer
    .from("messages")
    .select("chat_id, created_at")
    .in("chat_id", chatIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("[GET /api/chats] messages query error:", messagesError);
    return NextResponse.json({ error: "Failed to fetch message timestamps." }, { status: 500 });
  }

  // Build a map of chat_id → max(created_at) using the already-descending rows.
  const lastMessageAtMap = new Map<string, string>();
  for (const msg of lastMessages ?? []) {
    if (!lastMessageAtMap.has(msg.chat_id)) {
      lastMessageAtMap.set(msg.chat_id, msg.created_at);
    }
  }

  // Fetch last message content per chat
  const { data: lastMsgs } = await supabaseServer
    .from('messages')
    .select('chat_id, content')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: false });

  const lastMessageContentMap = new Map<string, string>();
  for (const msg of lastMsgs ?? []) {
    if (!lastMessageContentMap.has(msg.chat_id)) {
      lastMessageContentMap.set(msg.chat_id, msg.content);
    }
  }

  // ── 4. Merge and sort ──────────────────────────────────────────────────────
  const enrichedChats = chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    lastMessage: lastMessageContentMap.get(chat.id) ?? null,
    updatedAt: lastMessageAtMap.get(chat.id) ?? chat.created_at,
  }));

  // Sort by last_message_at desc, falling back to created_at desc when null.
  enrichedChats.sort((a, b) => {
    const aTime = a.updatedAt;
    const bTime = b.updatedAt;
    return bTime.localeCompare(aTime);
  });

  return NextResponse.json({ chats: enrichedChats }, { status: 200 });
}

// ---------------------------------------------------------------------------
// POST /api/chats
// ---------------------------------------------------------------------------
// Creates a new chat for the authenticated user with a placeholder title.
//
// Response shape:
//   { chat: { id, title, created_at } }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const userId = user.user_id;

  // ── 2. Insert new chat row ─────────────────────────────────────────────────
  const { data: newChat, error: insertError } = await supabaseServer
    .from("chats")
    .insert({ user_id: userId, title: "New conversation" })
    .select("id, title, created_at")
    .single();

  if (insertError || !newChat) {
    console.error("[POST /api/chats] insert error:", insertError);
    return NextResponse.json({ error: "Failed to create chat." }, { status: 500 });
  }

  return NextResponse.json({ chat: newChat }, { status: 201 });
}
