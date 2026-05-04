'use client';

import { useRouter } from 'next/navigation';

export default function SubscriptionLockedPage() {
  const router = useRouter();

  function handleResubscribe() {
    router.push('/plan-selection');
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
            style={styles.icon}
          >
            <circle cx="24" cy="24" r="22" stroke="url(#ring-gradient)" strokeWidth="2" fill="none" />
            <path
              d="M24 14v12M24 32v2"
              stroke="url(#path-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="ring-gradient" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--color-accent-start)" />
                <stop offset="1" stopColor="var(--color-accent-end)" />
              </linearGradient>
              <linearGradient id="path-gradient" x1="24" y1="14" x2="24" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--color-accent-start)" />
                <stop offset="1" stopColor="var(--color-accent-end)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 style={styles.heading}>Your access has paused.</h1>

        <p style={styles.body}>
          Resubscribe to continue.
        </p>

        <p style={styles.subtext}>
          Your account and all your data are safe. Nothing has been deleted.
        </p>

        <button
          onClick={handleResubscribe}
          style={styles.button}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          }}
        >
          Resubscribe
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-lg)',
    fontFamily: 'var(--font-family)',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-2xl)',
    maxWidth: '400px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: 'var(--spacing-sm)',
  },
  icon: {
    display: 'block',
  },
  heading: {
    margin: 0,
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-semibold)' as unknown as number,
    color: 'var(--color-text-primary)',
    lineHeight: 1.3,
  },
  body: {
    margin: 0,
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-normal)' as unknown as number,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  },
  subtext: {
    margin: 0,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  button: {
    marginTop: 'var(--spacing-sm)',
    width: '100%',
    minHeight: 'var(--tap-target-min)',
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#ffffff',
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-semibold)' as unknown as number,
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'opacity var(--transition-fast)',
  },
};
