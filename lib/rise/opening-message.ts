const FIRST_CHAT_TEMPLATE =
  "Hello{name}. I'm Rise. I'm here to think with you. What's on your mind?";

const SUBSEQUENT_CHAT_TEMPLATE =
  "Welcome back{name}. I still remember where we left off. What's worth looking at today?";

export function getOpeningMessage(
  isFirstEverChat: boolean,
  preferredName: string | null
): string {
  const nameInsert = preferredName ? `, ${preferredName}` : "";
  const template = isFirstEverChat
    ? FIRST_CHAT_TEMPLATE
    : SUBSEQUENT_CHAT_TEMPLATE;
  return template.replace("{name}", nameInsert);
}
