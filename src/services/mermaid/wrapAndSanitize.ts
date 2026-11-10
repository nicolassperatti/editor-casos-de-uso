/**
 * Utilidades para sanitizar texto y ajustar palabras en diagramas Mermaid.
 */

export function wrapAndSanitizeMermaidText(text: string, maxCharsPerLine = 44): string {
  if (!text || !text.trim()) return 'Sin especificar';

  // Limpiar caracteres que rompen la sintaxis de nodos o mensajes en Mermaid
  const clean = text
    .replace(/"/g, "'")
    .replace(/[[\]{}]/g, '')
    .replace(/;/g, ',')
    .replace(/:/g, ' -')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  });
  if (currentLine) lines.push(currentLine.trim());

  return lines.join('<br/>');
}

/**
 * Normaliza texto quitando tildes y pasando a minúsculas para clasificar direcciones.
 */
export function normalizeForMatching(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Extrae el número de paso entero de una referencia como "2.a", "Paso 3", "4b", etc.
 */
export function parseStepNumberFromRef(refStr: string, maxSteps: number): number | null {
  const match = String(refStr || '').match(/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (isNaN(num) || num < 1 || num > maxSteps) return null;
  return num;
}
