import { TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { NewMessageEvent } from "telegram/events/NewMessage";
import dotenv from "dotenv";

import { config } from "./utils/config-loader";
import { isValidGroupId } from "./utils/validation";
import { handleDiscoverGroup } from "./handlers/discover-group";
import { handleProcessMessage } from "./handlers/process-message";

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const apiPhoneNumber = process.env.TELEGRAM_PHONE_NUMBER || "";
const apiPassword = process.env.TELEGRAM_PASSWORD || "";

if (!apiId || !apiHash || !apiPhoneNumber) {
  console.error("⛔ Variáveis de ambiente não configuradas corretamente!");
  process.exit(1);
}

const groupId = config.telegram.groupId;
const hasGroupId = isValidGroupId(groupId);

const stringSession = new StoreSession("session_tg");

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: config.telegram.connectionRetries,
});

async function main() {
  await client.start({
    phoneNumber: async () => apiPhoneNumber,
    password: async () => apiPassword,
    phoneCode: async () => {
      const code = await new Promise<string>((resolve) => {
        console.log("✍️ Digite o código de verificação recebido no Telegram:");
        process.stdin.once("data", (data) => {
          resolve(data.toString().trim());
        });
      });
      return code;
    },
    onError: (err) => console.error(err),
  });

  console.log("🤖 Cliente conectado.");

  if (!hasGroupId) {
    console.log("");
    console.log("🔍 Descobrindo grupos...");
    console.log("⚙️  Configure groupId em config.json após identificar o ID.");

    client.addEventHandler(handleDiscoverGroup, new NewMessage({}));
  } else {
    const targetGroupId = BigInt(groupId);
    console.log(`🔍 Monitorando grupo (${targetGroupId})`);

    client.addEventHandler(
      (event: NewMessageEvent) =>
        handleProcessMessage(event, targetGroupId, client),
      new NewMessage({})
    );
  }
}

main().catch(console.error);
