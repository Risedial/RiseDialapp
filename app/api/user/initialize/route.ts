import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createMessage } from '@/lib/db/messages';
import { getOpeningMessage } from '@/lib/rise/opening-message';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // Get preferred name for opening message
  const { data: userRow } = await supabaseServer
    .from('users')
    .select('preferred_name')
    .eq('id', userId)
    .single();

  const preferredName = userRow?.preferred_name ?? null;

  // Create the first chat
  const { data: newChat, error: chatError } = await supabaseServer
    .from('chats')
    .insert({ user_id: userId, title: 'Welcome' })
    .select('id')
    .single();

  if (chatError || !newChat) {
    console.error('[POST /api/user/initialize] chat creation failed:', chatError);
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }

  // Generate and persist Rise's opening message
  const openingText = getOpeningMessage(true, preferredName);

  try {
    await createMessage(newChat.id, 'assistant', openingText);
  } catch (err) {
    console.error('[POST /api/user/initialize] message creation failed:', err);
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }

  return NextResponse.json({ chatId: newChat.id }, { status: 200 });
}
