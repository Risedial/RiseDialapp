'use client';

import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

/* ============================================================
 * Types
 * ============================================================ */
interface SubscriptionStatus {
  subscription_status: 'active' | 'lapsed' | 'cancelled';
  plan_type: 'monthly' | 'annual' | null;
  has_premium_memory: boolean;
  next_billing_date: string | null;
}

interface UserProfile {
  email: string;
  preferred_name: string | null;
}

interface SourceChat {
  chat_id: string;
  title: string | null;
  deleted: boolean;
  deleted_at: string | null;
  contributed_at: string;
}

interface MemoryProfile {
  id: string;
  profile_json: object;
  source_chats: SourceChat[];
  version: number;
  generated_at: string;
  last_updated_at: string;
}

/* ============================================================
 * Price display constants (from context/app-stripe-config.md)
 * Monthly premium add-on: +$6.25/month
 * Annual premium add-on:  +$50.00/year
 * ============================================================ */
const PREMIUM_ADDON_PRICE: Record<'monthly' | 'annual', string> = {
  monthly: '+$6.25/month',
  annual: '+$50.00/year',
};

/* ============================================================
 * Date formatter: "Apr 22, 2024"
 * ============================================================ */
function formatDate(isoString: string | null): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ============================================================
 * Plan display name
 * ============================================================ */
function planDisplayName(planType: 'monthly' | 'annual' | null): string {
  if (planType === 'monthly') return 'Monthly';
  if (planType === 'annual') return 'Annual';
  return '—';
}

/* ============================================================
 * Section wrapper
 * ============================================================ */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: 'var(--spacing-lg)',
      }}
    >
      <div
        style={{
          padding: 'var(--spacing-md) var(--spacing-md)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: 'var(--spacing-md)' }}>{children}</div>
    </section>
  );
}

/* ============================================================
 * Row: label + value
 * ============================================================ */
function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
        paddingTop: 'var(--spacing-sm)',
        paddingBottom: 'var(--spacing-sm)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-family)',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          flex: 1,
          justifyContent: 'flex-end',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Toggle switch component
 * ============================================================ */
function Toggle({
  checked,
  onChange,
  disabled,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        width: 44,
        height: 26,
        minWidth: 44,
        borderRadius: 13,
        backgroundColor: checked ? 'var(--color-accent-start)' : 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        transition: 'background-color var(--transition-fast)',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left var(--transition-fast)',
        }}
      />
    </button>
  );
}

/* ============================================================
 * ChatMemoriesModal — view memory data for a specific chat
 * ============================================================ */
function ChatMemoriesModal({
  chat,
  onClose,
}: {
  chat: SourceChat;
  onClose: () => void;
}) {
  const title = chat.deleted
    ? `Deleted Chat — ${formatDate(chat.deleted_at)}`
    : (chat.title ?? 'Untitled chat');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-memories-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-lg)',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--spacing-sm)',
          }}
        >
          <h2
            id="chat-memories-modal-title"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 'var(--tap-target-min)',
              height: 'var(--tap-target-min)',
              minWidth: 'var(--tap-target-min)',
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
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Meta info */}
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family)',
          }}
        >
          Contributed to memory profile on {formatDate(chat.contributed_at)}
        </div>

        {/* Scrollable content */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            scrollbarWidth: 'none',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family)',
              lineHeight: '1.6',
            }}
          >
            This chat contributed to your memory profile. Rise learned your communication style,
            preferences, and patterns from this conversation.
          </p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            minHeight: 'var(--tap-target-min)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * Delete Account Modal
 * ============================================================ */
function DeleteAccountModal({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const handleDownloadData = useCallback(async () => {
    if (isDownloadingData) return;
    setIsDownloadingData(true);
    try {
      const res = await fetch('/api/user/export-data', { method: 'GET' });
      if (!res.ok) {
        setIsDownloadingData(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `risedial-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingData(false);
    }
  }, [isDownloadingData]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-lg)',
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        <h2
          id="delete-account-modal-title"
          style={{
            margin: 0,
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family)',
          }}
        >
          Delete account?
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family)',
            lineHeight: '1.55',
          }}
        >
          This will permanently delete your account, cancel your subscription, and erase all
          your data including chats and your memory profile. This cannot be undone.
        </p>

        {/* GDPR data export option */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family)',
              lineHeight: '1.5',
            }}
          >
            Under GDPR and applicable privacy laws, you have the right to receive a copy of
            your data before deletion.
          </span>
          <button
            type="button"
            onClick={handleDownloadData}
            disabled={isDownloadingData || isDeleting}
            style={{
              alignSelf: 'flex-start',
              padding: '6px var(--spacing-sm)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: isDownloadingData || isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDownloadingData || isDeleting ? 0.6 : 1,
              transition: 'opacity var(--transition-fast)',
            }}
          >
            {isDownloadingData ? 'Downloading…' : 'Download my data'}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              flex: 1,
              minHeight: 'var(--tap-target-min)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.6 : 1,
              transition: 'opacity var(--transition-fast)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1,
              minHeight: 'var(--tap-target-min)',
              backgroundColor: 'var(--color-error)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
              transition: 'opacity var(--transition-fast)',
            }}
          >
            {isDeleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Main Settings Page
 * ============================================================ */
export default function SettingsPage() {
  const router = useRouter();

  /* ----------------------------------------------------------
   * Profile state
   * ---------------------------------------------------------- */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const nameSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ----------------------------------------------------------
   * Subscription state
   * ---------------------------------------------------------- */
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isTogglingPremium, setIsTogglingPremium] = useState(false);
  const [premiumToggleError, setPremiumToggleError] = useState('');
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState('');

  /* ----------------------------------------------------------
   * Memory state
   * ---------------------------------------------------------- */
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const [memoryError, setMemoryError] = useState('');
  const [viewingChat, setViewingChat] = useState<SourceChat | null>(null);

  /* ----------------------------------------------------------
   * Account state
   * ---------------------------------------------------------- */
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  /* ----------------------------------------------------------
   * General load error
   * ---------------------------------------------------------- */
  const [loadError, setLoadError] = useState('');

  /* ----------------------------------------------------------
   * Load profile + subscription on mount
   * ---------------------------------------------------------- */
  useEffect(() => {
    async function loadProfileAndSubscription() {
      try {
        const [profileRes, subRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/subscription/status'),
        ]);

        if (!profileRes.ok || !subRes.ok) {
          setLoadError('Something went wrong. Please refresh and try again.');
          return;
        }

        const profileData: UserProfile = await profileRes.json();
        const subData: SubscriptionStatus = await subRes.json();

        setProfile(profileData);
        setEditingName(profileData.preferred_name ?? '');
        setSubscription(subData);
      } catch {
        setLoadError("You're offline. Check your connection.");
      }
    }

    loadProfileAndSubscription();
  }, []);

  /* ----------------------------------------------------------
   * Load memory profile on mount
   * ---------------------------------------------------------- */
  useEffect(() => {
    async function loadMemory() {
      setIsLoadingMemory(true);
      try {
        const res = await fetch('/api/user/memory');
        if (res.status === 404) {
          setMemoryProfile(null);
          return;
        }
        if (!res.ok) {
          setMemoryError('Could not load memory profile.');
          return;
        }
        const { memory: data }: { memory: MemoryProfile } = await res.json();
        setMemoryProfile(data);
      } catch {
        setMemoryError('Could not load memory profile.');
      } finally {
        setIsLoadingMemory(false);
      }
    }

    loadMemory();
  }, []);

  /* ----------------------------------------------------------
   * Cleanup name saved timer
   * ---------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (nameSavedTimerRef.current) {
        clearTimeout(nameSavedTimerRef.current);
      }
    };
  }, []);

  /* ----------------------------------------------------------
   * Save preferred name on blur or Enter
   * ---------------------------------------------------------- */
  const handleNameSave = useCallback(async () => {
    if (isSavingName) return;
    const trimmed = editingName.trim();

    // If unchanged, just exit edit mode
    if (trimmed === (profile?.preferred_name ?? '')) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_name: trimmed || null }),
      });

      if (!res.ok) {
        setIsEditingName(false);
        setIsSavingName(false);
        return;
      }

      setProfile((prev) =>
        prev ? { ...prev, preferred_name: trimmed || null } : prev
      );
      setIsEditingName(false);

      // Show "Saved" confirmation briefly (2 seconds)
      setNameSaved(true);
      if (nameSavedTimerRef.current) clearTimeout(nameSavedTimerRef.current);
      nameSavedTimerRef.current = setTimeout(() => setNameSaved(false), 2000);
    } catch {
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  }, [isSavingName, editingName, profile]);

  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNameSave();
      }
      if (e.key === 'Escape') {
        setEditingName(profile?.preferred_name ?? '');
        setIsEditingName(false);
      }
    },
    [handleNameSave, profile]
  );

  /* ----------------------------------------------------------
   * Premium memory toggle
   * ---------------------------------------------------------- */
  const handlePremiumToggle = useCallback(
    async (enable: boolean) => {
      if (isTogglingPremium || !subscription) return;
      setPremiumToggleError('');
      setIsTogglingPremium(true);

      try {
        const res = await fetch('/api/subscription/premium-toggle', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enable }),
        });

        if (!res.ok) {
          const data = await res.json();
          setPremiumToggleError(
            data?.error ?? 'Could not update Premium Memory. Try again.'
          );
          return;
        }

        const data: { success: boolean; has_premium_memory: boolean } =
          await res.json();
        setSubscription((prev) =>
          prev ? { ...prev, has_premium_memory: data.has_premium_memory } : prev
        );
      } catch {
        setPremiumToggleError('Could not update Premium Memory. Try again.');
      } finally {
        setIsTogglingPremium(false);
      }
    },
    [isTogglingPremium, subscription]
  );

  /* ----------------------------------------------------------
   * Manage billing portal
   * ---------------------------------------------------------- */
  const handleManageBilling = useCallback(async () => {
    if (isOpeningPortal) return;
    setPortalError('');
    setIsOpeningPortal(true);

    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' });
      if (!res.ok) {
        setPortalError('Could not open billing portal. Try again.');
        return;
      }
      const data: { url: string } = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalError('Could not open billing portal. Try again.');
    } finally {
      setIsOpeningPortal(false);
    }
  }, [isOpeningPortal]);

  /* ----------------------------------------------------------
   * Download chat memory as JSON
   * ---------------------------------------------------------- */
  const handleDownloadChatMemory = useCallback(
    (chat: SourceChat) => {
      const filename = chat.deleted
        ? `memory-deleted-chat-${chat.chat_id.slice(0, 8)}.json`
        : `memory-${(chat.title ?? 'chat').replace(/\s+/g, '-').toLowerCase().slice(0, 40)}.json`;

      const blob = new Blob([JSON.stringify(chat, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  /* ----------------------------------------------------------
   * Log out
   * ---------------------------------------------------------- */
  const handleLogOut = useCallback(async () => {
    if (isLoggingOut) return;
    setLogoutError('');
    setIsLoggingOut(true);

    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' });
      if (!res.ok) {
        setLogoutError('Could not log out. Please try again.');
        setIsLoggingOut(false);
        return;
      }
      router.push('/signin');
    } catch {
      setLogoutError('Could not log out. Please try again.');
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  /* ----------------------------------------------------------
   * Delete account confirmation
   * ---------------------------------------------------------- */
  const handleDeleteAccountConfirm = useCallback(async () => {
    if (isDeletingAccount) return;
    setDeleteError('');
    setIsDeletingAccount(true);

    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data?.error ?? 'Could not delete account. Please try again.');
        setIsDeletingAccount(false);
        setShowDeleteModal(false);
        return;
      }
      // Account deleted — sign out and redirect
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/signin');
    } catch {
      setDeleteError('Could not delete account. Please try again.');
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  }, [isDeletingAccount, router]);

  /* ----------------------------------------------------------
   * Resolve source_chats array from memory profile
   * ---------------------------------------------------------- */
  const sourceChats: SourceChat[] =
    memoryProfile?.source_chats
      ? Array.isArray(memoryProfile.source_chats)
        ? (memoryProfile.source_chats as SourceChat[])
        : []
      : [];

  /* ----------------------------------------------------------
   * Render
   * ---------------------------------------------------------- */
  return (
    <>
      <style>{`
        .settings-name-input {
          background: var(--color-surface-raised);
          border: 1px solid var(--color-accent-start);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
          padding: 6px var(--spacing-sm);
          outline: none;
          min-width: 0;
          flex: 1;
          max-width: 180px;
          transition: border-color var(--transition-fast);
        }
        .settings-name-input:focus {
          border-color: var(--color-accent-start);
        }
        .settings-row-last {
          border-bottom: none !important;
        }
        @keyframes settings-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .settings-saved-badge {
          animation: settings-fade-in 180ms ease-out both;
        }
        .settings-scroll::-webkit-scrollbar { display: none; }
        .settings-scroll { scrollbar-width: none; }
      `}</style>

      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ====================================================
         * HEADER
         * ==================================================== */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            paddingTop: 'max(var(--spacing-md), env(safe-area-inset-top))',
            paddingBottom: 'var(--spacing-md)',
            paddingLeft: 'var(--spacing-md)',
            paddingRight: 'var(--spacing-md)',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
            zIndex: 'var(--z-base)',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              width: 'var(--tap-target-min)',
              height: 'var(--tap-target-min)',
              minWidth: 'var(--tap-target-min)',
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
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14 5L8 11L14 17"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Settings
          </h1>
        </header>

        {/* ====================================================
         * SCROLLABLE CONTENT
         * ==================================================== */}
        <div
          className="settings-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-lg) var(--spacing-md)',
            paddingBottom: 'max(var(--spacing-xl), env(safe-area-inset-bottom))',
            maxWidth: 560,
            width: '100%',
            alignSelf: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* General load error */}
          {loadError && (
            <div
              role="alert"
              style={{
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-error)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family)',
                textAlign: 'center',
              }}
            >
              {loadError}
            </div>
          )}

          {/* ================================================
           * SECTION 1: PROFILE
           * ============================================== */}
          <Section title="Profile">
            {/* Preferred Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-sm)',
                paddingBottom: 'var(--spacing-sm)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family)',
                  flexShrink: 0,
                }}
              >
                Preferred name
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  flex: 1,
                  justifyContent: 'flex-end',
                  minWidth: 0,
                }}
              >
                {isEditingName ? (
                  <input
                    className="settings-name-input"
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    disabled={isSavingName}
                    autoFocus
                    maxLength={80}
                    aria-label="Preferred name"
                    placeholder="Your name"
                  />
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: profile?.preferred_name
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-muted)',
                        fontFamily: 'var(--font-family)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {profile?.preferred_name ?? 'Not set'}
                    </span>
                    {nameSaved && (
                      <span
                        className="settings-saved-badge"
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-online)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-medium)',
                          flexShrink: 0,
                        }}
                      >
                        Saved
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      aria-label="Edit preferred name"
                      style={{
                        padding: '4px var(--spacing-sm)',
                        backgroundColor: 'var(--color-surface-raised)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'color var(--transition-fast)',
                        minHeight: 32,
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Email — display only */}
            <div
              className="settings-row-last"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-sm)',
                paddingBottom: 'var(--spacing-sm)',
                borderBottom: 'none',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family)',
                  flexShrink: 0,
                }}
              >
                Email
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {profile?.email ?? '—'}
              </span>
            </div>
          </Section>

          {/* ================================================
           * SECTION 2: SUBSCRIPTION
           * ============================================== */}
          <Section title="Subscription">
            {/* Plan */}
            <SettingsRow label="Plan">
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {planDisplayName(subscription?.plan_type ?? null)}
              </span>
            </SettingsRow>

            {/* Next billing date */}
            <SettingsRow label="Next billing date">
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {formatDate(subscription?.next_billing_date ?? null)}
              </span>
            </SettingsRow>

            {/* Premium Memory toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-sm)',
                paddingBottom: 'var(--spacing-sm)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  Premium Memory
                </span>
                {subscription?.plan_type && (
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    {PREMIUM_ADDON_PRICE[subscription.plan_type]}
                  </span>
                )}
              </div>
              <Toggle
                checked={subscription?.has_premium_memory ?? false}
                onChange={handlePremiumToggle}
                disabled={isTogglingPremium || !subscription}
                ariaLabel="Toggle Premium Memory"
              />
            </div>

            {/* Premium toggle error */}
            {premiumToggleError && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  padding: 'var(--spacing-xs) 0',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {premiumToggleError}
              </div>
            )}

            {/* Manage Billing button */}
            <div
              style={{
                paddingTop: 'var(--spacing-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)',
              }}
            >
              <button
                type="button"
                onClick={handleManageBilling}
                disabled={isOpeningPortal}
                style={{
                  width: '100%',
                  minHeight: 'var(--tap-target-min)',
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: isOpeningPortal ? 'not-allowed' : 'pointer',
                  opacity: isOpeningPortal ? 0.6 : 1,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                {isOpeningPortal ? 'Opening…' : 'Manage Billing'}
              </button>
              {portalError && (
                <span
                  role="alert"
                  aria-live="polite"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-family)',
                    textAlign: 'center',
                  }}
                >
                  {portalError}
                </span>
              )}
            </div>
          </Section>

          {/* ================================================
           * SECTION 3: CHAT MEMORIES
           * ============================================== */}
          <Section title="Chat Memories">
            {isLoadingMemory && (
              <div
                aria-label="Loading memory profile"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 52,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-raised)',
                      opacity: 0.5 - i * 0.1,
                    }}
                  />
                ))}
              </div>
            )}

            {!isLoadingMemory && memoryError && (
              <div
                role="alert"
                style={{
                  padding: 'var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {memoryError}
              </div>
            )}

            {!isLoadingMemory && !memoryError && sourceChats.length === 0 && (
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family)',
                  lineHeight: '1.55',
                  textAlign: 'center',
                  paddingTop: 'var(--spacing-sm)',
                  paddingBottom: 'var(--spacing-sm)',
                }}
              >
                Your memory profile will appear here after your first extended conversation.
              </p>
            )}

            {!isLoadingMemory && !memoryError && sourceChats.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-xs)',
                }}
              >
                {sourceChats.map((chat, idx) => {
                  const isLast = idx === sourceChats.length - 1;
                  const displayTitle = chat.deleted
                    ? `Deleted Chat — ${formatDate(chat.deleted_at)}`
                    : (chat.title ?? 'Untitled chat');

                  return (
                    <div
                      key={chat.chat_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--spacing-sm)',
                        paddingTop: 'var(--spacing-sm)',
                        paddingBottom: 'var(--spacing-sm)',
                        borderBottom: isLast
                          ? 'none'
                          : '1px solid var(--color-border)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          color: chat.deleted
                            ? 'var(--color-text-muted)'
                            : 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          minWidth: 0,
                          fontStyle: chat.deleted ? 'italic' : 'normal',
                        }}
                      >
                        {displayTitle}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          gap: 'var(--spacing-xs)',
                          flexShrink: 0,
                        }}
                      >
                        {/* View button */}
                        <button
                          type="button"
                          onClick={() => setViewingChat(chat)}
                          aria-label={`View memory from: ${displayTitle}`}
                          style={{
                            padding: '4px var(--spacing-sm)',
                            backgroundColor: 'var(--color-surface-raised)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-medium)',
                            cursor: 'pointer',
                            minHeight: 32,
                            transition: 'color var(--transition-fast)',
                          }}
                        >
                          View
                        </button>
                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadChatMemory(chat)}
                          aria-label={`Download memory from: ${displayTitle}`}
                          style={{
                            padding: '4px var(--spacing-sm)',
                            backgroundColor: 'var(--color-surface-raised)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-medium)',
                            cursor: 'pointer',
                            minHeight: 32,
                            transition: 'color var(--transition-fast)',
                          }}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* ================================================
           * SECTION 4: ACCOUNT
           * ============================================== */}
          <Section title="Account">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
              }}
            >
              {/* Log Out */}
              <button
                type="button"
                onClick={handleLogOut}
                disabled={isLoggingOut}
                style={{
                  width: '100%',
                  minHeight: 'var(--tap-target-min)',
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                  opacity: isLoggingOut ? 0.6 : 1,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                {isLoggingOut ? 'Logging out…' : 'Log Out'}
              </button>

              {logoutError && (
                <span
                  role="alert"
                  aria-live="polite"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-family)',
                    textAlign: 'center',
                  }}
                >
                  {logoutError}
                </span>
              )}

              {/* Delete Account */}
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeletingAccount}
                style={{
                  width: '100%',
                  minHeight: 'var(--tap-target-min)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: isDeletingAccount ? 'not-allowed' : 'pointer',
                  opacity: isDeletingAccount ? 0.6 : 1,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                Delete Account
              </button>

              {deleteError && (
                <span
                  role="alert"
                  aria-live="polite"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-family)',
                    textAlign: 'center',
                  }}
                >
                  {deleteError}
                </span>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* ====================================================
       * CHAT MEMORIES MODAL
       * ==================================================== */}
      {viewingChat && (
        <ChatMemoriesModal
          chat={viewingChat}
          onClose={() => setViewingChat(null)}
        />
      )}

      {/* ====================================================
       * DELETE ACCOUNT MODAL
       * ==================================================== */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccountConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeletingAccount}
        />
      )}
    </>
  );
}
