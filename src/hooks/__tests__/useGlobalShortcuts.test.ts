import { describe, it, expect } from 'vitest';
import { matchGlobalShortcut } from '../useGlobalShortcuts';

describe('matchGlobalShortcut - Detección de atajos globales', () => {
  it('debe detectar Escape para cerrar modales o salir de Zen Mode', () => {
    expect(matchGlobalShortcut({ key: 'Escape' })).toBe('escape');
  });

  it('debe detectar F2 para alternar Modo Zen', () => {
    expect(matchGlobalShortcut({ key: 'F2' })).toBe('zen');
  });

  it('debe detectar Ctrl+S o Cmd+S para guardar', () => {
    expect(matchGlobalShortcut({ key: 's', ctrlKey: true })).toBe('save');
    expect(matchGlobalShortcut({ key: 'S', metaKey: true })).toBe('save');
  });

  it('debe detectar Ctrl+Alt+N para catálogo de plantillas', () => {
    expect(matchGlobalShortcut({ key: 'n', ctrlKey: true, altKey: true })).toBe('templates');
  });

  it('debe detectar Ctrl+Shift+D para Diagrama Mermaid', () => {
    expect(matchGlobalShortcut({ key: 'd', ctrlKey: true, shiftKey: true })).toBe('mermaid');
  });

  it('debe detectar F1 o ? para ayuda de atajos', () => {
    expect(matchGlobalShortcut({ key: 'F1' })).toBe('shortcuts');
    expect(matchGlobalShortcut({ key: '?', isEditingText: false })).toBe('shortcuts');
  });

  it('no debe activar ayuda de atajos si se presiona ? dentro de un input o textarea', () => {
    expect(matchGlobalShortcut({ key: '?', isEditingText: true })).toBeNull();
  });

  it('debe retornar null para teclas comunes sin modificador', () => {
    expect(matchGlobalShortcut({ key: 'a' })).toBeNull();
    expect(matchGlobalShortcut({ key: 'Enter' })).toBeNull();
  });
});
