/**
 * generateTitle
 *
 * Derives a clean, readable chat title from the user's first message.
 *
 * Rules applied in order:
 *  1. Strip all characters except alphanumeric, spaces, apostrophes, and hyphens.
 *  2. Collapse multiple consecutive spaces into one and trim leading/trailing whitespace.
 *  3. Truncate to at most 40 characters at a word boundary (never cuts mid-word).
 *     If the full cleaned string is 40 chars or fewer, it is kept as-is.
 *  4. Capitalise the first letter of the result.
 *
 * Returns the cleaned, truncated, capitalised string.
 * If the input is empty or reduces to an empty string after cleaning, returns
 * the fallback "Your first conversation" (the canonical first-chat title from
 * app-copy-strings.md, Section 5).
 */
export function generateTitle(firstMessage: string): string {
  const FALLBACK = "Your first conversation";
  const MAX_LENGTH = 40;

  if (!firstMessage || typeof firstMessage !== "string") {
    return FALLBACK;
  }

  // Step 1: Strip disallowed characters — keep alphanumeric, spaces,
  // apostrophes ('), and hyphens (-).
  const cleaned = firstMessage
    .replace(/[^a-zA-Z0-9 '\-]/g, " ")
    // Step 2: Collapse runs of whitespace and trim edges.
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length === 0) {
    return FALLBACK;
  }

  // Step 3: Truncate at word boundary.
  let truncated: string;
  if (cleaned.length <= MAX_LENGTH) {
    truncated = cleaned;
  } else {
    // Work with the substring up to MAX_LENGTH and find the last space so we
    // never cut a word in the middle.
    const candidate = cleaned.slice(0, MAX_LENGTH);
    const lastSpace = candidate.lastIndexOf(" ");

    if (lastSpace === -1) {
      // The first 40 characters contain no space — the entire cleaned string
      // must be one very long token.  Use the candidate as-is (it terminates
      // at exactly 40 chars, which is acceptable per the spec).
      truncated = candidate;
    } else {
      truncated = candidate.slice(0, lastSpace).trimEnd();
    }
  }

  if (truncated.length === 0) {
    return FALLBACK;
  }

  // Step 4: Capitalise the first letter.
  const titled = truncated.charAt(0).toUpperCase() + truncated.slice(1);

  return titled;
}
