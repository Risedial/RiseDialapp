# Context File Template
**Purpose:** Template structure for domain reference files in `context/` directory
**Date:** 2026-03-26

---

## RULES BEFORE CREATING A CONTEXT FILE

**Create a context file when the knowledge is:**
- (a) Too large to embed repeatedly in each prompt
- (b) Immutable during the implementation phase
- (c) Referenced by multiple sub-agents
- (d) Domain-specific enough that Claude would need to infer or guess it

**Embed in the prompt directly when:**
- Task-specific knowledge used only once
- Knowledge is short enough to fit without padding the prompt excessively

**Naming convention:** `[domain-prefix]-[descriptor].[type]`
- Domain prefixes: `app-`, `build-`, `data-`, `ui-`, `pwa-`
- Descriptor types: `-architecture`, `-manifest`, `-inventory`, `-design-system`, `-technical`
- Extension: `.md` for documentation, `.css` for design tokens

---

## TEMPLATE: DOCUMENTATION CONTEXT FILE (`*.md`)

```markdown
# [Descriptive Title]
**Role:** [One-sentence description of what this file is and what it prevents]
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** [list other context files this one references, or "none"]
**Required by:** [list prompt files or agent types that load this file]
**Date:** YYYY-MM-DD

---

## CRITICAL VALUES (Read before any other section)

[Repeat the most important values from this file here — the values that, if wrong,
would invalidate the entire output. This redundancy is intentional: sub-agents
loading only this file must have the critical values without cross-referencing.]

[Example: If CSS section ordering is critical, repeat the full ordered list here
even if it's also in the main section below.]

---

## [Section 1: Primary Content]

[Main domain knowledge content for this file. Use exact values throughout.]
[No approximations. No ranges where exact values are known.]
[Include copy-paste-ready code blocks for any code content.]

```[language]
[exact code block ready for direct copy-paste into implementation]
```

---

## [Section 2: Secondary Content]

[Supporting domain knowledge.]

---

## [Section 3: Enumeration or Catalog, if applicable]

[For data inventory files: complete list with canonical IDs]
[For architecture files: all state machine fields with exact semantics]
[For design system files: all components with DOM structure and CSS]

| Canonical ID | Display Name | [Other Field] |
|---|---|---|
| [exact-id-01] | [Exact Name] | [exact value] |
| [exact-id-02] | [Exact Name] | [exact value] |

---

## USAGE INSTRUCTIONS FOR SUB-AGENTS

Before beginning any task in a fresh session:
1. Read this file in full
2. All [domain-specific values] used in output MUST match values in this file exactly
3. If a value in your prompt conflicts with a value in this file, this file takes precedence
4. Do not infer, approximate, or generate values for items listed in this file

[If this file has ordering requirements, state them here:]
ORDERING CONSTRAINT: [Name] must appear in EXACTLY this order:
1. [First item]
2. [Second item]
3. [Third item]
```

---

## TEMPLATE: CSS DESIGN TOKENS FILE (`design-tokens.css`)

```css
/* Design Tokens
 * Status: IMMUTABLE — do not modify during implementation phase
 * Required by: All sub-agents writing CSS
 * Source of truth for: colors, spacing, typography, easing
 * Date: YYYY-MM-DD
 */

:root {
  /* Colors */
  --color-primary: #[exact-hex];
  --color-primary-dark: #[exact-hex];
  --color-secondary: #[exact-hex];
  --color-background: #[exact-hex];
  --color-surface: #[exact-hex];
  --color-text-primary: #[exact-hex];
  --color-text-secondary: #[exact-hex];
  --color-border: #[exact-hex];
  --color-error: #[exact-hex];
  --color-success: #[exact-hex];

  /* Spacing */
  --spacing-xs: [N]px;
  --spacing-sm: [N]px;
  --spacing-md: [N]px;
  --spacing-lg: [N]px;
  --spacing-xl: [N]px;

  /* Typography */
  --font-family-primary: '[Font Name]', [fallback], sans-serif;
  --font-size-sm: [N]px;
  --font-size-md: [N]px;
  --font-size-lg: [N]px;
  --font-weight-normal: [N];
  --font-weight-bold: [N];

  /* Easing */
  --easing-standard: [easing-function];
  --easing-enter: [easing-function];
  --easing-exit: [easing-function];

  /* Transitions */
  --transition-fast: [duration] var(--easing-standard);
  --transition-standard: [duration] var(--easing-standard);

  /* Z-index layers */
  --z-base: [N];
  --z-overlay: [N];
  --z-modal: [N];
  --z-toast: [N];
}
```

---

## QUALITY CHECKS FOR ALL CONTEXT FILES

Before finalizing any context file, confirm:

- [ ] All values are exact — no approximations, no "approximately" language
- [ ] Critical values are redundantly present (repeated in Critical Values section AND main section)
- [ ] All code blocks are copy-paste ready — no placeholders remaining
- [ ] Immutability status is declared at the top
- [ ] Usage instructions for sub-agents are present
- [ ] Naming convention matches `[domain-prefix]-[descriptor].[type]`
- [ ] File does not reference files that are downstream (no circular dependencies)
