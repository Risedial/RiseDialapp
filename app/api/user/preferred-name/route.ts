import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: { preferredName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const preferredName = body.preferredName?.trim() ?? '';

  if (!preferredName) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  if (preferredName.length > 30) {
    return NextResponse.json({ error: 'Name too long' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('users')
    .update({ preferred_name: preferredName })
    .eq('id', userId);

  if (error) {
    console.error('[PATCH /api/user/preferred-name] update failed:', error);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
