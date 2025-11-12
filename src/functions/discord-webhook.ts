import axios from "axios";
import FormData from "form-data";
import { config } from "../utils/config-loader";

export async function sendToDiscord(
  message: string,
  username?: string,
  photoBuffer?: Buffer
) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

  if (!discordWebhookUrl) {
    console.error("❌ DISCORD_WEBHOOK_URL não configurado");
    return;
  }

  try {
    const embed: {
      description?: string;
      color: number;
      author: { name: string };
      image?: { url: string };
    } = {
      color: 0x00aa00, // Cor verde para a borda do embed
      author: {
        name: username || config.discord.defaultTitle,
      },
    };

    // Adiciona descrição apenas se tiver texto
    if (message && message.trim()) {
      embed.description = message;
    }

    // Se tiver foto, envia como multipart/form-data
    if (photoBuffer) {
      const filename = "image.jpg";

      // Adiciona a imagem no embed usando attachment://
      embed.image = {
        url: `attachment://${filename}`,
      };

      const formData = new FormData();
      formData.append("payload_json", JSON.stringify({ embeds: [embed] }));
      formData.append("file", photoBuffer, {
        filename: filename,
        contentType: "image/jpeg",
      });

      await axios.post(discordWebhookUrl, formData, {
        headers: formData.getHeaders(),
      });
    } else {
      // Se não tiver foto, envia apenas o embed
      await axios.post(discordWebhookUrl, {
        embeds: [embed],
      });
    }

    console.log("👾 Nova mensagem enviada para o Discord.");
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem para Discord:", error);
  }
}
