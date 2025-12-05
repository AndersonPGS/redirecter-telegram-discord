import { config } from "./config-loader";
import { generateColorFromString, colorToHex } from "./color-generator";
import { extractInitials, generatePlaceholderAvatarUrl } from "./avatar-utils";

export interface EmbedData {
  message: string;
  username?: string;
  groupName?: string;
  photoBuffer?: Buffer;
  mimeType?: string;
  repliedMessageInfo?: { text: string; author?: string };
  userProfilePhotoBuffer?: Buffer;
  userProfilePhotoMimeType?: string;
}

export interface BuiltEmbed {
  embed: {
    description?: string;
    color: number;
    author: { name: string; icon_url?: string };
    image?: { url: string };
    footer?: { text: string };
  };
  attachments: Array<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }>;
}

/**
 * Constrói o embed do Discord com todas as informações formatadas
 */
export function buildDiscordEmbed(data: EmbedData): BuiltEmbed {
  const {
    message,
    username,
    groupName,
    photoBuffer,
    mimeType,
    repliedMessageInfo,
    userProfilePhotoBuffer,
    userProfilePhotoMimeType,
  } = data;

  // Define o nome do author (apenas username ou groupName como fallback)
  let authorName = config.discord.defaultTitle;
  if (username) {
    authorName = username;
  } else if (groupName) {
    authorName = groupName;
  }

  // Gera cor única baseada no username (se válido)
  let embedColor = 3407712; // Cor padrão (verde)
  if (username && username.trim().length > 0) {
    const hasValidChars = /[a-zA-Z0-9]/.test(username);
    if (hasValidChars) {
      embedColor = generateColorFromString(username);
    }
  }

  // Constrói o embed base
  const embed: BuiltEmbed["embed"] = {
    color: embedColor,
    author: {
      name: authorName,
    },
  };

  // Adiciona footer apenas se tiver username (para não duplicar groupName)
  if (groupName && username) {
    embed.footer = {
      text: groupName,
    };
  }

  // Configura foto do perfil do usuário
  if (userProfilePhotoBuffer) {
    embed.author.icon_url = "attachment://profile_photo.jpg";
  } else if (username && username.trim().length > 0) {
    const initials = extractInitials(username);
    if (initials) {
      const hasValidChars = /[a-zA-Z0-9]/.test(username);
      const colorHex = hasValidChars
        ? colorToHex(generateColorFromString(username))
        : "3407712"; // Cor padrão
      
      embed.author.icon_url = generatePlaceholderAvatarUrl(
        username,
        colorHex,
        initials
      );
    }
  }

  // Monta a descrição com mensagem respondida (se houver) e mensagem atual
  const descriptionParts: string[] = [];

  if (repliedMessageInfo) {
    if (repliedMessageInfo.author) {
      const formattedText = `+ ${repliedMessageInfo.author}\n${repliedMessageInfo.text}`;
      descriptionParts.push(`\`\`\`diff\n${formattedText}\n\`\`\``);
    } else {
      descriptionParts.push(`\`\`\`\n${repliedMessageInfo.text}\n\`\`\``);
    }
  }

  if (message && message.trim()) {
    if (descriptionParts.length > 0) {
      descriptionParts.push("\n");
    }
    descriptionParts.push(message);
  }

  if (descriptionParts.length > 0) {
    embed.description = descriptionParts.join("");
  }

  // Configura imagem da mensagem (se houver)
  const attachments: BuiltEmbed["attachments"] = [];

  if (photoBuffer) {
    const contentType = mimeType || "image/jpeg";
    let filename = "image.jpg";
    if (contentType === "image/webp") {
      filename = "image.webp";
    } else if (contentType === "image/png") {
      filename = "image.png";
    } else if (contentType === "image/gif") {
      filename = "image.gif";
    }

    embed.image = {
      url: `attachment://${filename}`,
    };

    attachments.push({
      buffer: photoBuffer,
      filename,
      contentType,
    });
  }

  // Adiciona foto do perfil como attachment (se houver)
  if (userProfilePhotoBuffer) {
    attachments.push({
      buffer: userProfilePhotoBuffer,
      filename: "profile_photo.jpg",
      contentType: userProfilePhotoMimeType || "image/jpeg",
    });
  }

  return { embed, attachments };
}

