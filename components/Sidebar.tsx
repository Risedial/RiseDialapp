'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  TouchEvent,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

/* ============================================================
 * Types
 * ============================================================ */
interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

interface ChatsApiResponse {
  chats: Chat[];
}

interface CreateChatApiResponse {
  chat: { id: string };
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ============================================================
 * Relative timestamp formatter
 * e.g. "2 hours ago", "Yesterday", "Apr 22"
 * ============================================================ */
function relativeTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ============================================================
 * Truncate text to ~50 chars with ellipsis
 * ============================================================ */
function truncatePreview(text: string, maxLength = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/* ============================================================
 * CSS keyframes for sidebar animation
 * ============================================================ */
const SIDEBAR_STYLES = `
@keyframes sidebar-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes sidebar-backdrop-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
`;

/* ============================================================
 * Delete confirmation dialog
 * ============================================================ */
interface DeleteConfirmProps {
  chatTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmDialog({
  chatTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmProps) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
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
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-lg)',
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        <h2
          id="delete-confirm-title"
          style={{
            margin: 0,
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family)',
          }}
        >
          Delete chat?
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family)',
            lineHeight: '1.5',
          }}
        >
          &ldquo;{truncatePreview(chatTitle, 40)}&rdquo; will be permanently deleted. This
          cannot be undone.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
          }}
        >
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
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Sidebar drawer component
 * ============================================================ */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* ----------------------------------------------------------
   * Derive the active chat ID from the current pathname
   * e.g. /chat/abc123 → "abc123"
   * ---------------------------------------------------------- */
  const activeChatId = pathname?.startsWith('/chat/')
    ? pathname.split('/chat/')[1]?.split('/')[0] ?? null
    : null;

  /* ----------------------------------------------------------
   * Touch gesture state refs (not needing re-render)
   * ---------------------------------------------------------- */
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  /* ----------------------------------------------------------
   * Load chat list when sidebar opens
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    async function fetchChats() {
      setIsLoadingChats(true);
      setLoadError('');
      try {
        const res = await fetch('/api/chats');
        if (!res.ok) {
          setLoadError('Could not load chats.');
          return;
        }
        const data: ChatsApiResponse = await res.json();
        setChats(data.chats ?? []);
      } catch {
        setLoadError('You\'re offline. Check your connection.');
      } finally {
        setIsLoadingChats(false);
      }
    }

    fetchChats();
  }, [isOpen]);

  /* ----------------------------------------------------------
   * Global swipe-right from left edge to open (handled in parent),
   * but we also handle swipe-left anywhere in sidebar to close.
   * ----------------------------------------------------------
   * Note: opening gesture is attached to the document and must
   * be lifted to the parent. We expose the handlers so the
   * parent (ChatPage) can wire the document-level listeners.
   * For self-contained usage we attach to the sidebar panel.
   * ---------------------------------------------------------- */
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartXRef.current;
      const diffY = Math.abs(touch.clientY - (touchStartYRef.current ?? 0));

      // Swipe-left to close: horizontal diff < -50px, mostly horizontal
      if (diffX < -50 && diffY < Math.abs(diffX)) {
        onClose();
      }

      touchStartXRef.current = null;
      touchStartYRef.current = null;
    },
    [onClose]
  );

  /* ----------------------------------------------------------
   * Global document-level touch listeners for swipe-right to open
   * These run even when sidebar is closed.
   * ---------------------------------------------------------- */
  const docTouchStartXRef = useRef<number | null>(null);
  const docTouchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    function onDocTouchStart(e: globalThis.TouchEvent) {
      const touch = e.touches[0];
      // Only track touches that start within 20px of left edge
      if (touch.clientX < 20) {
        docTouchStartXRef.current = touch.clientX;
        docTouchStartYRef.current = touch.clientY;
      } else {
        docTouchStartXRef.current = null;
        docTouchStartYRef.current = null;
      }
    }

    function onDocTouchEnd(e: globalThis.TouchEvent) {
      if (docTouchStartXRef.current === null || docTouchStartYRef.current === null) return;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - docTouchStartXRef.current;
      const diffY = Math.abs(touch.clientY - docTouchStartYRef.current);

      // Swipe-right: moved more than 50px horizontally, mostly horizontal
      if (!isOpen && diffX > 50 && diffY < diffX) {
        // Signal parent to open — we call onClose in reverse logic only if open,
        // so we need a separate callback. Since Sidebar controls its own state
        // via props, we trigger via a custom event the parent can optionally listen to.
        document.dispatchEvent(new CustomEvent('risedial:sidebar-open'));
      }

      docTouchStartXRef.current = null;
      docTouchStartYRef.current = null;
    }

    document.addEventListener('touchstart', onDocTouchStart, { passive: true });
    document.addEventListener('touchend', onDocTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onDocTouchStart);
      document.removeEventListener('touchend', onDocTouchEnd);
    };
  }, [isOpen]);

  /* ----------------------------------------------------------
   * Create new chat
   * ---------------------------------------------------------- */
  const handleNewChat = useCallback(async () => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        setIsCreatingChat(false);
        return;
      }
      const data: CreateChatApiResponse = await res.json();
      onClose();
      router.push(`/chat/${data.chat.id}`);
    } catch {
      setIsCreatingChat(false);
    }
  }, [isCreatingChat, onClose, router]);

  /* ----------------------------------------------------------
   * Navigate to a chat
   * ---------------------------------------------------------- */
  const handleChatClick = useCallback(
    (chatId: string) => {
      onClose();
      router.push(`/chat/${chatId}`);
    },
    [onClose, router]
  );

  /* ----------------------------------------------------------
   * Initiate delete — show confirmation dialog
   * ---------------------------------------------------------- */
  const handleDeleteRequest = useCallback(
    (e: React.MouseEvent, chatId: string) => {
      e.stopPropagation();
      setConfirmDeleteId(chatId);
    },
    []
  );

  /* ----------------------------------------------------------
   * Confirm delete — call DELETE API
   * ---------------------------------------------------------- */
  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDeleteId) return;
    setDeletingChatId(confirmDeleteId);
    try {
      const res = await fetch(`/api/chats/${confirmDeleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== confirmDeleteId));
        // If we just deleted the active chat, redirect to a new chat
        if (activeChatId === confirmDeleteId) {
          onClose();
          router.push('/');
        }
      }
    } finally {
      setDeletingChatId(null);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, activeChatId, onClose, router]);

  /* ----------------------------------------------------------
   * Cancel delete
   * ---------------------------------------------------------- */
  const handleDeleteCancel = useCallback(() => {
    setConfirmDeleteId(null);
  }, []);

  /* ----------------------------------------------------------
   * The chat being confirmed for deletion
   * ---------------------------------------------------------- */
  const chatBeingDeleted = confirmDeleteId
    ? chats.find((c) => c.id === confirmDeleteId)
    : null;

  /* ----------------------------------------------------------
   * Render
   * ---------------------------------------------------------- */
  return (
    <>
      <style>{SIDEBAR_STYLES}</style>

      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-sidebar)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            animation: 'sidebar-backdrop-in var(--transition-standard) ease-out both',
          }}
        />
      )}

      {/* Sidebar panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat history sidebar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'min(80vw, 320px)',
          zIndex: 'calc(var(--z-sidebar) + 1)',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform var(--transition-standard)`,
          willChange: 'transform',
          paddingTop: 'max(var(--spacing-md), env(safe-area-inset-top))',
          paddingBottom: 'max(var(--spacing-md), env(safe-area-inset-bottom))',
          overflowY: 'hidden',
        }}
      >
        {/* ------------------------------------------------
         * Sidebar header: title + close button
         * ------------------------------------------------ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 'var(--spacing-md)',
            paddingRight: 'var(--spacing-sm)',
            paddingBottom: 'var(--spacing-md)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Chats
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
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
            {/* X close icon */}
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
         * New Chat button
         * ------------------------------------------------ */}
        <div
          style={{
            padding: 'var(--spacing-md)',
            paddingBottom: 'var(--spacing-sm)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isCreatingChat}
            aria-label="Start a new chat"
            style={{
              width: '100%',
              minHeight: 'var(--tap-target-min)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              background: isCreatingChat
                ? 'var(--color-disabled)'
                : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: isCreatingChat ? 'not-allowed' : 'pointer',
              opacity: isCreatingChat ? 0.7 : 1,
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isCreatingChat) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCreatingChat) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }
            }}
          >
            {/* Plus icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <line
                x1="9"
                y1="2"
                x2="9"
                y2="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="9"
                x2="16"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {isCreatingChat ? 'Creating…' : 'New Chat'}
          </button>
        </div>

        {/* ------------------------------------------------
         * Chat list — scrollable
         * ------------------------------------------------ */}
        <div
          role="list"
          aria-label="Your chats"
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingLeft: 'var(--spacing-sm)',
            paddingRight: 'var(--spacing-sm)',
            paddingTop: 'var(--spacing-xs)',
            scrollbarWidth: 'none',
          }}
        >
          {/* Loading state */}
          {isLoadingChats && (
            <div
              aria-label="Loading chats"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 64,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-raised)',
                    opacity: 0.5 - i * 0.1,
                  }}
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoadingChats && loadError && (
            <div
              role="alert"
              style={{
                margin: 'var(--spacing-md) var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--color-surface-raised)',
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

          {/* Empty state */}
          {!isLoadingChats && !loadError && chats.length === 0 && (
            <div
              style={{
                padding: 'var(--spacing-lg) var(--spacing-md)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family)',
              }}
            >
              No chats yet. Start a new one.
            </div>
          )}

          {/* Chat items */}
          {!isLoadingChats &&
            !loadError &&
            chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isBeingDeleted = deletingChatId === chat.id;
              const preview = truncatePreview(chat.lastMessage ?? '', 50);
              const timestamp = relativeTimestamp(chat.updatedAt);

              return (
                <div
                  key={chat.id}
                  role="listitem"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-xs)',
                  }}
                >
                  {/* Chat item button */}
                  <button
                    type="button"
                    onClick={() => handleChatClick(chat.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Open chat: ${chat.title}`}
                    disabled={isBeingDeleted}
                    style={{
                      flex: 1,
                      minHeight: 'var(--tap-target-min)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      gap: 'var(--spacing-xs)',
                      padding: 'var(--spacing-sm) var(--spacing-sm)',
                      backgroundColor: isActive
                        ? 'var(--color-surface-raised)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid var(--color-border)'
                        : '1px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      cursor: isBeingDeleted ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      opacity: isBeingDeleted ? 0.5 : 1,
                      transition:
                        'background-color var(--transition-fast), border-color var(--transition-fast)',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive && !isBeingDeleted) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'var(--color-surface-raised)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && !isBeingDeleted) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'transparent';
                      }
                    }}
                  >
                    {/* Title row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 'var(--spacing-sm)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: isActive
                            ? 'var(--font-weight-semibold)'
                            : 'var(--font-weight-medium)',
                          color: isActive
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-family)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {chat.title || 'Untitled chat'}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-family)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {timestamp}
                      </span>
                    </div>

                    {/* Preview row */}
                    {preview && (
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-family)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%',
                          display: 'block',
                        }}
                      >
                        {preview}
                      </span>
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteRequest(e, chat.id)}
                    aria-label={`Delete chat: ${chat.title}`}
                    disabled={isBeingDeleted}
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
                      cursor: isBeingDeleted ? 'not-allowed' : 'pointer',
                      color: 'var(--color-text-muted)',
                      padding: 0,
                      flexShrink: 0,
                      transition: 'color var(--transition-fast)',
                      opacity: isBeingDeleted ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isBeingDeleted) {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          'var(--color-error)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isBeingDeleted) {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          'var(--color-text-muted)';
                      }
                    }}
                  >
                    {/* Trash icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Delete confirmation dialog — rendered outside sidebar panel so it overlays everything */}
      {confirmDeleteId && chatBeingDeleted && (
        <DeleteConfirmDialog
          chatTitle={chatBeingDeleted.title || 'Untitled chat'}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={deletingChatId === confirmDeleteId}
        />
      )}
    </>
  );
}
