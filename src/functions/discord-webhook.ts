import axios from "axios";

export async function sendToDiscord(message: string, username?: string) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

  if (!discordWebhookUrl) {
    console.error("❌ DISCORD_WEBHOOK_URL não configurado");
    return;
  }

  try {
    const embed: {
      description: string;
      color: number;
      author?: { name: string };
    } = {
      description: message,
      color: 0x00aa00, // Cor verde para a borda do embed
    };

    // Adiciona author apenas se tiver username
    if (username) {
      embed.author = {
        name: username,
      };
    }

    await axios.post(discordWebhookUrl, {
      embeds: [embed],
    });

    console.log("👾 Nova mensagem enviada para o Discord.");
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem para Discord:", error);
  }
}
