# Step 06: M3-D — Fix D: Replace rate limiter read-modify-write with atomic RPC

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-06" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-06"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Apply Fix D from Module 3: Replace the read-modify-write pattern in `recordMessage` with a single atomic `supabaseServer.rpc('increment_message_count', { p_user_id: userId })` call.

Key values from context (do NOT invent):
- RPC function name: `increment_message_count` (from data-schema.md `rpc:increment_message_count`)
- RPC parameter name: `p_user_id` (from data-schema.md `rpc:increment_message_count.param`)
- Table name: `rate_limit_tracking` (from data-schema.md)
- Rate limit max: 60 messages (from data-schema.md `rate_limit_max_messages`)
- Window duration: 60 minutes (from data-schema.md `rate_limit_window_minutes`)
- Return shape of `checkRateLimit`: `{ allowed: boolean, remaining: number }` (from api-contracts.md)
- Exports required: `checkRateLimit`, `recordMessage` (from api-contracts.md `lib_rate_limit_exports`)

**Sub-step 1 — Read the current file:**
Read `C:\Users\Alexb\Documents\RiseDialapp\lib\rise\rate-limit.ts` in full before making any changes.

**Sub-step 2 — Write the corrected file:**
Write `C:\Users\Alexb\Documents\RiseDialapp\lib\rise\rate-limit.ts` with `recordMessage` replaced by a single RPC call. The `checkRateLimit` function and `getActiveWindow` helper are unchanged.

The complete file after Fix D:

```typescript
import { supabaseServer } from '@/lib/supabase/server';

const RATE_LIMIT_MAX = 60;
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

async function getActiveWindow(
  userId: string
): Promise<{ id: string; message_count: number; window_start: string } | null> {
  const windowCutoff = new Date(Date.now() - WINDOW_DURATION_MS).toISOString();

  const { data, error } = await supabaseServer
    .from('rate_limit_tracking')
    .select('id, message_count, window_start')
    .eq('user_id', userId)
    .gte('window_start', windowCutoff)
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to query rate_limit_tracking: ${error.message}`);
  }

  return data ?? null;
}

export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const window = await getActiveWindow(userId);

  if (!window) {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX - window.message_count);
  const allowed = window.message_count < RATE_LIMIT_MAX;

  return { allowed, remaining };
}

export async function recordMessage(userId: string): Promise<void> {
  const { error } = await supabaseServer.rpc('increment_message_count', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to record message: ${error.message}`);
  }
}
```

**Sub-step 3 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 4 — Commit:**
Stage: `git add lib/rise/rate-limit.ts`
Commit message: `fix(D): replace read-modify-write in recordMessage with atomic increment_message_count RPC`
Do not batch any other changes into this commit.

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\rise\rate-limit.ts` `recordMessage` function calls `supabaseServer.rpc('increment_message_count', { p_user_id: userId })`
- [ ] The file still exports `checkRateLimit` and `recordMessage`
- [ ] `checkRateLimit` still returns `{ allowed: boolean, remaining: number }`
- [ ] `getActiveWindow` helper is unchanged
- [ ] `npx tsc --noEmit` exits 0 after this change
- [ ] `git log --oneline` shows a new commit with message containing `fix(D)`
- [ ] No other files were modified

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-06" from pendingSteps to completedSteps
- Set steps["prompt-06"].status = "complete"
