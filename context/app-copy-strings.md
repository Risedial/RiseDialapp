# App Copy Strings
**Role:** All exact user-facing strings — opening messages, error messages, UI labels, screen copy — prevents sub-agents from paraphrasing or approximating any user-visible text
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** Prompts 32–33, 35–45, 47
**Date:** 2026-05-02

---

## CRITICAL VALUES (Read before any other section)

Every string in this file is EXACT. Sub-agents must copy them character-for-character. No paraphrasing. No rewording. No punctuation changes.

---

## SECTION 1: OPENING MESSAGES

### First-ever chat opening message (exact)
```
Hello{name}. I'm Rise. I'm here to think with you — not to judge, validate, or push you anywhere. Just to reflect back what you actually mean, when you're ready to look at it. What's on your mind?
```

### Subsequent new chats opening message (exact)
```
Welcome back{name}. I still remember where we left off. What's worth looking at today?
```

### Name injection rule (exact)
- `{name}` → `, [PreferredName]` when preferred name is set (comma + space + name)
- `{name}` → `` (empty string — no visible gap, no space, nothing) when no preferred name

**Examples:**
- With name "Alex": `Hello, Alex. I'm Rise. I'm here to think with you...`
- Without name: `Hello. I'm Rise. I'm here to think with you...`
- With name "Alex" (subsequent): `Welcome back, Alex. I still remember where we left off.`
- Without name (subsequent): `Welcome back. I still remember where we left off.`

---

## SECTION 2: ERROR MESSAGES

| Error | Exact user-facing string |
|---|---|
| Rate limit hit | `Rise needs a moment. Try again in a few seconds.` |
| Message truncated | `Your message was shortened to fit.` |
| Session expired | `Your session has expired. Sign in to continue.` |
| Generic server error | `Something went wrong. Please try again.` |
| Invalid credentials | `Invalid email or password.` |
| Email already exists | `An account with this email already exists.` |
| Password reset invalid | `This reset link is invalid or has expired.` |
| Preferred name too long | `Name must be 30 characters or fewer.` |
| Network offline | `You're offline. Check your connection.` |
| Global error boundary | `Something went wrong. Please refresh the page.` |
| Subscription gated chat | `Your subscription is required to continue.` |

---

## SECTION 3: CHECKOUT & SUBSCRIPTION SCREENS

| Context | Exact string |
|---|---|
| Checkout polling screen header | `Setting up your account...` |
| Checkout polling fallback (after 10 polls) | `Almost there — this is taking longer than expected` |
| Subscription locked screen | `Your access has paused. Resubscribe to continue.` |
| Subscription banner (mid-session) | `Your subscription has lapsed. Resubscribe to continue.` |
| Plan selection savings badge | `Save $101/year` |
| Resubscribe CTA button | `Resubscribe` |

---

## SECTION 4: ONBOARDING SCREEN

| Context | Exact string |
|---|---|
| Onboarding screen heading | `Rise is listening` |
| Name field label | `What should Rise call you?` |
| Name field subtext | `Optional. You can change this later in Settings.` |
| Continue button | `Continue` |
| Skip button | `Skip` |

---

## SECTION 5: CHAT UI

| Context | Exact string |
|---|---|
| First chat auto-title | `Your first conversation` |
| New chat placeholder title | `New conversation` |
| New message indicator | `New message ↓` |
| Delete chat confirmation | `Delete this conversation? This cannot be undone.` |
| Delete chat confirm button | `Delete` |
| Delete chat cancel button | `Cancel` |

---

## SECTION 6: SETTINGS SCREEN

| Context | Exact string |
|---|---|
| Settings page title | `Settings` |
| Profile section header | `Profile` |
| Subscription section header | `Subscription` |
| Chat Memories section header | `Chat Memories` |
| Account section header | `Account` |
| Preferred name saved confirmation | `Saved` |
| Manage billing button | `Manage Billing` |
| Log out button | `Log Out` |
| Delete account button | `Delete Account` |
| Delete account modal heading | `Delete your account?` |
| Delete account modal body | `This will permanently delete all your chats, memory profile, and account data. Your Stripe subscription will be cancelled immediately.` |
| Download data button | `Download my data` |
| Confirm delete button | `Yes, delete my account` |
| Cancel delete button | `Cancel` |

---

## SECTION 7: CHAT MEMORIES

| Context | Exact string |
|---|---|
| Empty memory state | `Your memory profile will appear here after your first extended conversation.` |
| Deleted chat entry format | `Deleted Chat — [date]` |
| View memory button | `View` |
| Download JSON button | `Download Raw JSON` |
| Memory modal close button | `Close` |
| Memory section: Core Themes | `Core Themes` |
| Memory section: Emotional Patterns | `Emotional Patterns` |
| Memory section: Worldview | `Worldview` |
| Memory section: Challenges | `Challenges` |
| Memory section: Values | `Values` |
| Memory section: Blindspots | `Blindspots` |
| Memory section: Memorable Statements | `Memorable Statements` |
| Memory section: Rise's Observations | `Rise's Observations` |

---

## SECTION 8: PREFERRED NAME INJECTION CONTEXT LINE

Used in the system prompt (appended after the frozen 99-line prompt when preferred name is set):

```
[User context: The user's preferred name is {name}. Use it naturally and sparingly — only when it adds warmth or specificity. Never use it gratuitously.]
```

Replace `{name}` with the actual preferred name value. This is appended to Message 1 (system) — not a separate message.

---

## SECTION 9: TIMESTAMP DISPLAY FORMAT

| Message age | Format |
|---|---|
| Same day | `4:32 PM` (local timezone, 12-hour with AM/PM) |
| Previous days | `Apr 22 · 4:32 PM` |

---

## USAGE INSTRUCTIONS FOR SUB-AGENTS

Before beginning any task in a fresh session:
1. Read this file in full
2. Copy strings EXACTLY as written — no punctuation changes, no capitalization changes
3. Name injection: `{name}` → `, [PreferredName]` (comma + space + name) OR empty string (no gap)
4. "Deleted Chat — [date]" format uses an em-dash (—) — this is correct for display only; Rise's responses must NOT use em-dashes
5. Do not add or remove spaces around the em-dash in "Deleted Chat — [date]"
6. If a string is not in this file, it is not a required exact string — write natural copy consistent with the tone (calm, clear, no guilt)
