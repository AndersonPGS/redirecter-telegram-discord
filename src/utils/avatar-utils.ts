/**
 * Extrai as iniciais de um nome de usuário
 * Ignora emojis e caracteres especiais, pegando apenas letras e números
 */
export function extractInitials(username: string): string {
  return username
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
}

/**
 * Gera a URL do avatar placeholder usando UI Avatars API
 */
export function generatePlaceholderAvatarUrl(
  username: string,
  colorHex: string,
  initials: string
): string {
  const encodedName = encodeURIComponent(username);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=128&background=${colorHex}&color=fff&bold=true&length=${initials.length}`;
}

