import { createChat } from '../db/chats';
import { createMessage } from '../db/messages';
import { updateUser } from '../db/users';
import { getOpeningMessage } from '../rise/opening-message';

const FIRST_CHAT_TITLE = 'Your first conversation';
const MAX_PREFERRED_NAME_LENGTH = 30;

/**
 * Initializes a new user's first chat and stores Rise's first-ever opening
 * message as the first assistant message in the database.
 *
 * Creates the chat titled "Your first conversation", inserts the opening
 * message with role='assistant' and user_message_index=null, and returns the
 * new chat's ID.
 */
export async function initializeNewUser(
  userId: string
): Promise<{ chatId: string }> {
  const chat = await createChat(userId, FIRST_CHAT_TITLE);

  const openingContent = getOpeningMessage(true, null);

  await createMessage(chat.id, 'assistant', openingContent);

  return { chatId: chat.id };
}

/**
 * Updates the preferred_name field on a user record.
 *
 * Validates that the name is 30 characters or fewer before writing.
 * Returns { success: true } on success.
 * Returns { success: false, error: "Name must be 30 characters or fewer." } if
 * validation fails.
 * Never surfaces raw database errors to the caller.
 */
export async function setPreferredName(
  userId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (name.length > MAX_PREFERRED_NAME_LENGTH) {
    return { success: false, error: 'Name must be 30 characters or fewer.' };
  }

  try {
    await updateUser(userId, { preferred_name: name });
    return { success: true };
  } catch {
    return { success: false };
  }
}
