import { describe, it, expect } from 'vitest';
import {
  isPng,
  calculateCrc32,
  utf8ToBase64,
  base64ToUtf8,
  embedMetadataInPng,
  extractMetadataFromPng,
} from '../export/pngMetadata';
import { DEFAULT_USE_CASE_DATA } from '../../constants/defaultData';
import type { UseCaseExportPayload } from '../export/jsonStorage';

/**
 * Genera una imagen PNG 1x1 mínima 100% válida según la especificación PNG.
 */
function createMinimalPng(): Uint8Array {
  return new Uint8Array([
    // Firma PNG (8 bytes)
    137, 80, 78, 71, 13, 10, 26, 10,
    // Chunk IHDR: longitud = 13 (0x0000000D), tipo = 'IHDR'
    0, 0, 0, 13,
    73, 72, 68, 82,
    // Datos IHDR: width=1, height=1, bitDepth=8, colorType=2 (RGB), comp=0, filter=0, interlace=0
    0, 0, 0, 1,
    0, 0, 0, 1,
    8, 2, 0, 0, 0,
    // CRC de IHDR (0x907753DE)
    0x90, 0x77, 0x53, 0xde,
    // Chunk IDAT: longitud = 12 (0x0000000C), tipo = 'IDAT'
    0, 0, 0, 12,
    73, 68, 65, 84,
    // Datos comprimidos zlib (1x1 pixel)
    120, 156, 99, 248, 207, 192, 0, 0, 3, 1, 1, 0,
    // CRC de IDAT (0x18DD8DB0)
    0x18, 0xdd, 0x8d, 0xb0,
    // Chunk IEND: longitud = 0, tipo = 'IEND'
    0, 0, 0, 0,
    73, 69, 78, 68,
    // CRC de IEND (0xAE426082)
    0xae, 0x42, 0x60, 0x82,
  ]);
}

describe('Incrustación de Metadatos PNG (Estilo Excalidraw)', () => {
  it('debe detectar correctamente firmas PNG válidas e inválidas', () => {
    const validPng = createMinimalPng();
    expect(isPng(validPng)).toBe(true);

    const invalidBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(isPng(invalidBytes)).toBe(false);

    expect(isPng(new Uint8Array([]))).toBe(false);
  });

  it('debe calcular correctamente el CRC-32 según la norma ISO 3309', () => {
    // Verificamos el cálculo del CRC para el chunk IEND: tipo 'IEND' sin datos
    const iendBytes = new Uint8Array([73, 69, 78, 68]); // 'IEND'
    const crc = calculateCrc32(iendBytes, 0, 4);
    expect(crc).toBe(0xae426082);
  });

  it('debe codificar y decodificar UTF-8 a Base64 preservando caracteres especiales', () => {
    const original = 'Caso de Uso: Gestión Académica con Ñ, acentos (áéíóú) y símbolos @#$%&*';
    const b64 = utf8ToBase64(original);
    const decoded = base64ToUtf8(b64);
    expect(decoded).toBe(original);
  });

  it('debe retornar null al extraer metadatos de un PNG que no los contiene', () => {
    const rawPng = createMinimalPng();
    const result = extractMetadataFromPng(rawPng);
    expect(result).toBeNull();
  });

  it('debe incrustar y recuperar con precisión absoluta los datos del caso de uso (Round-trip)', () => {
    const basePng = createMinimalPng();
    const payload: UseCaseExportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: 'neon-emerald',
      darkMode: false,
      data: {
        ...DEFAULT_USE_CASE_DATA,
        nombre: 'Autenticación Biométrica y Firma Digital (Ñ, Á)',
      },
    };

    // 1. Incrustar metadatos en el PNG
    const modifiedPng = embedMetadataInPng(basePng, payload);

    // Debe ser más grande que el PNG base debido al nuevo chunk tEXt
    expect(modifiedPng.length).toBeGreaterThan(basePng.length);
    // Debe seguir siendo un PNG 100% válido
    expect(isPng(modifiedPng)).toBe(true);

    // 2. Extraer metadatos del PNG modificado
    const extracted = extractMetadataFromPng(modifiedPng);
    expect(extracted).not.toBeNull();
    expect(extracted?.theme).toBe('neon-emerald');
    expect(extracted?.darkMode).toBe(false);
    expect(extracted?.data.nombre).toBe('Autenticación Biométrica y Firma Digital (Ñ, Á)');
    expect(extracted?.data.pasos.length).toBe(DEFAULT_USE_CASE_DATA.pasos.length);
  });

  it('debe lanzar error si se intenta incrustar en un buffer que no es PNG', () => {
    const invalidBuffer = new Uint8Array([0, 1, 2, 3, 4]);
    const payload: UseCaseExportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: 'neon-pink',
      darkMode: true,
      data: DEFAULT_USE_CASE_DATA,
    };

    expect(() => embedMetadataInPng(invalidBuffer, payload)).toThrow();
  });
});
