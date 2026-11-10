import { useState, useRef, useEffect } from 'react';
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
  MoreHorizontal,
  ChevronDown,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-slate-50/90 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
        {/* Lado izquierdo: Acciones rápidas de historial y creación */}
        <div className="flex items-center gap-2">
          {/* Botones Deshacer / Rehacer */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Deshacer (Ctrl+Z)"
              className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition disabled:opacity-35 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Undo2 className="w-3.5 h-3.5 accent-text" />
              <span className="hidden md:inline">Deshacer</span>
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
              <span className="hidden md:inline">Rehacer</span>
            </button>
          </div>

          {/* Nuevo en blanco directo */}
          <button
            type="button"
            onClick={onClearAll}
            title="Limpiar formulario o crear nuevo caso de uso"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition text-rose-600 dark:text-rose-400 shadow-2xs"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo en Blanco</span>
          </button>
        </div>

        {/* Lado derecho: Visualización, Exportación y Menú Híbrido */}
        <div className="flex items-center gap-2">
          {/* Botón directo: Diagrama Mermaid */}
          <button
            type="button"
            onClick={onOpenMermaidModal}
            title="Abrir generador de diagramas Mermaid (Ctrl+Shift+D)"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold accent-outline-btn flex items-center gap-1.5 transition shadow-2xs"
          >
            <GitBranch className="w-3.5 h-3.5 accent-text" />
            <span className="hidden sm:inline">Diagrama Mermaid</span>
            <span className="sm:hidden">Mermaid</span>
          </button>

          {/* Botón principal directo: Exportar PDF */}
          <button
            type="button"
            onClick={onExportPDF}
            disabled={isExportingPdf}
            title="Exportar caso de uso a documento PDF estructurado"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold accent-btn flex items-center gap-1.5 transition disabled:opacity-50 shadow-2xs"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isExportingPdf ? 'Exportando PDF...' : 'Exportar PDF'}</span>
          </button>

          {/* Menú Desplegable Híbrido: Más opciones (Datos e Imágenes) */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              title="Más opciones de archivo e imagen"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition shadow-2xs ${
                isMenuOpen
                  ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Más</span>
              <ChevronDown
                className={`w-3 h-3 opacity-60 transition-transform duration-150 ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800">
                {/* Sección 1: Archivo y Datos */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Archivo y Datos
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                  >
                    <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Importar archivo JSON...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onExportJSON();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                  >
                    <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Exportar archivo JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onResetToDefault();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Restaurar ejemplo predeterminado</span>
                  </button>
                </div>

                {/* Sección 2: Capturas e Imágenes */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Capturas e Imágenes
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDownloadPNG();
                    }}
                    disabled={isDownloadingPng}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition disabled:opacity-50"
                  >
                    {isDownloadingPng ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    )}
                    <span>{isDownloadingPng ? 'Generando PNG...' : 'Descargar imagen PNG'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCopyPNG();
                    }}
                    disabled={isCopyingPng}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition disabled:opacity-50"
                  >
                    {isCopyingPng ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    )}
                    <span>{isCopyingPng ? 'Copiando...' : 'Copiar PNG al portapapeles'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input oculto para importación de archivos JSON */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
