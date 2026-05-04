import { NextRequest, NextResponse } from 'next/server';
import { getMemoryProfileByUserId } from '@/lib/db/memory';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const memory = await getMemoryProfileByUserId(userId);

  return NextResponse.json({ memory }, { status: 200 });
}
