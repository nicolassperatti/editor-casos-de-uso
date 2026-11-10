import { useRef } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  RotateCcw,
  FilePlus2,
  GitBranch,
  Copy,
  Image as ImageIcon,
  FileText,
  Loader2,
} from 'lucide-react';

interface ActionBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetToDefault: () => void;
  onClearAll: () => void;
  onOpenMermaidModal: () => void;
  onCopyPNG: () => void;
  onDownloadPNG: () => void;
  onExportPDF: () => void;
  isExportingPdf: boolean;
  isCopyingPng: boolean;
  isDownloadingPng: boolean;
}

export function ActionBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportJSON,
  onImportJSON,
  onResetToDefault,
  onClearAll,
  onOpenMermaidModal,
  onCopyPNG,
  onDownloadPNG,
  onExportPDF,
  isExportingPdf,
  isCopyingPng,
  isDownloadingPng,
}: ActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-slate-50/90 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Acciones de datos (Deshacer / Rehacer / Restaurar / Vaciar / JSON) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Botones Deshacer / Rehacer */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 mr-1 shadow-2xs">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Deshacer (Ctrl+Z)"
              className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition disabled:opacity-35 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Undo2 className="w-3.5 h-3.5 accent-text" />
              <span className="hidden lg:inline">Deshacer</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Rehacer (Ctrl+Y)"
              className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition disabled:opacity-35 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Redo2 className="w-3.5 h-3.5 accent-text" />
              <span className="hidden lg:inline">Rehacer</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onExportJSON}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition shadow-2xs text-slate-700 dark:text-slate-200"
          >
            <Download className="w-3.5 h-3.5 accent-text" />
            <span>Exportar JSON</span>
          </button>

          <label className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs text-slate-700 dark:text-slate-200">
            <Upload className="w-3.5 h-3.5 accent-text" />
            <span>Importar JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            type="button"
            onClick={onResetToDefault}
            title="Cargar los datos y tema originales de la imagen"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition text-slate-600 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar Ejemplo</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            title="Limpiar formulario para crear un nuevo caso de uso"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition text-rose-600 dark:text-rose-400"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo en Blanco</span>
          </button>
        </div>

        {/* Acciones de Exportación Visual (Mermaid / PNG / Copiar PNG / PDF) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenMermaidModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold accent-outline-btn flex items-center gap-1.5 transition"
          >
            <GitBranch className="w-3.5 h-3.5 accent-text" />
            <span>Diagrama Mermaid</span>
          </button>

          <button
            type="button"
            onClick={onCopyPNG}
            disabled={isCopyingPng}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold accent-outline-btn flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isCopyingPng ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{isCopyingPng ? 'Copiando...' : 'Copiar PNG'}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPNG}
            disabled={isDownloadingPng}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold accent-outline-btn flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isDownloadingPng ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            <span>{isDownloadingPng ? 'Generando PNG...' : 'Descargar PNG'}</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold accent-btn flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isExportingPdf ? 'Exportando PDF...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
