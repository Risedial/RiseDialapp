'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SubscriptionBannerProps {
  isVisible: boolean;
}

export default function SubscriptionBanner({ isVisible }: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <div style={styles.banner} role="alert" aria-live="polite">
      <p style={styles.message}>
        Your subscription has lapsed.{' '}
        <Link href="/plan-selection" style={styles.link}>
          Resubscribe to continue.
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        style={styles.dismissButton}
        aria-label="Dismiss subscription banner"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 'var(--z-banner)' as unknown as number,
    backgroundColor: 'var(--color-surface-raised)',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    minHeight: '44px',
    fontFamily: 'var(--font-family)',
  },
  message: {
    margin: 0,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4,
    flex: 1,
    textAlign: 'center',
  },
  link: {
    color: 'var(--color-accent-start)',
    textDecoration: 'underline',
    fontWeight: 'var(--font-weight-medium)' as unknown as number,
  },
  dismissButton: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    transition: 'color var(--transition-fast)',
    padding: 0,
    fontFamily: 'var(--font-family)',
  },
};
