import axios from "axios";
import FormData from "form-data";
import { config } from "../utils/config-loader";

export async function sendToDiscord(
  webhookUrl: string,
  message: string,
  username?: string,
  photoBuffer?: Buffer,
  mimeType?: string,
  groupName?: string
) {
  if (!webhookUrl || webhookUrl.trim() === "") {
    console.error("❌ Webhook URL não configurado para este grupo");
    return;
  }

  try {
    // Formata o nome do author: "username - groupName" ou apenas um deles
    let authorName = config.discord.defaultTitle;
    if (username && groupName) {
      authorName = `${username} - ${groupName}`;
    } else if (username) {
      authorName = username;
    } else if (groupName) {
      authorName = groupName;
    }

    const embed: {
      description?: string;
      color: number;
      author: { name: string };
      image?: { url: string };
    } = {
      color: 3407712, // Cor verde para a borda do embed
      author: {
        name: authorName,
      },
    };

    // Adiciona descrição apenas se tiver texto
    if (message && message.trim()) {
      embed.description = message;
    }

    // Se tiver foto, envia como multipart/form-data
    if (photoBuffer) {
      // Determina o filename e contentType baseado no mimeType
      const contentType = mimeType || "image/jpeg";
      let filename = "image.jpg";
      if (contentType === "image/webp") {
        filename = "image.webp";
      } else if (contentType === "image/png") {
        filename = "image.png";
      } else if (contentType === "image/gif") {
        filename = "image.gif";
      }

      // Adiciona a imagem no embed usando attachment://
      embed.image = {
        url: `attachment://${filename}`,
      };

      const formData = new FormData();
      formData.append("payload_json", JSON.stringify({ embeds: [embed] }));
      formData.append("file", photoBuffer, {
        filename: filename,
        contentType: contentType,
      });

      await axios.post(webhookUrl, formData, {
        headers: formData.getHeaders(),
      });
    } else {
      // Se não tiver foto, envia apenas o embed
      await axios.post(webhookUrl, {
        embeds: [embed],
      });
    }

    console.log("👾 Nova mensagem enviada para o Discord.");
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem para Discord:", error);
  }
}
