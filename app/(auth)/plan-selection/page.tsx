'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type PlanType = 'monthly' | 'annual';

export default function PlanSelectionPage() {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [addonEnabled, setAddonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const getDisplayPrice = useCallback((): string => {
    if (selectedPlan === 'monthly') {
      return addonEnabled ? '$31.25/month' : '$25.00/month';
    }
    return addonEnabled ? '$249.00/year' : '$199.00/year';
  }, [selectedPlan, addonEnabled]);

  const handleContinue = useCallback(async () => {
    setIsLoading(true);
    setCheckoutError('');

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          hasPremiumAddon: addonEnabled,
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        setCheckoutError('Something went wrong. Please try again.');
        return;
      }

      const payload = data as { url?: string };
      if (!payload.url) {
        setCheckoutError('Something went wrong. Please try again.');
        return;
      }

      router.push(payload.url);
    } catch {
      setCheckoutError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlan, addonEnabled, router]);

  const monthlySelected = selectedPlan === 'monthly';
  const annualSelected = selectedPlan === 'annual';

  return (
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
          gap: 'var(--spacing-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              margin: 0,
              background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Rise
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Choose your plan
          </p>
        </div>

        {/* Plan Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
          }}
        >
          {/* Monthly Plan Card */}
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            aria-pressed={monthlySelected}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-surface)',
              border: `2px solid ${monthlySelected ? 'var(--color-accent-start)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-lg)',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
              transition: 'border-color var(--transition-fast)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Monthly
                </span>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  $25.00/month
                </span>
              </div>

              {/* Radio indicator */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${monthlySelected ? 'var(--color-accent-start)' : 'var(--color-border)'}`,
                  backgroundColor: monthlySelected ? 'var(--color-accent-start)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
                {monthlySelected && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                    }}
                  />
                )}
              </div>
            </div>
          </button>

          {/* Annual Plan Card */}
          <button
            type="button"
            onClick={() => setSelectedPlan('annual')}
            aria-pressed={annualSelected}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-surface)',
              border: `2px solid ${annualSelected ? 'var(--color-accent-start)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-lg)',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
              transition: 'border-color var(--transition-fast)',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Save $101/year badge */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(-1 * var(--spacing-sm))',
                right: 'var(--spacing-md)',
                background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                color: '#ffffff',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                fontFamily: 'var(--font-family)',
                padding: '3px var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              Save $101/year
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Annual
                </span>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  $199.00/year
                </span>
              </div>

              {/* Radio indicator */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${annualSelected ? 'var(--color-accent-start)' : 'var(--color-border)'}`,
                  backgroundColor: annualSelected ? 'var(--color-accent-start)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
                {annualSelected && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                    }}
                  />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Premium Memory Add-on */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--spacing-md)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Premium Memory
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {selectedPlan === 'monthly' ? '+$6.25/month' : '+$50.00/year'}
              </span>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={addonEnabled}
              onClick={() => setAddonEnabled((prev) => !prev)}
              style={{
                width: '52px',
                height: '30px',
                minWidth: '52px',
                minHeight: '30px',
                borderRadius: '15px',
                border: 'none',
                backgroundColor: addonEnabled ? 'var(--color-accent-start)' : 'var(--color-disabled)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color var(--transition-fast)',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: addonEnabled ? '25px' : '3px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transition: 'left var(--transition-fast)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {getDisplayPrice()}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {selectedPlan === 'annual' ? 'Billed annually' : 'Billed monthly'}
          </span>
        </div>

        {/* Checkout Error */}
        {checkoutError && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-error)',
              backgroundColor: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              textAlign: 'center',
            }}
          >
            {checkoutError}
          </div>
        )}

        {/* Continue to Checkout Button */}
        <div
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={handleContinue}
            style={{
              width: '100%',
              height: 'var(--tap-target-min)',
              minHeight: 'var(--tap-target-min)',
              background: isLoading
                ? 'var(--color-disabled)'
                : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              color: isLoading ? 'var(--color-text-muted)' : '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-family)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'opacity var(--transition-fast)',
              opacity: isLoading ? 0.7 : 1,
            }}
            aria-busy={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Continue to Checkout'}
          </button>
        </div>
      </div>
    </main>
  );
}
