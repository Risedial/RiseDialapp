import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabase/server';

const resetConfirmSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required.' }),
  new_password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }),
});

const INVALID_LINK_ERROR = 'This reset link is invalid or has expired.';

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: INVALID_LINK_ERROR },
        { status: 400 }
      );
    }

    const parsed = resetConfirmSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? INVALID_LINK_ERROR;
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, new_password } = parsed.data;

    // Hash the incoming token to compare against the stored hashed value
    let hashedToken: string;
    try {
      hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    } catch {
      return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
    }

    // Look up user by hashed token
    let userId: string | null = null;
    let tokenExpiry: string | null = null;

    try {
      const { data, error } = await supabaseServer
        .from('users')
        .select('id, password_reset_expires')
        .eq('password_reset_token', hashedToken)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
      }

      userId = data.id as string;
      tokenExpiry = data.password_reset_expires as string | null;
    } catch {
      return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
    }

    // Check that expiry exists and has not passed
    if (!tokenExpiry) {
      return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
    }

    const expiryDate = new Date(tokenExpiry);
    if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
      return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
    }

    // Hash the new password
    let newPasswordHash: string;
    try {
      newPasswordHash = await bcrypt.hash(new_password, 12);
    } catch {
      return NextResponse.json(
        { error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    // Update password and clear the reset token fields
    try {
      const { error } = await supabaseServer
        .from('users')
        .update({
          password_hash: newPasswordHash,
          password_reset_token: null,
          password_reset_expires: null,
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json(
          { error: 'An error occurred. Please try again.' },
          { status: 500 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
