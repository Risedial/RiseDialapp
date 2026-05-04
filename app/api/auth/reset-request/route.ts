import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';
import { supabaseServer } from '@/lib/supabase/server';

const resetRequestSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
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

    const parsed = resetRequestSchema.safeParse(body);
    if (!parsed.success) {
      // Return success to avoid leaking validation details that could aid enumeration
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up the user — but do NOT reveal whether the user exists
    let userId: string | null = null;
    try {
      const { data, error } = await supabaseServer
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (!error && data) {
        userId = data.id as string;
      }
    } catch {
      // Swallow DB errors — always return success
    }

    if (userId) {
      // Generate cryptographically random token
      let rawToken: string;
      try {
        rawToken = crypto.randomBytes(32).toString('hex');
      } catch {
        // If token generation fails, return success without sending email
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Hash the token for storage (SHA-256)
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      // Expiry: 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      try {
        await supabaseServer
          .from('users')
          .update({
            password_reset_token: hashedToken,
            password_reset_expires: expiresAt,
          })
          .eq('id', userId);
      } catch {
        // Swallow DB errors — always return success
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Send reset email via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://risedial.com';

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const resetLink = `${appBaseUrl}/reset-password?token=${rawToken}`;

          await resend.emails.send({
            from: 'RiseDial <noreply@risedial.com>',
            to: normalizedEmail,
            subject: 'Reset your RiseDial password',
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #111827;">Reset your password</h2>
                <p style="color: #374151;">
                  We received a request to reset the password for your RiseDial account.
                  Click the button below to choose a new password. This link expires in 1 hour.
                </p>
                <a
                  href="${resetLink}"
                  style="
                    display: inline-block;
                    margin: 24px 0;
                    padding: 12px 24px;
                    background-color: #111827;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                  "
                >
                  Reset Password
                </a>
                <p style="color: #6b7280; font-size: 14px;">
                  If you did not request a password reset, you can safely ignore this email.
                  Your password will not change.
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                  If the button above does not work, copy and paste this link into your browser:<br />
                  <span style="word-break: break-all;">${resetLink}</span>
                </p>
              </div>
            `,
          });
        } catch {
          // Swallow email errors — always return success
        }
      }
    }

    // Always return success regardless of whether the email existed
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Top-level catch — always return success to prevent user enumeration
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
