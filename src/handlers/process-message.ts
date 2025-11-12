import { NewMessageEvent } from "telegram/events/NewMessage";
import { Api } from "telegram/tl";
import { TelegramClient } from "telegram";
import { sendToDiscord } from "../functions/discord-webhook";

export async function handleProcessMessage(
  event: NewMessageEvent,
  targetGroupIds: bigint[],
  client: TelegramClient
) {
  const message = event.message;

  const chatId = message.chatId;

  if (!chatId) {
    return;
  }

  const chatIdBigInt = BigInt(chatId.toString());

  // Verifica se o chatId está na lista de grupos monitorados
  const isTargetGroup = targetGroupIds.some((targetGroupId) => {
    const targetId = targetGroupId < 0n ? targetGroupId : -targetGroupId;
    return (
      chatIdBigInt === targetId ||
      chatIdBigInt === -targetId ||
      chatIdBigInt === targetGroupId
    );
  });

  if (isTargetGroup) {
    const messageText = message.message || "";
    const hasText = !!messageText.trim();
    const hasMedia = !!message.media;

    // Ignora mensagens sem texto e sem mídia
    if (!hasText && !hasMedia) {
      return;
    }

    const sender = await message.getSender();
    let username: string | undefined;

    // Apenas define username se for um usuário real
    if (sender instanceof Api.User) {
      username = sender.username || sender.firstName || undefined;
    }

    let photoBuffer: Buffer | undefined;

    // Tenta baixar a mídia se existir (foto, vídeo, etc)
    if (hasMedia) {
      try {
        // Verifica se é uma foto
        if (message.media instanceof Api.MessageMediaPhoto) {
          const downloaded = await client.downloadMedia(message, {});
          if (downloaded instanceof Buffer) {
            photoBuffer = downloaded;
          }
        }
      } catch (error) {
        console.error("❌ Erro ao baixar mídia:", error);
      }
    }

    // Envia para Discord mesmo se não tiver texto, desde que tenha foto
    await sendToDiscord(messageText, username, photoBuffer);
  }
}
