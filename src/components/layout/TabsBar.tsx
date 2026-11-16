import { useState } from 'react';
import type { TabState } from '../../types/useCase';
import { Plus, X, FileSpreadsheet } from 'lucide-react';

interface TabsBarProps {
  tabs: TabState[];
  activeTabId: string;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCreateNewTab: () => void;
  onReorderTabs: (fromIndex: number, toIndex: number) => void;
}

export function TabsBar({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCreateNewTab,
  onReorderTabs,
}: TabsBarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorderTabs(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-slate-100/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {tabs.map((tab, idx) => {
            const isActive = tab.tabId === activeTabId;
            const isDragged = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx;
            const tabTitle =
              tab.data.nombre?.trim() || tab.data.id?.trim() || 'Nuevo Caso de Uso';

            return (
              <div
                key={tab.tabId}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                title="Arrastra para reordenar esta pestaña"
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs transition select-none cursor-grab active:cursor-grabbing ${
                  isDragged ? 'opacity-40 scale-95' : ''
                } ${
                  isDragOver && !isDragged ? 'ring-2 ring-[var(--accent-color)] ring-offset-1' : ''
                } ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-t border-x border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold -mb-px z-10 shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => onSwitchTab(tab.tabId)}
              >
                <FileSpreadsheet
                  className={`w-3.5 h-3.5 pointer-events-none ${
                    isActive ? 'accent-text' : 'opacity-60'
                  }`}
                />
                <span className="truncate max-w-[140px] sm:max-w-[200px] pointer-events-none">
                  {tabTitle}
                </span>

                {tabs.length > 1 && (
                  <button
                    type="button"
                    title="Cerrar pestaña"
                    draggable={false}
                    onDragStart={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      onCloseTab(tab.tabId);
                    }}
                    className="p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700 opacity-60 hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="w-3 h-3 pointer-events-none" />
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
