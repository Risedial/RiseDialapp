'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const MAX_PREFERRED_NAME_LENGTH = 30;

interface InitializeResponse {
  chatId?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [preferredName, setPreferredName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInitialize = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/user/initialize', { method: 'POST' });
      if (!res.ok) return null;
      const data: InitializeResponse = await res.json();
      return data.chatId ?? null;
    } catch {
      return null;
    }
  }, []);

  const handleContinue = useCallback(async () => {
    setIsSubmitting(true);
    setError('');

    const trimmedName = preferredName.trim();

    if (trimmedName.length > MAX_PREFERRED_NAME_LENGTH) {
      setError('Name must be 30 characters or fewer.');
      setIsSubmitting(false);
      return;
    }

    if (trimmedName.length > 0) {
      try {
        const patchRes = await fetch('/api/user/preferred-name', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredName: trimmedName }),
        });
        if (!patchRes.ok) {
          setError('Something went wrong. Please try again.');
          setIsSubmitting(false);
          return;
        }
      } catch {
        setError('Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    const chatId = await handleInitialize();
    if (!chatId) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push(`/chat/${chatId}`);
  }, [preferredName, handleInitialize, router]);

  const handleSkip = useCallback(async () => {
    setIsSubmitting(true);
    setError('');

    const chatId = await handleInitialize();
    if (!chatId) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push(`/chat/${chatId}`);
  }, [handleInitialize, router]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPreferredName(e.target.value);
      if (error) setError('');
    },
    [error]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isSubmitting) {
        handleContinue();
      }
    },
    [isSubmitting, handleContinue]
  );

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
        {/* Brand mark */}
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <span
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
          </span>
        </div>

        {/* Heading — exact copy string */}
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Rise is listening
          </h1>
        </div>

        {/* Name field section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}
        >
          {/* Field label — exact copy string */}
          <label
            htmlFor="preferred-name"
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
            }}
          >
            What should Rise call you?
          </label>

          {/* Text input */}
          <input
            ref={inputRef}
            id="preferred-name"
            type="text"
            value={preferredName}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            placeholder="Your name or nickname"
            maxLength={MAX_PREFERRED_NAME_LENGTH}
            autoComplete="given-name"
            autoCapitalize="words"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 'var(--tap-target-min)',
              minHeight: 'var(--tap-target-min)',
              backgroundColor: 'var(--color-surface)',
              border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-normal)',
              paddingLeft: 'var(--spacing-md)',
              paddingRight: 'var(--spacing-md)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color var(--transition-fast)',
              opacity: isSubmitting ? 0.6 : 1,
            }}
            onFocus={(e) => {
              if (!error) {
                (e.currentTarget as HTMLInputElement).style.borderColor =
                  'var(--color-accent-start)';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                (e.currentTarget as HTMLInputElement).style.borderColor =
                  'var(--color-border)';
              }
            }}
          />

          {/* Field subtext — exact copy string */}
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Optional. You can change this later in Settings.
          </p>

          {/* Inline error */}
          {error && (
            <p
              role="alert"
              aria-live="polite"
              style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Continue button — exact copy string */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleContinue}
            style={{
              width: '100%',
              height: 'var(--tap-target-min)',
              minHeight: 'var(--tap-target-min)',
              background: isSubmitting
                ? 'var(--color-disabled)'
                : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              color: isSubmitting ? 'var(--color-text-muted)' : '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-family)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'opacity var(--transition-fast)',
              opacity: isSubmitting ? 0.7 : 1,
            }}
            aria-busy={isSubmitting}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }
            }}
          >
            Continue
          </button>

          {/* Skip button — exact copy string, prominent and guilt-free */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSkip}
            style={{
              width: '100%',
              height: 'var(--tap-target-min)',
              minHeight: 'var(--tap-target-min)',
              background: 'transparent',
              color: isSubmitting
                ? 'var(--color-text-muted)'
                : 'var(--color-text-secondary)',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'color var(--transition-fast), border-color var(--transition-fast)',
              opacity: isSubmitting ? 0.6 : 1,
            }}
            aria-busy={isSubmitting}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--color-text-primary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--color-text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--color-text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--color-border)';
              }
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </main>
  );
}
