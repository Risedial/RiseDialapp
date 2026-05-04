import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data: user, error } = await supabaseServer
    .from('users')
    .select('email, preferred_name, subscription_status, has_premium_memory')
    .eq('id', userId)
    .single();

  if (error?.code === 'PGRST116' || !user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (error) {
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }

  return NextResponse.json(user, { status: 200 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: { preferred_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const preferredName = body.preferred_name?.trim() ?? '';

  if (preferredName.length > 30) {
    return NextResponse.json({ error: 'Name too long' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('users')
    .update({ preferred_name: preferredName || null })
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
