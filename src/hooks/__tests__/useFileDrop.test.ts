import { describe, it, expect } from 'vitest';
import { isFilesDragEvent } from '../useFileDrop';

describe('isFilesDragEvent - Validación de eventos drag-and-drop', () => {
  it('debe retornar true si types contiene "Files"', () => {
    expect(isFilesDragEvent(['Files'])).toBe(true);
    expect(isFilesDragEvent(['text/plain', 'Files'])).toBe(true);
  });

  it('debe retornar false si types no contiene "Files" (ej. arrastre interno de pestañas)', () => {
    expect(isFilesDragEvent(['text/plain'])).toBe(false);
    expect(isFilesDragEvent([])).toBe(false);
  });

  it('debe soportar DOMStringList con método contains', () => {
    const mockDomStringList = {
      contains: (type: string) => type === 'Files',
      length: 1,
      item: () => 'Files',
      [Symbol.iterator]: function* () {
        yield 'Files';
      },
    } as unknown as DOMStringList;

    expect(isFilesDragEvent(mockDomStringList)).toBe(true);
  });

  it('debe retornar false si types es undefined o null', () => {
    expect(isFilesDragEvent(undefined)).toBe(false);
  });
});
