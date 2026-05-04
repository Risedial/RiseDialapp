import { NextResponse } from 'next/server';

export async function POST() {
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
