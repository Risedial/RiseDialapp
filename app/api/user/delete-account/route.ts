import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // Step 1: Get all chat IDs for this user
  const { data: chats, error: fetchError } = await supabaseServer
    .from('chats')
    .select('id')
    .eq('user_id', userId);

  if (fetchError) {
    console.error('[DELETE /api/user/delete-account] step: fetch chats', fetchError);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }

  const chatIds = (chats ?? []).map((c) => c.id);

  // Step 2: Delete messages
  if (chatIds.length > 0) {
    const { error: messagesError } = await supabaseServer
      .from('messages')
      .delete()
      .in('chat_id', chatIds);
    if (messagesError) {
      console.error('[DELETE /api/user/delete-account] step: messages', messagesError);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }
  }

  // Step 3: Delete chats
  const { error: chatsError } = await supabaseServer
    .from('chats')
    .delete()
    .eq('user_id', userId);
  if (chatsError) {
    console.error('[DELETE /api/user/delete-account] step: chats', chatsError);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }

  // Step 4: Delete memory profile
  const { error: memoryError } = await supabaseServer
    .from('memory_profiles')
    .delete()
    .eq('user_id', userId);
  if (memoryError) {
    console.error('[DELETE /api/user/delete-account] step: memory_profiles', memoryError);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }

  // Step 5: Delete user
  const { error: userError } = await supabaseServer
    .from('users')
    .delete()
    .eq('id', userId);
  if (userError) {
    console.error('[DELETE /api/user/delete-account] step: users', userError);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }

  // Step 6: Clear session cookie and return
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('risedial_session', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
