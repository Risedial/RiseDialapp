import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST /api/chats/[chatId]/title
// ---------------------------------------------------------------------------
// Auth-gated endpoint that updates the title of a single chat.
//
// Request body (JSON):
//   { "title": string }
//
// Validation:
//   - title must be present and non-empty after trimming
//   - title is truncated to 40 characters before being stored
//
// Response (200):
//   { "success": true, "title": "<stored title>" }
//
// Error responses:
//   401 — missing or invalid session cookie
//   400 — missing / empty title in request body
//   404 — chat not found or does not belong to this user
//   500 — database update failure
// ---------------------------------------------------------------------------

const MAX_TITLE_LENGTH = 40;

export async function POST(
  req: NextRequest,
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

  // ── 2. Parse and validate request body ───────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("title" in body) ||
    typeof (body as Record<string, unknown>).title !== "string"
  ) {
    return NextResponse.json(
      { error: "Request body must include a title string" },
      { status: 400 }
    );
  }

  const rawTitle = ((body as Record<string, unknown>).title as string).trim();

  if (rawTitle.length === 0) {
    return NextResponse.json(
      { error: "title must be non-empty" },
      { status: 400 }
    );
  }

  // Truncate to MAX_TITLE_LENGTH characters.
  const storedTitle = rawTitle.slice(0, MAX_TITLE_LENGTH);

  // ── 3. Verify chat ownership ──────────────────────────────────────────────
  const { data: chat, error: chatFetchError } = await supabaseServer
    .from("chats")
    .select("id, user_id")
    .eq("id", chatId)
    .is("deleted_at", null)
    .single();

  if (chatFetchError || !chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if ((chat as { user_id: string }).user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── 4. Update the title in the database ───────────────────────────────────
  const { error: updateError } = await supabaseServer
    .from("chats")
    .update({ title: storedTitle })
    .eq("id", chatId)
    .eq("user_id", userId);

  if (updateError) {
    console.error(
      "[POST /api/chats/[chatId]/title] update error:",
      updateError
    );
    return NextResponse.json(
      { error: "Failed to update chat title" },
      { status: 500 }
    );
  }

  // ── 5. Return success ─────────────────────────────────────────────────────
  return NextResponse.json({ success: true, title: storedTitle }, { status: 200 });
}
