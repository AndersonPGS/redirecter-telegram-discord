import axios from "axios";
import FormData from "form-data";
import { config } from "../utils/config-loader";

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
      author: { name: string; icon_url?: string };
      image?: { url: string };
    } = {
      color: 3407712, // Cor verde para a borda do embed
      author: {
        name: authorName,
      },
    };

    // Adiciona foto do perfil do usuário no author
    if (userProfilePhotoBuffer) {
      // Se tiver foto de perfil, usa como attachment
      embed.author.icon_url = "attachment://profile_photo.jpg";
    } else if (username) {
      // Se não tiver foto, usa placeholder com iniciais do usuário
      // Remove caracteres especiais e pega as iniciais
      const initials = username
        .split(/[\s\-_]+/)
        .map(word => word.charAt(0).toUpperCase())
        .filter(char => /[A-Z0-9]/.test(char))
        .slice(0, 2)
        .join("");
      
      if (initials) {
        // Usa UI Avatars API para gerar avatar com iniciais
        const encodedName = encodeURIComponent(username);
        embed.author.icon_url = `https://ui-avatars.com/api/?name=${encodedName}&size=128&background=random&color=fff&bold=true&length=${initials.length}`;
      }
    }

    // Monta a descrição: se for resposta, coloca a mensagem respondida primeiro (formatada como código)
    let descriptionParts: string[] = [];
    
    if (repliedMessageInfo) {
      // Usa 'diff' para destacar o nome do usuário (linhas com + ficam verdes no Discord)
      // O nome do usuário fica destacado em verde, a mensagem fica normal
      if (repliedMessageInfo.author) {
        const formattedText = `+ ${repliedMessageInfo.author}\n${repliedMessageInfo.text}`;
        descriptionParts.push(`\`\`\`diff\n${formattedText}\n\`\`\``);
      } else {
        // Se não tiver autor, usa formato simples
        descriptionParts.push(`\`\`\`\n${repliedMessageInfo.text}\n\`\`\``);
      }
    }

    // Adiciona a mensagem atual após a citação
    if (message && message.trim()) {
      if (descriptionParts.length > 0) {
        descriptionParts.push("\n"); // Linha em branco para separar
      }
      descriptionParts.push(message);
    }

    // Define a descrição completa
    if (descriptionParts.length > 0) {
      embed.description = descriptionParts.join("");
    }

    // Se tiver foto da mensagem ou foto do perfil, envia como multipart/form-data
    if (photoBuffer || userProfilePhotoBuffer) {
      const formData = new FormData();
      
      // Adiciona foto da mensagem se existir
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

        formData.append("file", photoBuffer, {
          filename: filename,
          contentType: contentType,
        });
      }

      // Adiciona foto do perfil se existir
      if (userProfilePhotoBuffer) {
        const profilePhotoContentType = userProfilePhotoMimeType || "image/jpeg";
        formData.append("file", userProfilePhotoBuffer, {
          filename: "profile_photo.jpg",
          contentType: profilePhotoContentType,
        });
      }

      formData.append("payload_json", JSON.stringify({ embeds: [embed] }));

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
