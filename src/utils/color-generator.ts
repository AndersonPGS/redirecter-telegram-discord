/**
 * Gera uma cor hexadecimal única baseada em uma string
 * Sempre retorna a mesma cor para a mesma string
 * Funciona com emojis e caracteres especiais
 */
export function generateColorFromString(text: string): number {
  // Gera um hash simples do texto
  // charCodeAt funciona com emojis e caracteres especiais (retorna o código do caractere)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    hash = charCode + ((hash << 5) - hash);
    hash = hash & hash; // Converte para inteiro de 32 bits
  }
  
  // Converte o hash em uma cor hexadecimal
  // Usa apenas os bits mais significativos para garantir cores vibrantes
  const color = Math.abs(hash) % 0xFFFFFF;
  
  // Garante que a cor não seja muito escura (mínimo de brilho)
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

/**
 * Converte uma cor numérica para hexadecimal (string sem 0x)
 */
export function colorToHex(color: number): string {
  return color.toString(16).padStart(6, '0');
}

