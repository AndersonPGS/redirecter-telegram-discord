import axios from "axios";
import FormData from "form-data";
import { buildDiscordEmbed, EmbedData } from "../utils/embed-builder";

export async function sendToDiscord(
  webhookUrl: string,
  message: string,
  username?: string,
  photoBuffer?: Buffer,
  mimeType?: string,
  groupName?: string,
  repliedMessageInfo?: { text: string; author?: string },
  userProfilePhotoBuffer?: Buffer,
  userProfilePhotoMimeType?: string
) {
  if (!webhookUrl || webhookUrl.trim() === "") {
    console.error("❌ Webhook URL não configurado para este grupo");
    return;
  }

  try {
    // Constrói o embed usando a função utilitária
    const embedData: EmbedData = {
      message,
      username,
      groupName,
      photoBuffer,
      mimeType,
      repliedMessageInfo,
      userProfilePhotoBuffer,
      userProfilePhotoMimeType,
    };

    const { embed, attachments } = buildDiscordEmbed(embedData);

    // Se tiver attachments, envia como multipart/form-data
    if (attachments.length > 0) {
      const formData = new FormData();

      // Adiciona todos os attachments
      attachments.forEach(({ buffer, filename, contentType }) => {
        formData.append("file", buffer, {
          filename,
          contentType,
        });
      });

      formData.append("payload_json", JSON.stringify({ embeds: [embed] }));

      await axios.post(webhookUrl, formData, {
        headers: formData.getHeaders(),
      });
    } else {
      // Se não tiver attachments, envia apenas o embed
      await axios.post(webhookUrl, {
        embeds: [embed],
      });
    }

    console.log("👾 Nova mensagem enviada para o Discord.");
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem para Discord:", error);
  }
}
