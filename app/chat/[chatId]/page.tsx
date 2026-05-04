'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

/* ============================================================
 * Types
 * ============================================================ */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface MessagesApiResponse {
  messages: Message[];
}

interface SendApiResponse {
  message: Message;
}

/* ============================================================
 * Markdown renderer — bold, italic, line-breaks only
 * ============================================================ */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

/* ============================================================
 * Timestamp formatter
 * Per copy strings: same day → "4:32 PM", previous → "Apr 22 · 4:32 PM"
 * ============================================================ */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isSameDay) {
    return timePart;
  }

  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${datePart} · ${timePart}`;
}

/* ============================================================
 * Rise Avatar — circular, "R" fallback initials
 * ============================================================ */
function RiseAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background:
          'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size < 36 ? 'var(--font-size-sm)' : 'var(--font-size-md)',
        fontWeight: 'var(--font-weight-semibold)',
        color: '#ffffff',
        fontFamily: 'var(--font-family)',
        flexShrink: 0,
      }}
    >
      R
    </div>
  );
}

/* ============================================================
 * Typing indicator — three animated dots
 * ============================================================ */
const TYPING_KEYFRAMES = `
@keyframes rise-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%            { transform: translateY(-5px); opacity: 1; }
}
`;

function TypingIndicator() {
  return (
    <>
      <style>{TYPING_KEYFRAMES}</style>
      <div
        role="status"
        aria-label="Rise is typing"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
        }}
      >
        <RiseAvatar size={28} />
        <div
          style={{
            backgroundColor: 'var(--color-rise-bubble)',
            borderRadius: 'var(--radius-bubble)',
            borderBottomLeftRadius: 'var(--spacing-xs)',
            padding: '10px var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--color-text-secondary)',
                animation: `rise-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
 * User message bubble — right-aligned, gradient
 * ============================================================ */
function UserBubble({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        padding: 'var(--spacing-xs) var(--spacing-md)',
        gap: 'var(--spacing-xs)',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          background:
            'linear-gradient(135deg, var(--color-user-bubble-start), var(--color-user-bubble-end))',
          color: '#ffffff',
          borderRadius: 'var(--radius-bubble)',
          borderBottomRightRadius: 'var(--spacing-xs)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-normal)',
          lineHeight: '1.5',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </div>
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          paddingRight: 'var(--spacing-xs)',
        }}
      >
        {timestamp}
      </span>
    </div>
  );
}

/* ============================================================
 * Rise message bubble — left-aligned, surface color, markdown
 * ============================================================ */
function RiseBubble({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 'var(--spacing-xs) var(--spacing-md)',
        gap: 'var(--spacing-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--spacing-sm)',
          maxWidth: '80%',
        }}
      >
        <RiseAvatar size={28} />
        <div
          style={{
            backgroundColor: 'var(--color-rise-bubble)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-bubble)',
            borderBottomLeftRadius: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-normal)',
            lineHeight: '1.6',
            wordBreak: 'break-word',
            border: '1px solid var(--color-border)',
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          paddingLeft: 'calc(28px + var(--spacing-sm))',
        }}
      >
        {timestamp}
      </span>
    </div>
  );
}

/* ============================================================
 * Main Chat Page
 * ============================================================ */
export default function ChatPage() {
  const params = useParams();
  const chatId = params?.chatId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  /* ----------------------------------------------------------
   * Load messages on mount
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (!chatId) return;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (!res.ok) {
          setLoadError('Something went wrong. Please try again.');
          return;
        }
        const data: MessagesApiResponse = await res.json();
        setMessages(data.messages ?? []);
      } catch {
        setLoadError('You\'re offline. Check your connection.');
      }
    }

    loadMessages();
  }, [chatId]);

  /* ----------------------------------------------------------
   * Auto-scroll to bottom when messages load or new messages arrive
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (isScrolledToBottomRef.current) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  /* ----------------------------------------------------------
   * Track scroll position to show/hide new message indicator
   * ---------------------------------------------------------- */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isScrolledToBottomRef.current = distanceFromBottom < 60;
    if (isScrolledToBottomRef.current) {
      setShowNewMessageIndicator(false);
    }
  }, []);

  /* ----------------------------------------------------------
   * Textarea auto-resize (1 to 5 rows)
   * ---------------------------------------------------------- */
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const paddingV = 20;
    const maxHeight = lineHeight * 5 + paddingV;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      if (sendError) setSendError('');
      resizeTextarea();
    },
    [sendError, resizeTextarea]
  );

  /* ----------------------------------------------------------
   * Send message
   * ---------------------------------------------------------- */
  const sendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const optimisticUserMsg: Message = {
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputValue('');
    setSendError('');
    setIsSending(true);
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }

    // Scroll to bottom for sent message
    isScrolledToBottomRef.current = true;
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const res = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      setIsTyping(false);

      if (!res.ok) {
        if (res.status === 429) {
          setSendError('Rise needs a moment. Try again in a few seconds.');
        } else {
          setSendError('Something went wrong. Please try again.');
        }
        setIsSending(false);
        return;
      }

      const data: SendApiResponse = await res.json();

      setMessages((prev) => {
        // Replace optimistic user message with confirmed, then add Rise response
        const withoutOptimistic = prev.filter(
          (m) => m.id !== optimisticUserMsg.id
        );
        return [...withoutOptimistic, optimisticUserMsg, data.message];
      });

      // If user has scrolled up, show the new message indicator
      if (!isScrolledToBottomRef.current) {
        setShowNewMessageIndicator(true);
      }
    } catch {
      setIsTyping(false);
      setSendError('You\'re offline. Check your connection.');
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, chatId]);

  /* ----------------------------------------------------------
   * Keyboard: Enter sends (Shift+Enter = newline)
   * ---------------------------------------------------------- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  /* ----------------------------------------------------------
   * Scroll-to-bottom when clicking new message indicator
   * ---------------------------------------------------------- */
  const handleNewMessageIndicatorClick = useCallback(() => {
    isScrolledToBottomRef.current = true;
    setShowNewMessageIndicator(false);
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ----------------------------------------------------------
   * Sidebar trigger (opens drawer — implemented in step-41)
   * ---------------------------------------------------------- */
  const handleSidebarOpen = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const isSendDisabled = inputValue.trim().length === 0 || isSending;

  /* ----------------------------------------------------------
   * Render
   * ---------------------------------------------------------- */
  return (
    <>
      {/* Global styles for this page */}
      <style>{`
        /* iOS Safari keyboard height fix */
        .chat-page-root {
          height: 100dvh;
          height: -webkit-fill-available;
        }
        /* Disable pull-to-refresh */
        .chat-scroll-area {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .chat-textarea {
          resize: none;
          overflow-y: hidden;
        }
        .chat-textarea:focus {
          outline: none;
          border-color: var(--color-accent-start) !important;
        }
        /* iOS keyboard safe area */
        @supports (padding-bottom: env(keyboard-inset-height)) {
          .chat-input-area {
            padding-bottom: calc(
              var(--spacing-sm) +
              env(safe-area-inset-bottom) +
              env(keyboard-inset-height, 0px)
            );
          }
        }
        @keyframes rise-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-message-enter {
          animation: rise-fade-in 180ms ease-out both;
        }
        /* Hide scrollbar on message area for cleaner mobile look */
        .chat-scroll-area::-webkit-scrollbar {
          display: none;
        }
        .chat-scroll-area {
          scrollbar-width: none;
        }
      `}</style>

      <div
        className="chat-page-root"
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ====================================================
         * HEADER
         * ==================================================== */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
          {/* Rise identity: avatar + name + online dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <RiseAvatar size={36} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                }}
              >
                Rise
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                }}
              >
                {/* Green online dot */}
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-online)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-online)',
                    fontWeight: 'var(--font-weight-normal)',
                  }}
                >
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar trigger icon button */}
          <button
            type="button"
            onClick={handleSidebarOpen}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
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
            {/* Hamburger / menu lines */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <line
                x1="3"
                y1="6"
                x2="19"
                y2="6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="11"
                x2="19"
                y2="11"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="16"
                x2="19"
                y2="16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ====================================================
         * SCROLLABLE MESSAGE LIST
         * ==================================================== */}
        <div
          ref={scrollContainerRef}
          className="chat-scroll-area"
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'var(--spacing-md)',
            paddingBottom: 'var(--spacing-sm)',
          }}
        >
          {/* Load error state */}
          {loadError && (
            <div
              role="alert"
              style={{
                margin: 'var(--spacing-lg) var(--spacing-md)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-error)',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'center',
              }}
            >
              {loadError}
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, idx) => {
            const ts = formatTimestamp(msg.createdAt);
            const isLast = idx === messages.length - 1;
            return (
              <div key={msg.id} className={isLast ? 'chat-message-enter' : undefined}>
                {msg.role === 'user' ? (
                  <UserBubble content={msg.content} timestamp={ts} />
                ) : (
                  <RiseBubble content={msg.content} timestamp={ts} />
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-message-enter">
              <TypingIndicator />
            </div>
          )}

          {/* Bottom anchor for auto-scroll */}
          <div ref={bottomAnchorRef} style={{ height: 1 }} />
        </div>

        {/* ====================================================
         * NEW MESSAGE INDICATOR
         * ==================================================== */}
        {showNewMessageIndicator && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(80px + var(--spacing-sm) + env(safe-area-inset-bottom))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 'var(--z-overlay)',
              animation: 'rise-fade-in 200ms ease-out both',
            }}
          >
            <button
              type="button"
              onClick={handleNewMessageIndicatorClick}
              style={{
                background:
                  'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xs) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                minHeight: 'var(--tap-target-min)',
              }}
            >
              New message ↓
            </button>
          </div>
        )}

        {/* ====================================================
         * INPUT AREA
         * ==================================================== */}
        <div
          className="chat-input-area"
          style={{
            flexShrink: 0,
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--spacing-sm)',
            paddingBottom: `max(var(--spacing-sm), env(safe-area-inset-bottom))`,
            paddingLeft: 'var(--spacing-md)',
            paddingRight: 'var(--spacing-md)',
          }}
        >
          {/* Send error */}
          {sendError && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                marginBottom: 'var(--spacing-xs)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-error)',
                textAlign: 'center',
              }}
            >
              {sendError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'var(--spacing-sm)',
            }}
          >
            {/* Auto-expanding textarea */}
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Rise..."
              rows={1}
              disabled={isSending}
              aria-label="Message input"
              style={{
                flex: 1,
                minHeight: 'var(--tap-target-min)',
                height: 'var(--tap-target-min)',
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--font-size-md)',
                fontWeight: 'var(--font-weight-normal)',
                lineHeight: '1.5',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: 'var(--spacing-md)',
                paddingRight: 'var(--spacing-md)',
                boxSizing: 'border-box',
                transition: 'border-color var(--transition-fast)',
                overflowY: 'hidden',
                opacity: isSending ? 0.7 : 1,
              }}
            />

            {/* Send button */}
            <button
              type="button"
              onClick={sendMessage}
              disabled={isSendDisabled}
              aria-label="Send message"
              style={{
                width: 'var(--tap-target-min)',
                height: 'var(--tap-target-min)',
                minWidth: 'var(--tap-target-min)',
                minHeight: 'var(--tap-target-min)',
                borderRadius: '50%',
                border: 'none',
                cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isSendDisabled
                  ? 'var(--color-disabled)'
                  : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                transition:
                  'background var(--transition-fast), opacity var(--transition-fast)',
                opacity: isSendDisabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSendDisabled) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSendDisabled) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                }
              }}
            >
              {/* Arrow up / send icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 3L10 17M10 3L5 8M10 3L15 8"
                  stroke={isSendDisabled ? 'var(--color-text-muted)' : '#ffffff'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
