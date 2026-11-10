import type { Theme } from '../../types/useCase';
import { FileSpreadsheet, Palette, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  allThemes: Theme[];
  activeThemeId: string;
  isDarkMode: boolean;
  onSelectTheme: (themeId: string) => void;
  onToggleDarkMode: () => void;
  onOpenCustomColorModal: () => void;
}

export function Header({
  allThemes,
  activeThemeId,
  isDarkMode,
  onSelectTheme,
  onToggleDarkMode,
  onOpenCustomColorModal,
}: HeaderProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Marca y Título */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center accent-btn font-bold text-lg shadow-md">
          <FileSpreadsheet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
            UseCase Studio
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full accent-outline-btn">Pro</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Especificación estructurada de Casos de Uso</p>
        </div>
      </div>

      {/* Controles de Temas y Modo Claro/Oscuro */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Selector de Temas de Color */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {allThemes.map(theme => {
            const isActive = theme.id === activeThemeId;
            const displayColor = isDarkMode ? theme.hexDark : theme.hexLight;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                title={`Tema ${theme.name}`}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 shadow-xs font-semibold text-slate-900 dark:text-white ring-1 ring-slate-300 dark:ring-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: displayColor,
                    boxShadow: `0 0 8px ${displayColor}`,
                  }}
                />
                <span className="truncate max-w-[100px]">{theme.name}</span>
              </button>
            );
          })}
        </div>

        {/* Botón para agregar color HEX personalizado */}
        <button
          type="button"
          onClick={onOpenCustomColorModal}
          title="Agregar tema HEX personalizado"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <Palette className="w-4 h-4 accent-text" />
          <span className="hidden md:inline">+ HEX</span>
        </button>

        {/* Divisor */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Botón Modo Claro / Oscuro */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title="Cambiar entre modo oscuro y claro"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-medium"
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 accent-text" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="hidden sm:inline">{isDarkMode ? 'Oscuro' : 'Claro'}</span>
        </button>
      </div>
    </div>
  );
}
