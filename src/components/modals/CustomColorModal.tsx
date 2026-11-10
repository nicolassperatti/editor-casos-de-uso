import { useState } from 'react';
import type { Theme } from '../../types/useCase';
import { Sparkles, X, Trash2 } from 'lucide-react';

interface CustomColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTheme: (name: string, hex: string) => { success: boolean; error?: string };
  customThemes: Theme[];
  onDeleteCustomTheme: (id: string) => void;
}

export function CustomColorModal({
  isOpen,
  onClose,
  onSaveTheme,
  customThemes,
  onDeleteCustomTheme,
}: CustomColorModalProps) {
  const [themeName, setThemeName] = useState('');
  const [hexColor, setHexColor] = useState('#10b981');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleHexInput = (val: string) => {
    setHexColor(val);
    setErrorMsg('');
  };

  const handlePickerInput = (val: string) => {
    setHexColor(val.toUpperCase());
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSaveTheme(themeName, hexColor);
    if (!result.success) {
      setErrorMsg(result.error || 'Código HEX inválido');
    } else {
      setThemeName('');
      setErrorMsg('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 accent-text" />
            <span>Nuevo Tema Personalizado (HEX)</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ingresa un nombre y un código hexadecimal de color. Se adaptará automáticamente tanto para el modo claro como para el modo oscuro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Nombre del Tema
            </label>
            <input
              type="text"
              value={themeName}
              onChange={e => setThemeName(e.target.value)}
              placeholder="Ej. Verde Esmeralda, Púrpura Cyber"
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Código de Color HEX
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hexColor.startsWith('#') && hexColor.length === 7 ? hexColor : '#10B981'}
                onChange={e => handlePickerInput(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={hexColor}
                maxLength={7}
                onChange={e => handleHexInput(e.target.value)}
                placeholder="#10B981"
                className="flex-1 font-mono uppercase px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
            {errorMsg && <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>}
          </div>

          {/* Lista de temas personalizados guardados para poder eliminarlos */}
          {customThemes.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Mis temas agregados:
              </span>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {customThemes.map(ct => (
                  <div
                    key={ct.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: ct.hexDark }}
                    />
                    <span className="truncate max-w-[100px]">{ct.name}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomTheme(ct.id)}
                      className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold accent-btn transition"
            >
              Guardar y Aplicar Tema
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
