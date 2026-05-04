import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  user_id: string;
  subscription_status: string;
  iat?: number;
  exp?: number;
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('risedial_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return NextResponse.json(
      { error: 'Your session has expired. Sign in to continue.' },
      { status: 401 }
    );
  }

  let payload: JWTPayload;
  try {
    payload = jwt.verify(sessionCookie.value, jwtSecret, {
      algorithms: ['HS256'],
    }) as JWTPayload;
  } catch {
    return NextResponse.json(
      { error: 'Your session has expired. Sign in to continue.' },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.user_id);
  requestHeaders.set('x-subscription-status', payload.subscription_status);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/memory/:path*',
    '/api/subscription/:path*',
    '/api/chats/:path*',
    '/api/user/:path*',
  ],
};
