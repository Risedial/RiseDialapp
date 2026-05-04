import 'server-only';

import OpenAI from 'openai';
import { env } from '@/lib/env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// ---------------------------------------------------------------------------
// Typed errors
// ---------------------------------------------------------------------------

export class OpenAITimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`OpenAI request timed out after ${timeoutMs}ms`);
    this.name = 'OpenAITimeoutError';
  }
}

export class OpenAIApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'OpenAIApiError';
  }
}

// ---------------------------------------------------------------------------
// callRise — non-streaming chat completion for the Rise coaching assistant
// ---------------------------------------------------------------------------

/**
 * Calls gpt-4o-mini in non-streaming mode with a Promise.race timeout guard.
 *
 * @param messages  Array of OpenAI chat message objects (role + content).
 * @param timeout   Milliseconds before the request is considered timed out.
 *                  Defaults to 30 000 ms.
 * @returns         The assistant reply string.
 * @throws          OpenAITimeoutError on timeout, OpenAIApiError on API failure.
 */
export async function callRise(
  messages: object[],
  timeout: number = 30000,
): Promise<string> {
  const apiCall = openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: false,
    messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new OpenAITimeoutError(timeout)), timeout),
  );

  let completion: OpenAI.Chat.ChatCompletion;
  try {
    completion = await Promise.race([apiCall, timeoutPromise]);
  } catch (err) {
    if (err instanceof OpenAITimeoutError) {
      throw err;
    }
    throw new OpenAIApiError(
      `OpenAI API call failed: ${err instanceof Error ? err.message : String(err)}`,
      err,
    );
  }

  const content = completion.choices[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new OpenAIApiError('OpenAI response contained no content string.');
  }

  return content;
}

// ---------------------------------------------------------------------------
// callCompression — JSON-mode completion for memory compression
// ---------------------------------------------------------------------------

/**
 * Calls the specified model expecting a JSON response.
 * Used by the memory compression pipeline.
 *
 * @param messages  Array of OpenAI chat message objects (role + content).
 * @param model     Model identifier: 'gpt-4o-mini' or 'gpt-4o'.
 * @returns         Parsed JSON object from the model response.
 * @throws          OpenAIApiError on API failure or invalid JSON.
 */
export async function callCompression(
  messages: object[],
  model: string,
): Promise<object> {
  let completion: OpenAI.Chat.ChatCompletion;
  try {
    completion = await openai.chat.completions.create({
      model,
      stream: false,
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: 'json_object' },
    });
  } catch (err) {
    throw new OpenAIApiError(
      `OpenAI compression call failed: ${err instanceof Error ? err.message : String(err)}`,
      err,
    );
  }

  const raw = completion.choices[0]?.message?.content;
  if (typeof raw !== 'string') {
    throw new OpenAIApiError('OpenAI compression response contained no content string.');
  }

  let parsed: object;
  try {
    parsed = JSON.parse(raw) as object;
  } catch (err) {
    throw new OpenAIApiError(
      `OpenAI compression response was not valid JSON: ${raw.slice(0, 200)}`,
      err,
    );
  }

  return parsed;
}
