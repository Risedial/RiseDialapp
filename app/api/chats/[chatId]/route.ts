import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// DELETE /api/chats/[chatId]
// ---------------------------------------------------------------------------
// 1. Auth-gated: reads user from JWT cookie
// 2. Verifies the chat belongs to the requesting user
// 3. Soft-deletes the chat (sets deleted_at = now())
// 4. Hard-deletes all messages for the chat
// 5. Updates memory_profiles.source_chats jsonb to mark the chat as deleted
//    (sets deleted_at on the matching source_chats entry)
// 6. Does NOT modify memory_profiles.profile_json
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { chatId: string } }
): Promise<NextResponse> {
  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const cookieStore = cookies();
  const token = cookieStore.get("risedial_session")?.value ?? null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user_id;
  const chatId = params.chatId;

  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
  }

  // ── 2. Verify chat ownership ──────────────────────────────────────────────
  const { data: chat, error: chatFetchError } = await supabaseServer
    .from("chats")
    .select("id, user_id, deleted_at")
    .eq("id", chatId)
    .single();

  if (chatFetchError || !chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if (chat.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── 3. Soft-delete the chat ───────────────────────────────────────────────
  const { error: softDeleteError } = await supabaseServer
    .from("chats")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("user_id", userId);

  if (softDeleteError) {
    console.error("[DELETE /api/chats/[chatId]] soft-delete error:", softDeleteError);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }

  // ── 4. Hard-delete all messages for the chat ──────────────────────────────
  const { error: messagesDeleteError } = await supabaseServer
    .from("messages")
    .delete()
    .eq("chat_id", chatId);

  if (messagesDeleteError) {
    console.error("[DELETE /api/chats/[chatId]] messages hard-delete error:", messagesDeleteError);
    return NextResponse.json({ error: "Failed to delete messages" }, { status: 500 });
  }

  // ── 5. Update memory_profiles.source_chats ────────────────────────────────
  // Fetch the current memory profile for this user (one profile per user).
  const { data: memoryProfile, error: memoryFetchError } = await supabaseServer
    .from("memory_profiles")
    .select("id, source_chats")
    .eq("user_id", userId)
    .single();

  // If the user has no memory profile yet, there is nothing to update — this
  // is not an error condition (the chat may have been deleted before any
  // memory was compressed).
  if (!memoryFetchError && memoryProfile) {
    const now = new Date().toISOString();

    // source_chats is a jsonb array of { chat_id, deleted_at } objects.
    // Find the entry matching chatId and set its deleted_at timestamp.
    // If no matching entry exists, leave the array unchanged.
    const existingSourceChats: Array<{ chat_id: string; deleted_at: string | null }> =
      Array.isArray(memoryProfile.source_chats) ? memoryProfile.source_chats : [];

    const entryExists = existingSourceChats.some((entry) => entry.chat_id === chatId);

    if (entryExists) {
      const updatedSourceChats = existingSourceChats.map((entry) => {
        if (entry.chat_id === chatId) {
          return { ...entry, deleted_at: now };
        }
        return entry;
      });

      const { error: memoryUpdateError } = await supabaseServer
        .from("memory_profiles")
        .update({ source_chats: updatedSourceChats })
        .eq("id", memoryProfile.id)
        .eq("user_id", userId);

      if (memoryUpdateError) {
        console.error(
          "[DELETE /api/chats/[chatId]] memory_profiles source_chats update error:",
          memoryUpdateError
        );
        // The chat and messages have already been handled. Return 500 so the
        // caller knows the memory metadata is potentially inconsistent.
        return NextResponse.json(
          { error: "Failed to update memory profile" },
          { status: 500 }
        );
      }
    }
  }

  // ── 6. Return success ─────────────────────────────────────────────────────
  return NextResponse.json({ success: true }, { status: 200 });
}
