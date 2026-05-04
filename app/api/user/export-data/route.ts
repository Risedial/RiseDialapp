import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getMemoryProfileByUserId } from '@/lib/db/memory';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    // Fetch user
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, email, preferred_name, subscription_status, created_at')
      .eq('id', userId)
      .single();
    if (userError || !user) throw new Error('user');

    // Fetch chats
    const { data: chats, error: chatsError } = await supabaseServer
      .from('chats')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (chatsError) throw new Error('chats');

    // Fetch messages per chat
    const enrichedChats = await Promise.all(
      (chats ?? []).map(async (chat) => {
        const { data: messages } = await supabaseServer
          .from('messages')
          .select('id, role, content, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true });
        return { ...chat, messages: messages ?? [] };
      })
    );

    // Fetch memory profile
    const memoryProfile = await getMemoryProfileByUserId(userId);

    const exportData = {
      user,
      chats: enrichedChats,
      memory_profile: memoryProfile ?? null,
      exported_at: new Date().toISOString(),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="risedial-export.json"',
      },
    });
  } catch (err) {
    console.error('[GET /api/user/export-data] failed:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
