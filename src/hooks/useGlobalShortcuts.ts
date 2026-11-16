import { useEffect } from 'react';

export interface UseGlobalShortcutsOptions {
  onEscape: () => void;
  onToggleZenMode: () => void;
  onSaveFeedback: () => void;
  onOpenTemplates: () => void;
  onOpenMermaid: () => void;
  onOpenShortcuts: () => void;
}

export interface ShortcutEventPayload {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  isEditingText?: boolean;
}

export type ShortcutAction =
  | 'escape'
  | 'zen'
  | 'save'
  | 'templates'
  | 'mermaid'
  | 'shortcuts'
  | null;

/**
 * Función pura que determina qué acción de atajo corresponde a un evento de teclado,
 * considerando modificadores (Ctrl/Cmd, Alt, Shift) y protegiendo la edición en inputs.
 */
export function matchGlobalShortcut(e: ShortcutEventPayload): ShortcutAction {
  const isCtrlOrMeta = Boolean(e.ctrlKey || e.metaKey);
  const key = e.key.toLowerCase();
  const isEditingText = Boolean(e.isEditingText);

  // 1. Escape: cerrar cualquier modal o salir de Zen Mode
  if (e.key === 'Escape') return 'escape';

  // 2. F2: Alternar Modo Zen
  if (e.key === 'F2') return 'zen';

  // 3. Ctrl + S: Guardar con feedback visual
  if (isCtrlOrMeta && key === 's') return 'save';

  // 4. Ctrl + Alt + N: Abrir catálogo de plantillas
  if (isCtrlOrMeta && e.altKey && key === 'n') return 'templates';

  // 5. Ctrl + Shift + D: Abrir Diagrama Mermaid
  if (isCtrlOrMeta && e.shiftKey && key === 'd') return 'mermaid';

  // 6. F1 o '?' fuera de inputs: Abrir ayuda de atajos
  if (e.key === 'F1' || (e.key === '?' && !isEditingText)) return 'shortcuts';

  return null;
}

/**
 * Hook personalizado que centraliza y gestiona los atajos de teclado globales
 * de la aplicación con prevención de colisiones en campos de texto (input/textarea).
 */
export function useGlobalShortcuts({
  onEscape,
  onToggleZenMode,
  onSaveFeedback,
  onOpenTemplates,
  onOpenMermaid,
  onOpenShortcuts,
}: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditingText = targetTag === 'input' || targetTag === 'textarea';

      const action = matchGlobalShortcut({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        isEditingText,
      });

      if (action === 'escape') {
        onEscape();
      } else if (action === 'zen') {
        e.preventDefault();
        onToggleZenMode();
      } else if (action === 'save') {
        e.preventDefault();
        onSaveFeedback();
      } else if (action === 'templates') {
        e.preventDefault();
        onOpenTemplates();
      } else if (action === 'mermaid') {
        e.preventDefault();
        onOpenMermaid();
      } else if (action === 'shortcuts') {
        e.preventDefault();
        onOpenShortcuts();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    onEscape,
    onToggleZenMode,
    onSaveFeedback,
    onOpenTemplates,
    onOpenMermaid,
    onOpenShortcuts,
  ]);
}
