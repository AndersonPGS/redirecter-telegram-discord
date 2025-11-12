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
    // Extrai o texto completo da mensagem, incluindo links das entidades
    let messageText = message.message || "";

    // Se houver entidades (como links), processa para incluir URLs completos
    if (message.entities && message.entities.length > 0) {
      const rawText = messageText;
      // Filtra apenas entidades TextUrl (links com texto customizado)
      const textUrlEntities = message.entities
        .filter(
          (e): e is Api.MessageEntityTextUrl =>
            e instanceof Api.MessageEntityTextUrl && !!e.url
        )
        .sort((a, b) => (a.offset || 0) - (b.offset || 0));

      // Reconstrói o texto substituindo TextUrl entities por formato markdown do Discord
      if (textUrlEntities.length > 0) {
        const parts: string[] = [];
        let lastIndex = 0;

        for (const entity of textUrlEntities) {
          const offset = entity.offset || 0;
          const length = entity.length || 0;
          const linkText = rawText.substring(offset, offset + length);

          // Adiciona o texto antes desta entidade
          if (offset > lastIndex) {
            parts.push(rawText.substring(lastIndex, offset));
          }

          // Adiciona o link em formato markdown do Discord: [texto](url)
          if (entity.url) {
            parts.push(`[${linkText}](${entity.url})`);
          }

          lastIndex = offset + length;
        }

        // Adiciona o texto restante após a última entidade
        if (lastIndex < rawText.length) {
          parts.push(rawText.substring(lastIndex));
        }

        messageText = parts.join("");
      }
    }

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
    let mimeType: string | undefined;

    // Tenta baixar a mídia se existir (foto, figurinha, etc)
    if (hasMedia) {
      try {
        // Verifica se é uma foto
        if (message.media instanceof Api.MessageMediaPhoto) {
          const downloaded = await client.downloadMedia(message, {});
          if (downloaded instanceof Buffer) {
            photoBuffer = downloaded;
            mimeType = "image/jpeg";
          }
        }
        // Verifica se é uma figurinha (sticker) - MessageMediaDocument com mimeType image/webp
        else if (message.media instanceof Api.MessageMediaDocument) {
          const document = message.media.document;
          if (document instanceof Api.Document) {
            // Verifica se é uma imagem (figurinha geralmente é webp)
            const isImage = document.mimeType?.startsWith("image/");
            if (isImage && document.mimeType) {
              const downloaded = await client.downloadMedia(message, {});
              if (downloaded instanceof Buffer) {
                photoBuffer = downloaded;
                mimeType = document.mimeType;
              }
            }
          }
        }
      } catch (error) {
        console.error("❌ Erro ao baixar mídia:", error);
      }
    }

    // Envia para Discord mesmo se não tiver texto, desde que tenha foto
    await sendToDiscord(messageText, username, photoBuffer, mimeType);
  }
}
