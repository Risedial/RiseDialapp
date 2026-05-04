'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to the console for debugging — do NOT surface to user
    console.error('[GlobalError boundary]', error?.digest ?? 'unhandled error');
  }, [error]);

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: 'var(--color-bg, #0a0a0f)',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
          }}
          role="alert"
        >
          <p
            style={{
              color: 'var(--color-text-secondary, #8888a8)',
              fontSize: '16px',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Something went wrong. Please refresh the page.
          </p>

          <button
            onClick={handleRefresh}
            style={{
              backgroundColor: 'var(--color-surface-raised, #1a1a24)',
              border: '1px solid var(--color-border, #2a2a38)',
              borderRadius: '8px',
              color: 'var(--color-text-primary, #e8e8f0)',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: 500,
              minHeight: '44px',
              padding: '0 24px',
            }}
            aria-label="Refresh the page"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
