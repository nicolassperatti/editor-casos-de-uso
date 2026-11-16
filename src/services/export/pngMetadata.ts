import type { UseCaseData } from '../../types/useCase';
import type { UseCaseExportPayload, ImportedUseCaseResult } from './jsonStorage';
import { validateAndSanitizeImportedJson } from './jsonStorage';

export const PNG_KEYWORD = 'usecase-data';

// Firma estándar obligatoria de un archivo PNG (8 bytes)
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

// Tabla precalculada para CRC-32 (ISO 3309 / ITU-T V.42 / PNG spec)
const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c >>> 0;
  }
  return table;
})();

/**
 * Calcula el checksum CRC-32 para un rango de bytes.
 */
export function calculateCrc32(bytes: Uint8Array, offset: number, length: number): number {
  let crc = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Codifica una cadena UTF-8 a Base64 sin problemas con caracteres especiales (ñ, acentos, etc.).
 */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodifica una cadena Base64 a UTF-8.
 */
export function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Verifica si un arreglo de bytes comienza con la firma oficial de un archivo PNG.
 */
export function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return false;
  }
  return true;
}

/**
 * Inserta un chunk auxiliar tEXt con el caso de uso codificado en el buffer del archivo PNG,
 * colocado inmediatamente después del chunk IHDR (conforme a las especificaciones PNG y W3C).
 */
export function embedMetadataInPng(pngBytes: Uint8Array, payload: UseCaseExportPayload): Uint8Array {
  if (!isPng(pngBytes)) {
    throw new Error('El buffer proporcionado no es un archivo PNG válido');
  }

  const view = new DataView(pngBytes.buffer, pngBytes.byteOffset, pngBytes.byteLength);

  // El primer chunk en un PNG válido siempre es IHDR en el offset 8
  const ihdrLength = view.getUint32(8);
  const insertOffset = 8 + 4 + 4 + ihdrLength + 4; // 8 (firma) + 4 (len) + 4 ('IHDR') + ihdrLength + 4 (crc)

  if (insertOffset > pngBytes.length) {
    throw new Error('Encabezado IHDR de imagen PNG truncado o corrupto');
  }

  // Preparar payload JSON y codificar a Base64 puro para máxima compatibilidad con el chunk tEXt
  const jsonStr = JSON.stringify(payload);
  const base64Str = utf8ToBase64(jsonStr);

  const keywordBytes = new TextEncoder().encode(PNG_KEYWORD);
  const textBytes = new TextEncoder().encode(base64Str);

  // Formato tEXt: keyword (1-79 bytes) + null separator (0x00) + text
  const chunkDataLength = keywordBytes.length + 1 + textBytes.length;
  // Tamaño total del chunk: 4 (longitud) + 4 (tipo 'tEXt') + chunkDataLength + 4 (crc)
  const totalChunkLength = 4 + 4 + chunkDataLength + 4;

  const result = new Uint8Array(pngBytes.length + totalChunkLength);

  // 1. Copiar bytes iniciales hasta el fin de IHDR
  result.set(pngBytes.subarray(0, insertOffset), 0);

  // 2. Construir el nuevo chunk tEXt
  const resultView = new DataView(result.buffer, result.byteOffset, result.byteLength);
  let writePos = insertOffset;

  // Longitud de los datos del chunk (4 bytes big-endian)
  resultView.setUint32(writePos, chunkDataLength);
  writePos += 4;

  // Tipo de chunk 'tEXt' (4 bytes)
  const typeOffset = writePos;
  result[writePos++] = 116; // 't'
  result[writePos++] = 69;  // 'E'
  result[writePos++] = 88;  // 'X'
  result[writePos++] = 116; // 't'

  // Datos del chunk: keyword + 0x00 + texto Base64
  result.set(keywordBytes, writePos);
  writePos += keywordBytes.length;
  result[writePos++] = 0x00;
  result.set(textBytes, writePos);
  writePos += textBytes.length;

  // CRC-32 calculado sobre tipo (4 bytes) + datos (chunkDataLength bytes)
  const chunkCrc = calculateCrc32(result, typeOffset, 4 + chunkDataLength);
  resultView.setUint32(writePos, chunkCrc);
  writePos += 4;

  // 3. Copiar el resto del archivo PNG original (IDAT, IEND, etc.)
  result.set(pngBytes.subarray(insertOffset), writePos);

  return result;
}

/**
 * Intenta parsear un contenido de texto proveniente de un chunk tEXt o iTXt.
 * Soporta JSON directo, JSON codificado en Base64 o URL-encoded.
 */
function tryParseJsonOrBase64(content: string): unknown | null {
  const trimmed = content.trim();

  // Intento 1: Si ya es un objeto JSON plano {"...": ...}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Ignorar y probar Base64
    }
  }

  // Intento 2: Decodificar Base64 a UTF-8 y luego JSON
  try {
    const decoded = base64ToUtf8(trimmed);
    if (decoded.startsWith('{') && decoded.endsWith('}')) {
      return JSON.parse(decoded);
    }
  } catch {
    // Ignorar y probar URL decoded
  }

  // Intento 3: decodeURIComponent
  try {
    const unescaped = decodeURIComponent(trimmed);
    if (unescaped.startsWith('{') && unescaped.endsWith('}')) {
      return JSON.parse(unescaped);
    }
  } catch {
    // Ignorar
  }

  return null;
}

/**
 * Escanea los chunks de un PNG buscando metadatos de caso de uso (chunks tEXt o iTXt).
 * Retorna el resultado normalizado o null si no se encuentra información válida.
 */
export function extractMetadataFromPng(pngBytes: Uint8Array): ImportedUseCaseResult | null {
  if (!isPng(pngBytes)) {
    return null;
  }

  const view = new DataView(pngBytes.buffer, pngBytes.byteOffset, pngBytes.byteLength);
  let offset = 8; // Empezar justo después de la firma PNG

  while (offset + 8 <= pngBytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = String.fromCharCode(
      pngBytes[offset + 4],
      pngBytes[offset + 5],
      pngBytes[offset + 6],
      pngBytes[offset + 7]
    );

    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;

    if (dataEnd + 4 > pngBytes.length) {
      // Archivo truncado
      break;
    }

    if (chunkType === 'tEXt') {
      let nullIdx = -1;
      for (let i = dataStart; i < dataEnd; i++) {
        if (pngBytes[i] === 0) {
          nullIdx = i;
          break;
        }
      }

      if (nullIdx !== -1) {
        const keyword = new TextDecoder().decode(pngBytes.subarray(dataStart, nullIdx));
        const rawContent = new TextDecoder().decode(pngBytes.subarray(nullIdx + 1, dataEnd));

        const isMatchingKeyword =
          keyword === PNG_KEYWORD ||
          keyword === 'usecase-studio' ||
          keyword === 'application/json' ||
          keyword === 'usecase';

        if (isMatchingKeyword) {
          const parsed = tryParseJsonOrBase64(rawContent);
          if (parsed) {
            try {
              return validateAndSanitizeImportedJson(parsed);
            } catch {
              // Si falla la validación continuar buscando en otros chunks
            }
          }
        }
      }
    } else if (chunkType === 'iTXt') {
      let nullCount = 0;
      let textStart = -1;
      let keyword = '';

      for (let i = dataStart; i < dataEnd; i++) {
        if (pngBytes[i] === 0) {
          nullCount++;
          if (nullCount === 1) {
            keyword = new TextDecoder().decode(pngBytes.subarray(dataStart, i));
          } else if (nullCount === 3) {
            textStart = i + 1;
            break;
          }
        }
      }

      const isMatchingKeyword =
        keyword === PNG_KEYWORD ||
        keyword === 'usecase-studio' ||
        keyword === 'application/json' ||
        keyword === 'usecase';

      if (isMatchingKeyword && textStart !== -1 && textStart < dataEnd) {
        const rawContent = new TextDecoder().decode(pngBytes.subarray(textStart, dataEnd));
        const parsed = tryParseJsonOrBase64(rawContent);
        if (parsed) {
          try {
            return validateAndSanitizeImportedJson(parsed);
          } catch {
            // Ignorar y continuar
          }
        }
      }
    } else if (chunkType === 'IEND') {
      break;
    }

    // Avanzar al siguiente chunk: 4 (len) + 4 (type) + chunkLength + 4 (crc)
    offset += 12 + chunkLength;
  }

  return null;
}

/**
 * Inyecta el caso de uso y metadatos en un Blob de imagen PNG existente.
 */
export async function embedUseCaseInPngBlob(
  pngBlob: Blob,
  data: UseCaseData,
  theme = 'neon-pink',
  darkMode = true
): Promise<Blob> {
  const arrayBuffer = await pngBlob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const payload: UseCaseExportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    theme,
    darkMode,
    data,
  };

  const modifiedBytes = embedMetadataInPng(uint8, payload);
  return new Blob([modifiedBytes as unknown as BlobPart], { type: 'image/png' });
}

/**
 * Extrae y valida el caso de uso incrustado en un archivo o blob PNG.
 * Retorna null si el archivo no es un PNG o no contiene metadatos de caso de uso.
 */
export async function extractUseCaseFromPngFile(
  file: File | Blob
): Promise<ImportedUseCaseResult | null> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  return extractMetadataFromPng(uint8);
}
