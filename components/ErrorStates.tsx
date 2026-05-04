'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ============================================================
 * InlineError
 * Inline error adjacent to a failed message with optional retry.
 * ============================================================ */
export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        color: 'var(--color-error)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family)',
      }}
      role="alert"
      aria-live="polite"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 var(--spacing-xs)',
            cursor: 'pointer',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family)',
            fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
            textDecoration: 'underline',
            minHeight: 'var(--tap-target-min)',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          aria-label="Retry"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/* ============================================================
 * NetworkOfflineBanner
 * Persistent header banner indicating the user is offline.
 * Uses --z-banner (400).
 * ============================================================ */
export function NetworkOfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    setOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-banner)' as unknown as number,
        backgroundColor: 'var(--color-surface-raised)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-error)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
      }}
    >
      {"You're offline. Check your connection."}
    </div>
  );
}

/* ============================================================
 * SessionExpiredRedirect
 * Redirects to /signin on mount. Shows session expired message
 * while the redirect is in progress.
 * ============================================================ */
export function SessionExpiredRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/signin');
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-family)',
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-md)',
          margin: 0,
        }}
      >
        Your session has expired. Sign in to continue.
      </p>
    </div>
  );
}

/* ============================================================
 * RateLimitMessage
 * Shows the exact rate-limit user-facing copy.
 * ============================================================ */
export function RateLimitMessage() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family)',
        fontStyle: 'italic',
      }}
    >
      Rise needs a moment. Try again in a few seconds.
    </div>
  );
}

/* ============================================================
 * APITimeoutRetry
 * 30-second countdown timeout indicator with a retry button.
 * ============================================================ */
export function APITimeoutRetry({ onRetry }: { onRetry: () => void }) {
  const TIMEOUT_SECONDS = 30;
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family)',
        textAlign: 'center',
      }}
    >
      <span>
        {secondsLeft > 0
          ? `This is taking a moment. Retrying in ${secondsLeft}s…`
          : 'This is taking longer than expected.'}
      </span>
      <button
        onClick={onRetry}
        style={{
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
          minHeight: 'var(--tap-target-min)',
          padding: '0 var(--spacing-md)',
          transition: 'opacity var(--transition-fast)',
        }}
        aria-label="Retry request"
      >
        Retry
      </button>
    </div>
  );
}

/* ============================================================
 * TruncationWarning
 * Shows the exact truncation user-facing copy.
 * ============================================================ */
export function TruncationWarning() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-family)',
        fontStyle: 'italic',
      }}
    >
      Your message was shortened to fit.
    </div>
  );
}
