'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 1000;

type PollingState = 'polling' | 'fallback';

interface SubscriptionStatusResponse {
  subscription_status?: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [pollingState, setPollingState] = useState<PollingState>('polling');
  const pollCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    pollCountRef.current = 0;
    setPollingState('polling');

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        stopPolling();
        return;
      }

      pollCountRef.current += 1;

      try {
        const res = await fetch('/api/subscription/status');
        if (!isMountedRef.current) return;

        if (res.ok) {
          const data: SubscriptionStatusResponse = await res.json();
          if (data.subscription_status === 'active') {
            stopPolling();
            router.push('/onboarding');
            return;
          }
        }
      } catch {
        // No raw error states shown — silently continue polling
      }

      if (pollCountRef.current >= MAX_POLLS) {
        stopPolling();
        if (isMountedRef.current) {
          setPollingState('fallback');
        }
      }
    }, POLL_INTERVAL_MS);
  }, [router, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;
    startPolling();

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const handleRefresh = useCallback(() => {
    startPolling();
  }, [startPolling]);

  return (
    <>
      <style>{`
        @keyframes risePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @keyframes riseDotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>

      <main
        style={{
          minHeight: '100dvh',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-lg)',
          paddingTop: 'max(var(--spacing-2xl), env(safe-area-inset-top))',
          paddingBottom: 'max(var(--spacing-2xl), env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-xl)',
            textAlign: 'center',
          }}
        >
          {/* Brand mark */}
          <div
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              background:
                'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Rise
          </div>

          {pollingState === 'polling' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
              }}
            >
              {/* Animated dots */}
              <div
                role="status"
                aria-label="Loading"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                      animation: `riseDotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Polling screen header — exact copy string */}
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                  animation: 'risePulse 2.4s ease-in-out infinite',
                }}
              >
                Setting up your account...
              </p>
            </div>
          )}

          {pollingState === 'fallback' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
                width: '100%',
              }}
            >
              {/* Fallback copy — exact string */}
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Almost there — this is taking longer than expected
              </p>

              {/* Refresh button */}
              <button
                type="button"
                onClick={handleRefresh}
                style={{
                  height: 'var(--tap-target-min)',
                  minHeight: 'var(--tap-target-min)',
                  paddingLeft: 'var(--spacing-xl)',
                  paddingRight: 'var(--spacing-xl)',
                  background:
                    'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-family)',
                  cursor: 'pointer',
                  transition: 'opacity var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                }}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
