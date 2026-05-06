import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { getUserByEmail } from '@/lib/db/users';
import { supabaseServer } from '@/lib/supabase/server';

const signinSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
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

    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Validation failed.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // ── Admin bypass ────────────────────────────────────────────────────────────
    // Checks ADMIN_EMAIL + ADMIN_PASSWORD env vars. If both are set and match,
    // mints a session with subscription_status: 'active' without Stripe.
    // Pre-condition: admin user must already exist in DB (sign up via /signin first).
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword && normalizedEmail === adminEmail && password === adminPassword) {
      let adminUser;
      try {
        adminUser = await getUserByEmail(normalizedEmail);
      } catch {
        return NextResponse.json(
          { success: false, error: 'An error occurred. Please try again.' },
          { status: 500 }
        );
      }

      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
          { status: 401 }
        );
      }

      // Keep admin DB row in sync — Stripe webhooks can reset these fields
      try {
        await supabaseServer
          .from('users')
          .update({ subscription_status: 'active', has_premium_memory: true })
          .eq('id', adminUser.id);
      } catch {
        // Non-fatal: session still created even if this update fails
      }

      let sessionToken: string;
      try {
        sessionToken = await createSession(adminUser.id, 'active');
      } catch {
        return NextResponse.json(
          { success: false, error: 'An error occurred. Please try again.' },
          { status: 500 }
        );
      }

      // Fetch last chat for redirect decision
      let lastChatId: string | null = null;
      try {
        const { data: lastChat } = await supabaseServer
          .from('chats')
          .select('id')
          .eq('user_id', adminUser.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        lastChatId = lastChat?.id ?? null;
      } catch {
        lastChatId = null;
      }

      const adminResponse = NextResponse.json(
        { success: true, subscription_status: 'active', lastChatId },
        { status: 200 }
      );
      setSessionCookie(adminResponse, sessionToken);
      return adminResponse;
    }
    // ── End admin bypass ─────────────────────────────────────────────────────────

    let user;
    try {
      user = await getUserByEmail(normalizedEmail);
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    let passwordMatch: boolean;
    try {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    let sessionToken: string;
    try {
      sessionToken = await createSession(user.id, user.subscription_status);
    } catch {
      return NextResponse.json(
        { success: false, error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    // Fetch last chat for redirect decision
    let lastChatId: string | null = null;
    try {
      const { data: lastChat } = await supabaseServer
        .from('chats')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      lastChatId = lastChat?.id ?? null;
    } catch {
      lastChatId = null;
    }

    const response = NextResponse.json(
      { success: true, subscription_status: user.subscription_status, lastChatId },
      { status: 200 }
    );

    setSessionCookie(response, sessionToken);

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
