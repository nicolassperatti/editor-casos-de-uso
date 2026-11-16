import { useRef } from 'react';
import {
  Plus,
  Sparkles,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  FolderDown,
} from 'lucide-react';

interface EmptyStateViewProps {
  onCreateBlank: () => void;
  onOpenTemplates: () => void;
  onImportFile: (file: File) => void;
  onRestoreDefault: () => void;
}

/**
 * Pantalla amigable y profesional que se muestra cuando no hay ninguna pestaña
 * o especificación de caso de uso abierta en el editor.
 */
export function EmptyStateView({
  onCreateBlank,
  onOpenTemplates,
  onImportFile,
  onRestoreDefault,
}: EmptyStateViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      e.target.value = '';
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl max-w-xl w-full text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Ícono central con resplandor en color de acento */}
        <div className="w-16 h-16 rounded-2xl accent-btn flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[var(--accent-color)]/25">
          <FileSpreadsheet className="w-8 h-8 text-current" />
        </div>

        {/* Encabezado y descripción amigable */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          No hay ninguna especificación abierta
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          Crea una nueva especificación de caso de uso, explora plantillas prediseñadas
          o importa un archivo existente para comenzar a editar.
        </p>

        {/* Acciones principales en grilla 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* 1. Nuevo Caso de Uso en Blanco */}
          <button
            type="button"
            onClick={onCreateBlank}
            title="Crear un nuevo caso de uso en blanco"
            className="p-3.5 rounded-xl accent-btn font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Nuevo Caso de Uso</span>
          </button>

          {/* 2. Elegir Plantilla */}
          <button
            type="button"
            onClick={onOpenTemplates}
            title="Abrir catálogo de plantillas predefinidas (Ctrl+Alt+N)"
            className="p-3.5 rounded-xl accent-outline-btn font-semibold text-xs flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 accent-text shrink-0" />
            <span>Elegir Plantilla</span>
          </button>

          {/* 3. Importar archivo JSON o PNG */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Cargar un archivo .json o una imagen .png editable"
            className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Importar Archivo</span>
          </button>

          {/* 4. Cargar ejemplo de demostración */}
          <button
            type="button"
            onClick={onRestoreDefault}
            title="Abrir el caso de uso de ejemplo interactivo (Estudiante UC 005)"
            className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Cargar Ejemplo</span>
          </button>
        </div>

        {/* Zona inferior de arrastrar y soltar */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <FolderDown className="w-4 h-4 shrink-0" />
          <span>
            También puedes arrastrar un archivo <strong>.json</strong> o imagen <strong>.png</strong> editable sobre la ventana
          </span>
        </div>

        {/* Input oculto para importación directa desde el Empty State */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.png,image/png"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </main>
  );
}
