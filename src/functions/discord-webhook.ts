import axios from "axios";
import FormData from "form-data";
import { config } from "../utils/config-loader";

/**
 * Gera uma cor hexadecimal única baseada no nome do usuário
 * Sempre retorna a mesma cor para o mesmo nome
 * Funciona com emojis e caracteres especiais
 */
function generateUserColor(username: string): number {
  // Gera um hash simples do nome
  // charCodeAt funciona com emojis e caracteres especiais (retorna o código do caractere)
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const charCode = username.charCodeAt(i);
    hash = charCode + ((hash << 5) - hash);
    hash = hash & hash; // Converte para inteiro de 32 bits
  }
  
  // Converte o hash em uma cor hexadecimal
  // Usa apenas os bits mais significativos para garantir cores vibrantes
  const color = Math.abs(hash) % 0xFFFFFF;
  
  // Garante que a cor não seja muito escura (mínimo de brilho)
  // Converte RGB para HSL para verificar brilho
  const r = (color >> 16) & 0xFF;
  const g = (color >> 8) & 0xFF;
  const b = color & 0xFF;
  
  // Calcula o brilho (luminância)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Se a cor for muito escura (brilho < 100), ajusta para uma cor mais clara
  if (brightness < 100) {
    // Aumenta o brilho mantendo a matiz
    const factor = 100 / brightness;
    const newR = Math.min(255, Math.round(r * factor));
    const newG = Math.min(255, Math.round(g * factor));
    const newB = Math.min(255, Math.round(b * factor));
    return (newR << 16) | (newG << 8) | newB;
  }
  
  // Se a cor for muito clara (brilho > 200), escurece um pouco para melhor contraste
  if (brightness > 200) {
    const factor = 0.7; // Escurece 30%
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    return (newR << 16) | (newG << 8) | newB;
  }
  
  return color;
}

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

    // Gera uma cor única baseada no nome do usuário
    // Se não tiver username válido, usa cor padrão
    let embedColor = 3407712; // Cor padrão (verde)
    if (username && username.trim().length > 0) {
      // Verifica se o username tem pelo menos um caractere alfanumérico válido
      const hasValidChars = /[a-zA-Z0-9]/.test(username);
      if (hasValidChars) {
        embedColor = generateUserColor(username);
      }
      // Se não tiver caracteres válidos (só emojis/especiais), mantém cor padrão
    }

    const embed: {
      description?: string;
      color: number;
      author: { name: string; icon_url?: string };
      image?: { url: string };
    } = {
      color: embedColor,
      author: {
        name: authorName,
      },
    };

    // Adiciona foto do perfil do usuário no author
    if (userProfilePhotoBuffer) {
      // Se tiver foto de perfil, usa como attachment
      embed.author.icon_url = "attachment://profile_photo.jpg";
    } else if (username && username.trim().length > 0) {
      // Se não tiver foto, usa placeholder com iniciais do usuário
      // Remove caracteres especiais e pega as iniciais
      const initials = username
        .split(/[\s\-_]+/)
        .map(word => {
          // Pega o primeiro caractere alfanumérico de cada palavra
          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            if (/[a-zA-Z0-9]/.test(char)) {
              return char.toUpperCase();
            }
          }
          return null;
        })
        .filter(char => char !== null)
        .slice(0, 2)
        .join("");
      
      if (initials) {
        // Verifica se o username tem caracteres válidos para gerar cor
        const hasValidChars = /[a-zA-Z0-9]/.test(username);
        let colorHex = "3407712"; // Cor padrão (verde)
        
        if (hasValidChars) {
          // Gera a cor única do usuário para usar no placeholder
          const userColor = generateUserColor(username);
          // Converte a cor para hexadecimal sem o prefixo 0x
          colorHex = userColor.toString(16).padStart(6, '0');
        }
        
        // Usa UI Avatars API para gerar avatar com iniciais e cor única do usuário
        // encodeURIComponent trata emojis e caracteres especiais corretamente
        const encodedName = encodeURIComponent(username);
        embed.author.icon_url = `https://ui-avatars.com/api/?name=${encodedName}&size=128&background=${colorHex}&color=fff&bold=true&length=${initials.length}`;
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
