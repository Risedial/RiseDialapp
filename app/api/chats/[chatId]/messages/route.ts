import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { supabaseServer } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET /api/chats/[chatId]/messages
// ---------------------------------------------------------------------------
// Returns paginated messages for a specific chat, newest first.
//
// Query parameters:
//   limit  — number of messages to return (default: 50, max: 100)
//   before — cursor: only return messages created before this ISO-8601 timestamp
//
// Auth-gated. Verifies the chat belongs to the requesting user.
//
// Response shape:
//   { messages: [{ id, role, content, created_at }], hasMore: boolean }
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
): Promise<NextResponse> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const userId = user.user_id;
  const chatId = params.chatId;

  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId." }, { status: 400 });
  }

  // ── 2. Parse query parameters ──────────────────────────────────────────────
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  const before = url.searchParams.get("before");

  let limit = 50;
  if (rawLimit !== null) {
    const parsed = parseInt(rawLimit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, 100);
    }
  }

  // ── 3. Verify chat ownership ───────────────────────────────────────────────
  const { data: chat, error: chatError } = await supabaseServer
    .from("chats")
    .select("id, user_id, deleted_at")
    .eq("id", chatId)
    .single();

  if (chatError || !chat) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  if (chat.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Deleted chats can still have their messages read during the session,
  // but the messages table is hard-deleted on chat deletion — so this check
  // is informational only and will naturally return an empty list.

  // ── 4. Fetch messages with pagination ─────────────────────────────────────
  // We fetch limit + 1 rows to determine whether there are more pages.
  // Messages are returned newest-first (created_at descending).
  let query = supabaseServer
    .from("messages")
    .select("id, role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (before) {
    // Return only messages created strictly before the cursor timestamp.
    query = query.lt("created_at", before);
  }

  const { data: rows, error: messagesError } = await query;

  if (messagesError) {
    console.error("[GET /api/chats/[chatId]/messages] query error:", messagesError);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }

  const allRows = rows ?? [];

  // ── 5. Determine hasMore and trim to requested limit ───────────────────────
  const hasMore = allRows.length > limit;
  const messages = hasMore ? allRows.slice(0, limit) : allRows;

  return NextResponse.json({ messages, hasMore }, { status: 200 });
}
