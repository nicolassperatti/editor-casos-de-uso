import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + S', desc: 'Confirmar guardado en el navegador' },
    { key: 'Ctrl + Z', desc: 'Deshacer último cambio' },
    { key: 'Ctrl + Y  /  Ctrl + Shift + Z', desc: 'Rehacer último cambio deshecho' },
    { key: 'Ctrl + Alt + N', desc: 'Crear nuevo caso desde plantilla' },
    { key: 'Ctrl + Shift + D', desc: 'Abrir visor de diagramas Mermaid' },
    { key: 'F2', desc: 'Alternar Modo Zen (vista limpia)' },
    { key: '?  /  F1', desc: 'Ver atajos de teclado' },
    { key: 'Esc', desc: 'Cerrar modal o salir de Modo Zen' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl accent-outline-btn flex items-center justify-center">
              <Keyboard className="w-5 h-5 accent-text" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Atajos de Teclado</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Acciones rápidas de navegación y edición</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 my-4">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shrink-0 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold accent-btn transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
