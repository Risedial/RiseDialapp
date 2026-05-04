'use client';

import { useEffect, useCallback, useRef } from 'react';

/* ============================================================
 * Types
 * ============================================================ */
interface MemoryProfileData {
  coreThemes?: string[];
  emotionalPatterns?: string[];
  worldview?: string[];
  challenges?: string[];
  values?: string[];
  blindspots?: string[];
  memorableStatements?: string[];
  clinicalObservations?: string[];
}

interface MemoryProfile {
  version?: number;
  generatedAt?: string;
  lastUpdatedAt?: string;
  profile?: MemoryProfileData;
  [key: string]: unknown;
}

interface ChatMemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryProfile: MemoryProfile | null;
}

/* ============================================================
 * Section definitions for the 8 memory profile sections
 * ============================================================ */
interface SectionDef {
  key: keyof MemoryProfileData;
  label: string;
  emptyHint: string;
}

const SECTIONS: SectionDef[] = [
  {
    key: 'coreThemes',
    label: 'Core Themes',
    emptyHint: 'No core themes identified yet.',
  },
  {
    key: 'emotionalPatterns',
    label: 'Emotional Patterns',
    emptyHint: 'No emotional patterns identified yet.',
  },
  {
    key: 'worldview',
    label: 'Worldview',
    emptyHint: 'No worldview data identified yet.',
  },
  {
    key: 'challenges',
    label: 'Challenges',
    emptyHint: 'No challenges identified yet.',
  },
  {
    key: 'values',
    label: 'Values',
    emptyHint: 'No values identified yet.',
  },
  {
    key: 'blindspots',
    label: 'Blindspots',
    emptyHint: 'No blindspots identified yet.',
  },
  {
    key: 'memorableStatements',
    label: 'Memorable Statements',
    emptyHint: 'No memorable statements recorded yet.',
  },
  {
    key: 'clinicalObservations',
    label: "Rise's Observations",
    emptyHint: "No observations recorded yet.",
  },
];

/* ============================================================
 * Modal animation keyframes
 * ============================================================ */
const MODAL_STYLES = `
@keyframes memories-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes memories-panel-in {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
`;

/* ============================================================
 * Utility — check if a memory profile has any usable data
 * ============================================================ */
function hasProfileData(memoryProfile: MemoryProfile | null): boolean {
  if (!memoryProfile) return false;
  const data = memoryProfile.profile;
  if (!data) return false;
  return SECTIONS.some((s) => {
    const arr = data[s.key];
    return Array.isArray(arr) && arr.length > 0;
  });
}

/* ============================================================
 * Utility — format ISO date string for display
 * ============================================================ */
function formatDate(isoString: string | undefined): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/* ============================================================
 * Sub-component: MemorySection
 * ============================================================ */
interface MemorySectionProps {
  label: string;
  items: string[] | undefined;
  emptyHint: string;
}

function MemorySection({ label, items, emptyHint }: MemorySectionProps) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <section
      style={{
        marginBottom: 'var(--spacing-lg)',
      }}
    >
      <h3
        style={{
          margin: '0 0 var(--spacing-sm) 0',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-family)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </h3>

      {hasItems ? (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
          }}
        >
          {(items as string[]).map((item, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  marginTop: '3px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-start)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                  lineHeight: '1.55',
                  flex: 1,
                }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family)',
            fontStyle: 'italic',
          }}
        >
          {emptyHint}
        </p>
      )}
    </section>
  );
}

/* ============================================================
 * ChatMemoriesModal — main export
 * ============================================================ */
export default function ChatMemoriesModal({
  isOpen,
  onClose,
  memoryProfile,
}: ChatMemoriesModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileHasData = hasProfileData(memoryProfile);
  const profileData = memoryProfile?.profile ?? null;

  /* ----------------------------------------------------------
   * Close on Escape key
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /* ----------------------------------------------------------
   * Lock body scroll while modal is open
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /* ----------------------------------------------------------
   * Reset scroll position when modal opens
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  /* ----------------------------------------------------------
   * Download Raw JSON handler
   * ---------------------------------------------------------- */
  const handleDownload = useCallback(() => {
    if (!memoryProfile) return;

    const jsonString = JSON.stringify(memoryProfile, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rise-memory-profile.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Revoke URL after a short delay to allow download to start
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [memoryProfile]);

  /* ----------------------------------------------------------
   * Backdrop click handler
   * ---------------------------------------------------------- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const lastUpdated = formatDate(memoryProfile?.lastUpdatedAt);

  return (
    <>
      <style>{MODAL_STYLES}</style>

      {/* --------------------------------------------------------
       * Backdrop overlay
       * -------------------------------------------------------- */}
      <div
        aria-hidden="true"
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-modal)',
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          animation: 'memories-backdrop-in var(--transition-standard) ease-out both',
        }}
      />

      {/* --------------------------------------------------------
       * Modal panel container (for centering)
       * -------------------------------------------------------- */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memories-modal-title"
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'calc(var(--z-modal) + 1)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 'var(--spacing-md)',
          paddingBottom: 'max(var(--spacing-md), env(safe-area-inset-bottom))',
          pointerEvents: 'none',
        }}
      >
        {/* --------------------------------------------------------
         * Modal panel
         * -------------------------------------------------------- */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: 'min(88vh, 700px)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'memories-panel-in var(--transition-standard) ease-out both',
            pointerEvents: 'auto',
          }}
        >
          {/* ------------------------------------------------
           * Modal header
           * ------------------------------------------------ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-lg)',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <h2
                id="memories-modal-title"
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Memory Profile
              </h2>
              {lastUpdated && (
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  Last updated {lastUpdated}
                </span>
              )}
            </div>

            {/* Close button (X) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close memory profile"
              style={{
                width: 'var(--tap-target-min)',
                height: 'var(--tap-target-min)',
                minWidth: 'var(--tap-target-min)',
                minHeight: 'var(--tap-target-min)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: 0,
                flexShrink: 0,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--color-text-secondary)';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <line
                  x1="4"
                  y1="4"
                  x2="16"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="4"
                  x2="4"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* ------------------------------------------------
           * Scrollable body
           * ------------------------------------------------ */}
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--spacing-lg)',
              scrollbarWidth: 'none',
            }}
          >
            {/* Empty state — no profile or no data */}
            {!profileHasData ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 'var(--spacing-xl) var(--spacing-lg)',
                  gap: 'var(--spacing-md)',
                  minHeight: '180px',
                }}
              >
                {/* Memory icon */}
                <div
                  aria-hidden="true"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="var(--color-text-muted)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 10c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.5-1 2.5-3 3v1"
                      stroke="var(--color-text-muted)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="17.5" r="0.75" fill="var(--color-text-muted)" />
                  </svg>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)',
                    lineHeight: '1.6',
                    maxWidth: '320px',
                  }}
                >
                  Your memory profile will appear here after your first extended conversation.
                </p>
              </div>
            ) : (
              /* Profile data — render all 8 sections */
              <div>
                {SECTIONS.map((section) => (
                  <MemorySection
                    key={section.key}
                    label={section.label}
                    items={profileData ? profileData[section.key] : undefined}
                    emptyHint={section.emptyHint}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------------------------
           * Footer — Download Raw JSON button
           * Only shown when a profile exists (even if empty sections)
           * ------------------------------------------------ */}
          {memoryProfile !== null && (
            <div
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderTop: '1px solid var(--color-border)',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={handleDownload}
                aria-label="Download memory profile as JSON file"
                style={{
                  width: '100%',
                  minHeight: 'var(--tap-target-min)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)',
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition:
                    'color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.color = 'var(--color-text-primary)';
                  btn.style.borderColor = 'var(--color-text-muted)';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.color = 'var(--color-text-secondary)';
                  btn.style.borderColor = 'var(--color-border)';
                }}
              >
                {/* Download icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M8 2v8M5 7l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Download Raw JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
