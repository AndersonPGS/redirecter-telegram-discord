import { NewMessageEvent } from "telegram/events/NewMessage";
import { Api } from "telegram/tl";
import { TelegramClient } from "telegram";
import { sendToDiscord } from "../functions/discord-webhook";
import { QueueManager } from "../utils/queue-manager";

export async function handleProcessMessage(
  event: NewMessageEvent,
  groupWebhookMap: Map<bigint, string>,
  client: TelegramClient,
  queueManager: QueueManager
) {
  const message = event.message;

  const chatId = message.chatId;

  if (!chatId) {
    return;
  }

  const chatIdBigInt = BigInt(chatId.toString());

  // Normaliza o ID do grupo para usar na fila
  const normalizedGroupId = queueManager.normalizeGroupId(chatIdBigInt, groupWebhookMap);
  
  if (!normalizedGroupId) {
    return;
  }

  // Busca o webhook URL correspondente ao grupo
  const webhookUrl = groupWebhookMap.get(normalizedGroupId);

  if (webhookUrl) {
    // Adiciona a mensagem à fila do grupo para processamento sequencial
    await queueManager.enqueue(normalizedGroupId, async () => {
      await processMessageContent(message, webhookUrl, client);
    });
  }
}

/**
 * Processa o conteúdo da mensagem e envia para o Discord
 */
async function processMessageContent(
  message: Api.Message,
  webhookUrl: string,
  client: TelegramClient
) {
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
  let userProfilePhotoBuffer: Buffer | undefined;
  let userProfilePhotoMimeType: string | undefined;

  // Apenas define username se for um usuário real
  if (sender instanceof Api.User) {
    username = sender.username || sender.firstName || undefined;
    
    // Tenta obter a foto do perfil do usuário
    try {
      if (sender.photo && sender.photo instanceof Api.UserProfilePhoto) {
        const profilePhoto = await client.downloadProfilePhoto(sender, {});
        if (profilePhoto instanceof Buffer) {
          userProfilePhotoBuffer = profilePhoto;
          userProfilePhotoMimeType = "image/jpeg"; // Fotos de perfil geralmente são JPEG
        }
      }
    } catch (error) {
      // Ignora erros ao obter foto do perfil (usuário pode não ter foto)
    }
  }

  // Obtém o nome do grupo
  const chat = await message.getChat();
  let groupName: string | undefined;
  if (chat instanceof Api.Chat) {
    groupName = chat.title || undefined;
  } else if (chat instanceof Api.Channel) {
    groupName = chat.title || undefined;
  }

  // Verifica se a mensagem é uma resposta e obtém informações da mensagem respondida
  let repliedMessageInfo: { text: string; author?: string } | undefined;
  if (message.replyTo && message.replyTo instanceof Api.MessageReplyHeader && message.replyTo.replyToMsgId && message.chatId) {
    try {
      const repliedMessages = await client.getMessages(message.chatId, {
        ids: message.replyTo.replyToMsgId,
      });
      
      if (repliedMessages && repliedMessages.length > 0) {
        const repliedMsg = repliedMessages[0];
        const repliedText = repliedMsg.message || "";
        const repliedSender = await repliedMsg.getSender();
        let repliedAuthor: string | undefined;
        
        if (repliedSender instanceof Api.User) {
          repliedAuthor = repliedSender.username || repliedSender.firstName || undefined;
        }
        
        // Limita o texto da mensagem respondida para não ficar muito longo
        let truncatedText = repliedText.trim();
        if (truncatedText.length > 150) {
          truncatedText = truncatedText.substring(0, 147) + "...";
        }
        
        if (truncatedText) {
          repliedMessageInfo = {
            text: truncatedText,
            author: repliedAuthor,
          };
        }
      }
    } catch (error) {
      // Ignora erros ao obter a mensagem respondida
    }
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
  await sendToDiscord(
    webhookUrl,
    messageText,
    username,
    photoBuffer,
    mimeType,
    groupName,
    repliedMessageInfo,
    userProfilePhotoBuffer,
    userProfilePhotoMimeType
  );
}
