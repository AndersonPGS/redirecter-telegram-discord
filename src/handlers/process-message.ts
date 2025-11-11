import { NewMessageEvent } from "telegram/events/NewMessage";
import { Api } from "telegram/tl";
import { sendToDiscord } from "../functions/discord-webhook";

export async function handleProcessMessage(
  event: NewMessageEvent,
  targetGroupId: bigint
) {
  const message = event.message;

  if (!message.message) {
    return;
  }

  const chatId = message.chatId;

  if (!chatId) {
    return;
  }

  const chatIdBigInt = BigInt(chatId.toString());
  const targetId = targetGroupId < 0n ? targetGroupId : -targetGroupId;

  if (
    chatIdBigInt === targetId ||
    chatIdBigInt === -targetId ||
    chatIdBigInt === targetGroupId
  ) {
    const messageText = message.message || "";

    if (!messageText) {
      return;
    }

    const sender = await message.getSender();
    let username: string | undefined;

    // Apenas define username se for um usuário real
    if (sender instanceof Api.User) {
      username = sender.username || sender.firstName || undefined;
    }

    await sendToDiscord(messageText, username);
  }
}
