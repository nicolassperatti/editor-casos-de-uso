import type { TabState } from '../../types/useCase';
import { Plus, X, FileSpreadsheet } from 'lucide-react';

interface TabsBarProps {
  tabs: TabState[];
  activeTabId: string;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCreateNewTab: () => void;
}

export function TabsBar({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCreateNewTab,
}: TabsBarProps) {
  return (
    <div className="bg-slate-100/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {tabs.map(tab => {
            const isActive = tab.tabId === activeTabId;
            const tabTitle =
              tab.data.nombre?.trim() || tab.data.id?.trim() || 'Nuevo Caso de Uso';

            return (
              <div
                key={tab.tabId}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-t border-x border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold -mb-px z-10 shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => onSwitchTab(tab.tabId)}
              >
                <FileSpreadsheet
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'accent-text' : 'opacity-60'
                  }`}
                />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {tabTitle}
                </span>

                {tabs.length > 1 && (
                  <button
                    type="button"
                    title="Cerrar pestaña"
                    onClick={e => {
                      e.stopPropagation();
                      onCloseTab(tab.tabId);
                    }}
                    className="p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700 opacity-60 hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCreateNewTab}
          title="Crear nueva pestaña o elegir plantilla (Ctrl+Alt+N)"
          className="mb-1 px-2.5 py-1 rounded-lg text-xs font-semibold accent-outline-btn flex items-center gap-1 shrink-0 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Pestaña</span>
        </button>
      </div>
    </div>
  );
}
