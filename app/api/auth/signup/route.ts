import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { getUserByEmail, createUser } from '@/lib/db/users';

const signupSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Validation failed.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    let existingUser;
    try {
      existingUser = await getUserByEmail(normalizedEmail);
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(password, 12);
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    let newUser;
    try {
      newUser = await createUser({
        email: normalizedEmail,
        password_hash: passwordHash,
        subscription_status: 'lapsed',
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    let sessionToken: string;
    try {
      sessionToken = await createSession(newUser.id, newUser.subscription_status);
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true }, { status: 201 });

    setSessionCookie(response, sessionToken);

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
