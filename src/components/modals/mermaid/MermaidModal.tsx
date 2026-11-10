import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseCaseData, Theme, MermaidDiagramType } from '../../../types/useCase';
import {
  buildMermaidSyntax,
  renderMermaidSvg,
  generateMermaidHighResCanvas,
} from '../../../services/mermaid';
import { getSanitizedFilename } from '../../../services/export/prepareClone';
import {
  GitBranch,
  X,
  ZoomIn,
  ZoomOut,
  Code2,
  RefreshCw,
  Terminal,
  Copy,
  Download,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface MermaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UseCaseData;
  activeTheme: Theme;
  isDarkMode: boolean;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function MermaidModal({
  isOpen,
  onClose,
  data,
  activeTheme,
  isDarkMode,
  onShowToast,
}: MermaidModalProps) {
  const [diagramType, setDiagramType] = useState<MermaidDiagramType>('flowchart');
  const [code, setCode] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generar sintaxis inicial al abrir modal o cambiar de caso de uso
  const syncFromFormData = useCallback(
    (type: MermaidDiagramType) => {
      const generated = buildMermaidSyntax(type, data, activeTheme, isDarkMode);
      setCode(generated);
    },
    [data, activeTheme, isDarkMode]
  );

  useEffect(() => {
    if (isOpen) {
      syncFromFormData(diagramType);
      setZoom(1);
    }
  }, [isOpen, diagramType, syncFromFormData]);

  // Renderizar SVG a partir del código actual
  const renderSvg = useCallback(
    async (codeToRender: string) => {
      if (!codeToRender.trim()) return;
      try {
        setErrorMsg('');
        const { svg } = await renderMermaidSvg(codeToRender, activeTheme, isDarkMode);
        setSvgContent(svg);
      } catch (err: unknown) {
        console.warn('Error al renderizar Mermaid:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg);
      }
    },
    [activeTheme, isDarkMode]
  );

  useEffect(() => {
    if (code) {
      renderSvg(code);
    }
  }, [code, renderSvg]);

  // Manejar edición de código con debounce
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      renderSvg(newCode);
    }, 400);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.5, Math.max(0.35, +(prev + delta).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        onShowToast('Código Mermaid copiado al portapapeles', 'success');
      } else {
        throw new Error('Clipboard no disponible');
      }
    } catch {
      onShowToast('No se pudo copiar el código automáticamente', 'error');
    }
  };

  const handleDownloadPNG = async () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) {
      onShowToast('No hay diagrama renderizado para exportar', 'error');
      return;
    }

    try {
      setIsDownloading(true);
      const canvas = await generateMermaidHighResCanvas(svgEl, zoom, isDarkMode);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const suffix = diagramType === 'sequence' ? 'secuencia_mermaid' : 'flujo_mermaid';
      a.download = getSanitizedFilename(data, `${suffix}.png`).replace('.png.png', '.png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast('Diagrama Mermaid descargado en PNG de alta definición', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Error al exportar el diagrama como PNG', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyPNG = async () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) {
      onShowToast('No hay diagrama renderizado para copiar', 'error');
      return;
    }

    try {
      setIsCopying(true);
      const canvas = await generateMermaidHighResCanvas(svgEl, zoom, isDarkMode);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('No se pudo generar el blob');

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        onShowToast('¡Diagrama copiado al portapapeles como imagen PNG!', 'success');
      } else {
        await handleDownloadPNG();
        onShowToast('Se descargó el PNG (portapapeles restringido)', 'info');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error al copiar el diagrama como PNG', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera del Modal Mermaid */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl accent-btn flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Generador de Diagrama Mermaid
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste automático multilínea sin recorte de palabras y exportación PNG HD
              </p>
            </div>
          </div>

          {/* Pestañas de Tipo de Diagrama */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDiagramType('flowchart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                diagramType === 'flowchart'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Flujo del Caso de Uso (Flowchart)
            </button>
            <button
              type="button"
              onClick={() => setDiagramType('sequence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                diagramType === 'sequence'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Secuencia de Pasos (Sequence)
            </button>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Controles del Diagrama */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Controles de Zoom */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => handleZoom(-0.15)}
                title="Alejar"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] min-w-[48px] text-center text-slate-700 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoom(0.15)}
                title="Acercar"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Restablecer Zoom"
                className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                Reset
              </button>
            </div>

            {/* Alternar panel de código editable */}
            <button
              type="button"
              onClick={() => setIsCodePanelOpen(prev => !prev)}
              className="px-2.5 py-1.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition text-slate-700 dark:text-slate-200"
            >
              <Code2 className="w-3.5 h-3.5 accent-text" />
              <span>{isCodePanelOpen ? 'Ocultar Código' : 'Editar Código Mermaid'}</span>
            </button>

            <button
              type="button"
              onClick={() => syncFromFormData(diagramType)}
              title="Volver a generar desde los datos del formulario"
              className="px-2.5 py-1.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sincronizar con Formulario</span>
            </button>
          </div>

          {/* Botones de Exportación del Diagrama */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition text-slate-700 dark:text-slate-200"
            >
              <Terminal className="w-3.5 h-3.5 accent-text" />
              <span>Copiar Código</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPNG}
              disabled={isCopying}
              className="px-3 py-1.5 rounded-lg font-semibold accent-outline-btn flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isCopying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopying ? 'Copiando...' : 'Copiar Diagrama PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-lg font-semibold accent-btn flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Download className="w-3.5 h-3.5 text-white" />
              )}
              <span>{isDownloading ? 'Generando...' : 'Descargar Diagrama PNG'}</span>
            </button>
          </div>
        </div>

        {/* Cuerpo Principal: Editor de Código + Lienzo de Previsualización */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Panel Lateral de Código Mermaid Editable */}
          {isCodePanelOpen && (
            <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Sintaxis Mermaid Editable
                </span>
                <button
                  type="button"
                  onClick={() => renderSvg(code)}
                  className="px-2.5 py-1 rounded-md accent-btn font-semibold text-xs"
                >
                  Actualizar Vista
                </button>
              </div>
              <textarea
                spellCheck={false}
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                className="flex-1 w-full p-3 font-mono text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Lienzo Interactivo del Diagrama */}
          <div
            ref={viewportRef}
            id="mermaidPreviewViewport"
            className="flex-1 overflow-auto p-6 sm:p-10 select-none"
          >
            <div className="min-w-full min-h-full flex items-start">
              {errorMsg ? (
                <div className="m-auto p-6 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs max-w-lg">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Error en la sintaxis de Mermaid:</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                    {errorMsg}
                  </pre>
                </div>
              ) : (
                <div
                  ref={containerRef}
                  id="mermaidSvgContainer"
                  className="m-auto transition-all duration-150 origin-top-left"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
