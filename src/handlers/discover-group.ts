import { NewMessageEvent } from "telegram/events/NewMessage";
import { Api } from "telegram/tl";

export async function handleDiscoverGroup(event: NewMessageEvent) {
  const message = event.message;

  if (!message.message) {
    return;
  }

  const chatId = message.chatId;

  if (!chatId) {
    return;
  }

  const chat = await message.getChat();
  let chatName = "Desconhecido";

  if (chat instanceof Api.Chat) {
    chatName = chat.title || "Chat sem título";
  } else if (chat instanceof Api.Channel) {
    chatName = chat.title || "Canal sem título";
  }

  const chatIdBigInt = BigInt(chatId.toString());

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📱 Nome do Grupo: ${chatName}`);
  console.log(`🆔 ID do Grupo: ${chatIdBigInt}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

