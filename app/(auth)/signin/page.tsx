'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'signin' | 'signup';

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email: string;
  password: string;
}

function validateEmail(value: string): string {
  if (!value.trim()) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return 'Enter a valid email address.';
  return '';
}

function validatePassword(value: string): string {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return '';
}

export default function SignInPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signin');
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ email: '', password: '' });
  const [formError, setFormError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setForm({ email: '', password: '' });
    setFieldErrors({ email: '', password: '' });
    setFormError('');
    setTouched({ email: false, password: false });
  }, []);

  const handleChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        if (field === 'email') {
          setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        } else {
          setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }));
        }
      }

      if (formError) setFormError('');
    },
    [touched, formError]
  );

  const handleBlur = useCallback(
    (field: keyof FormState) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (field === 'email') {
        setFieldErrors((prev) => ({ ...prev, email: validateEmail(form.email) }));
      } else {
        setFieldErrors((prev) => ({ ...prev, password: validatePassword(form.password) }));
      }
    },
    [form]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const emailError = validateEmail(form.email);
      const passwordError = validatePassword(form.password);

      setTouched({ email: true, password: true });
      setFieldErrors({ email: emailError, password: passwordError });

      if (emailError || passwordError) return;

      setIsLoading(true);
      setFormError('');

      try {
        const endpoint = mode === 'signin' ? '/api/auth/signin' : '/api/auth/signup';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email.trim(), password: form.password }),
        });

        const data: unknown = await res.json();

        if (!res.ok) {
          if (res.status === 401 || res.status === 400) {
            if (
              mode === 'signup' &&
              typeof data === 'object' &&
              data !== null &&
              'code' in data &&
              (data as { code: string }).code === 'email_exists'
            ) {
              setFormError('An account with this email already exists.');
            } else {
              setFormError('Invalid email or password.');
            }
          } else {
            setFormError('Something went wrong. Please try again.');
          }
          return;
        }

        if (mode === 'signup') {
          router.push('/plan-selection');
          return;
        }

        // Sign in: check subscription_status
        const payload = data as {
          subscription_status?: string;
          lastChatId?: string;
        };

        const status = payload?.subscription_status;
        if (status === 'active' && payload?.lastChatId) {
          router.push(`/chat/${payload.lastChatId}`);
        } else if (status === 'active') {
          router.push('/onboarding');
        } else {
          router.push('/plan-selection');
        }
      } catch {
        setFormError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [form, mode, router]
  );

  const isSignIn = mode === 'signin';
  const heading = isSignIn ? 'Sign In' : 'Create Account';
  const submitLabel = isSignIn ? 'Sign In' : 'Create Account';
  const togglePrompt = isSignIn ? "Don't have an account?" : 'Already have an account?';
  const toggleLabel = isSignIn ? 'Create Account' : 'Sign In';

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
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xl)',
        }}
      >
        {/* Logo / Brand */}
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
            {heading}
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
          }}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}
          >
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                placeholder="you@example.com"
                aria-invalid={touched.email && !!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                style={{
                  height: 'var(--tap-target-min)',
                  minHeight: 'var(--tap-target-min)',
                  backgroundColor: 'var(--color-surface-raised)',
                  border: `1px solid ${touched.email && fieldErrors.email ? 'var(--color-error)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-md)',
                  padding: '0 var(--spacing-md)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              {touched.email && fieldErrors.email && (
                <span
                  id="email-error"
                  role="alert"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                  }}
                >
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                placeholder={isSignIn ? 'Enter your password' : 'Min. 8 characters'}
                aria-invalid={touched.password && !!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                style={{
                  height: 'var(--tap-target-min)',
                  minHeight: 'var(--tap-target-min)',
                  backgroundColor: 'var(--color-surface-raised)',
                  border: `1px solid ${touched.password && fieldErrors.password ? 'var(--color-error)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-md)',
                  padding: '0 var(--spacing-md)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              {touched.password && fieldErrors.password && (
                <span
                  id="password-error"
                  role="alert"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                  }}
                >
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Forgot Password — only in Sign In mode */}
            {isSignIn && (
              <div style={{ textAlign: 'right' }}>
                <Link
                  href="/reset-password"
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-accent-start)',
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Form-level Error */}
            {formError && (
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
                }}
              >
                {formError}
              </div>
            )}

            {/* Submit Button Container — safe-area-inset-bottom applied here */}
            <div
              style={{
                paddingBottom: 'env(safe-area-inset-bottom)',
                marginTop: 'var(--spacing-xs)',
              }}
            >
              <button
                type="submit"
                disabled={isLoading}
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
                {isLoading ? 'Please wait...' : submitLabel}
              </button>
            </div>
          </form>
        </div>

        {/* Mode Toggle */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          <span>{togglePrompt}</span>
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-accent-start)',
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              minHeight: 'var(--tap-target-min)',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {toggleLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
