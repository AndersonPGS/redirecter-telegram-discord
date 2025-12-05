export function isValidGroupId(id: string): boolean {
  if (!id || id.trim() === "" || id === "your_group_id") {
    return false;
  }
  try {
    BigInt(id);
    return true;
  } catch {
    return false;
  }
}

export function isValidWebhookUrl(url: string): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:" && urlObj.hostname.includes("discord.com");
  } catch {
    return false;
  }
}

export function hasValidGroupWebhooks(groupWebhooks: Record<string, string>): boolean {
  if (!groupWebhooks || typeof groupWebhooks !== "object") {
    return false;
  }
  
  const entries = Object.entries(groupWebhooks);
  if (entries.length === 0) {
    return false;
  }
  
  return entries.some(([groupId, webhookUrl]) => 
    isValidGroupId(groupId) && isValidWebhookUrl(webhookUrl)
  );
}
