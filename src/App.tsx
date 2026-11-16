import { useState, useRef, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useTabsManager } from './hooks/useTabsManager';
import { useToast } from './hooks/useToast';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { useFileDrop } from './hooks/useFileDrop';
import { Header } from './components/layout/Header';
import { ActionBar } from './components/layout/ActionBar';
import { TabsBar } from './components/layout/TabsBar';
import { UseCaseSheet } from './components/usecase/UseCaseSheet';
import { ToastContainer } from './components/ui/ToastContainer';
import { CustomColorModal } from './components/modals/CustomColorModal';
import { ConfirmationModal, type ConfirmModalButton } from './components/modals/ConfirmationModal';
import { MermaidModal } from './components/modals/mermaid/MermaidModal';
import { TemplatesModal } from './components/modals/TemplatesModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import type { UseCaseTemplate } from './constants/templates';
import { Minimize2, Upload } from 'lucide-react';
import {
  exportUseCaseToJson,
  validateAndSanitizeImportedJson,
  downloadUseCaseAsPNG,
  copyUseCaseAsPNG,
  exportUseCaseToPDF,
  extractUseCaseFromPngFile,
  type ImportedUseCaseResult,
} from './services/export';

export default function App() {
  const {
    tabs,
    activeTabId,
    currentData,
    currentThemeId,
    currentDarkMode,
    saveIndicator,
    canUndo,
    canRedo,
    undo,
    redo,
    updateCurrentData,
    updateCurrentTheme,
    updateCurrentDarkMode,
    createNewTab,
    closeTab,
    switchTab,
    reorderTabs,
    resetToDefaultExample,
    clearAllFields,
    importJsonData,
  } = useTabsManager();

  const {
    allThemes,
    activeTheme,
    saveCustomTheme,
    deleteCustomTheme,
  } = useTheme(currentThemeId, currentDarkMode);

  const { toasts, showToast, removeToast } = useToast();

  const sheetRef = useRef<HTMLDivElement>(null);
  const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false);
  const [isMermaidModalOpen, setIsMermaidModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isCopyingPng, setIsCopyingPng] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);

  // Estado para el modal de confirmación dinámico (2 o 3 opciones)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    buttons: ConfirmModalButton[];
  }>({
    isOpen: false,
    title: '',
    message: '',
    buttons: [],
  });

  const closeConfirmationDialog = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Función auxiliar para diálogos estándar de 3 opciones (Cancelar / Nueva Pestaña / Acción Pestaña Actual)
  const promptThreeOptionConfirm = useCallback(
    (
      title: string,
      message: string,
      onNewTab: () => void,
      onCurrentTab: () => void,
      currentTabLabel: string,
      currentTabStyle: 'accent' | 'danger' = 'accent'
    ) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        buttons: [
          {
            label: 'Cancelar',
            style: 'cancel',
            onClick: closeConfirmationDialog,
          },
          {
            label: 'Abrir en Nueva Pestaña',
            style: 'accent-outline',
            onClick: () => {
              closeConfirmationDialog();
              onNewTab();
            },
          },
          {
            label: currentTabLabel,
            style: currentTabStyle,
            onClick: () => {
              closeConfirmationDialog();
              onCurrentTab();
            },
          },
        ],
      });
    },
    [closeConfirmationDialog]
  );

  // Atajos de teclado globales
  const handleEscape = useCallback(() => {
    if (isCustomColorModalOpen) setIsCustomColorModalOpen(false);
    else if (isMermaidModalOpen) setIsMermaidModalOpen(false);
    else if (isTemplatesModalOpen) setIsTemplatesModalOpen(false);
    else if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
    else if (confirmModal.isOpen) closeConfirmationDialog();
    else if (isZenMode) setIsZenMode(false);
  }, [
    isCustomColorModalOpen,
    isMermaidModalOpen,
    isTemplatesModalOpen,
    isShortcutsModalOpen,
    confirmModal.isOpen,
    isZenMode,
    closeConfirmationDialog,
  ]);

  useGlobalShortcuts({
    onEscape: handleEscape,
    onToggleZenMode: () => setIsZenMode(prev => !prev),
    onSaveFeedback: () => showToast('✓ Guardado automático activo en el navegador', 'success'),
    onOpenTemplates: () => setIsTemplatesModalOpen(true),
    onOpenMermaid: () => setIsMermaidModalOpen(true),
    onOpenShortcuts: () => setIsShortcutsModalOpen(true),
  });

  // 1. Confirmación de Cerrar Pestaña
  const handleCloseTabRequest = (tabIdToClose: string) => {
    if (tabs.length <= 1) {
      showToast('Debe permanecer al menos una pestaña abierta', 'info');
      return;
    }

    const targetTab = tabs.find(t => t.tabId === tabIdToClose);
    const title = targetTab?.data.nombre?.trim() || targetTab?.data.id?.trim() || 'esta pestaña';

    setConfirmModal({
      isOpen: true,
      title: '¿Cerrar esta pestaña?',
      message: `Se cerrará la pestaña "${title}" y se descartarán sus datos si no los has exportado como JSON.`,
      buttons: [
        {
          label: 'Cancelar',
          style: 'cancel',
          onClick: closeConfirmationDialog,
        },
        {
          label: 'Cerrar Pestaña',
          style: 'danger',
          onClick: () => {
            closeConfirmationDialog();
            closeTab(tabIdToClose);
            showToast('Pestaña cerrada', 'info');
          },
        },
      ],
    });
  };

  // 2. Confirmación de Restaurar Ejemplo (3 opciones)
  const handleResetToDefault = () => {
    promptThreeOptionConfirm(
      '¿Restaurar el ejemplo original?',
      'Esto cargará los datos del ejemplo original ("Estudiante UC 005") y restablecerá el color al tema original (Rosa Neón). ¿Deseas reemplazar la pestaña actual o abrirlo en una pestaña nueva?',
      () => {
        resetToDefaultExample(true);
        showToast('Ejemplo original abierto en nueva pestaña', 'success');
      },
      () => {
        resetToDefaultExample(false);
        showToast('Se restauraron los datos y el tema original (Rosa Neón)', 'info');
      },
      'Reemplazar Pestaña Actual'
    );
  };

  // 3. Confirmación de Nuevo en Blanco (3 opciones)
  const handleClearAll = () => {
    promptThreeOptionConfirm(
      '¿Limpiar formulario actual o crear pestaña?',
      'Si limpias la pestaña actual se borrará su contenido (aunque podrás recuperarlo con Deshacer). También puedes abrir directamente una nueva pestaña en blanco.',
      () => {
        clearAllFields(true);
        showToast('Nueva pestaña en blanco creada', 'success');
      },
      () => {
        clearAllFields(false);
        showToast('Formulario en blanco listo para editar', 'info');
      },
      'Limpiar Pestaña Actual',
      'danger'
    );
  };

  // 4. Confirmación de Importar JSON o PNG editable (3 opciones)
  const handleImportFile = async (file: File) => {
    const isPngFile = file.name.toLowerCase().endsWith('.png') || file.type === 'image/png';

    let result: ImportedUseCaseResult;
    let sourceDesc: string;

    if (isPngFile) {
      try {
        const extracted = await extractUseCaseFromPngFile(file);
        if (!extracted) {
          showToast('Esta imagen PNG no contiene datos de caso de uso editables', 'error');
          return;
        }
        result = extracted;
        sourceDesc = `la imagen "${file.name}"`;
      } catch (err) {
        console.error(err);
        showToast('Error al leer los datos de la imagen PNG', 'error');
        return;
      }
    } else {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        result = validateAndSanitizeImportedJson(parsed);
        sourceDesc = `el archivo JSON "${file.name}"`;
      } catch (err) {
        console.error(err);
        showToast('El archivo JSON no tiene un formato válido', 'error');
        return;
      }
    }

    const docLabel = result.data.nombre?.trim() || result.data.id?.trim() || file.name;

    promptThreeOptionConfirm(
      isPngFile
        ? '¿Cómo deseas importar este caso de uso desde la imagen PNG?'
        : '¿Cómo deseas importar este archivo JSON?',
      `Estás por cargar "${docLabel}" desde ${sourceDesc}. Si reemplazas la pestaña actual se sobrescribirá lo que tienes en pantalla (puedes usar Deshacer), o puedes abrirlo en una nueva pestaña.`,
      () => {
        importJsonData(result.data, result.theme, result.darkMode, true);
        showToast(
          isPngFile
            ? 'Caso de uso importado desde imagen PNG en una nueva pestaña'
            : 'JSON importado en una nueva pestaña',
          'success'
        );
      },
      () => {
        importJsonData(result.data, result.theme, result.darkMode, false);
        showToast(
          isPngFile
            ? 'Caso de uso restaurado desde imagen PNG'
            : 'Caso de uso importado correctamente',
          'success'
        );
      },
      'Reemplazar Pestaña Actual'
    );
  };

  const handleExportJSON = () => {
    try {
      exportUseCaseToJson(currentData, currentThemeId, currentDarkMode);
      showToast('Archivo JSON exportado correctamente', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al exportar el archivo JSON', 'error');
    }
  };

  const handleSaveCustomTheme = (name: string, hex: string) => {
    const res = saveCustomTheme(name, hex);
    if (res.success && res.themeId) {
      updateCurrentTheme(res.themeId);
      showToast(`Tema "${name}" guardado y aplicado a esta pestaña`, 'success');
    }
    return res;
  };

  const handleSelectTemplate = (template: UseCaseTemplate) => {
    createNewTab(template.data, template.theme, currentDarkMode);
    showToast(`Plantilla "${template.title}" creada en nueva pestaña`, 'success');
  };

  const handleCopyPNG = async () => {
    if (!sheetRef.current) return;
    try {
      setIsCopyingPng(true);
      await copyUseCaseAsPNG(sheetRef.current, currentData, currentDarkMode, currentThemeId);
      showToast('Imagen copiada al portapapeles', 'success');
    } catch {
      try {
        await downloadUseCaseAsPNG(sheetRef.current, currentData, currentDarkMode, currentThemeId);
        showToast('Se descargó el PNG automáticamente (portapapeles restringido)', 'info');
      } catch (err) {
        console.error(err);
        showToast('Error al exportar imagen PNG', 'error');
      }
    } finally {
      setIsCopyingPng(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!sheetRef.current) return;
    try {
      setIsDownloadingPng(true);
      await downloadUseCaseAsPNG(sheetRef.current, currentData, currentDarkMode, currentThemeId);
      showToast('Imagen PNG editable descargada con éxito', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al generar la imagen PNG', 'error');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleExportPDF = async () => {
    if (!sheetRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportUseCaseToPDF(sheetRef.current, currentData, currentDarkMode);
      showToast('PDF exportado sin cortes ni duplicación de filas', 'success');
    } catch (err) {
      console.error(err);
      showToast('Hubo un problema al generar el PDF', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Drag and Drop global para archivos JSON y PNG editables
  const { isDraggingFile, dragProps } = useFileDrop({
    onFileDrop: handleImportFile,
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative"
      {...dragProps}
    >
      {/* Overlay visual al arrastrar archivo (JSON o PNG editable) */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-emerald-500 dark:border-emerald-400 rounded-2xl p-8 max-w-md mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Suelta tu caso de uso aquí
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Soporta archivos <strong>.json</strong> o imágenes <strong>.png</strong> editables (estilo Excalidraw)
            </p>
          </div>
        </div>
      )}

      {/* Botón flotante para salir de Modo Zen */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-40 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-1.5 accent-text hover:brightness-110 transition"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Salir de Modo Zen (F2)</span>
          </button>
        </div>
      )}

      {/* Barra Superior con Marca, Temas y Modo Oscuro (se oculta en Modo Zen) */}
      {!isZenMode && (
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-150">
          <Header
            allThemes={allThemes}
            activeThemeId={currentThemeId}
            isDarkMode={currentDarkMode}
            onSelectTheme={updateCurrentTheme}
            onToggleDarkMode={() => updateCurrentDarkMode(!currentDarkMode)}
            onOpenCustomColorModal={() => setIsCustomColorModalOpen(true)}
            onToggleZenMode={() => setIsZenMode(true)}
            onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          />

          <ActionBar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportFile}
            onResetToDefault={handleResetToDefault}
            onClearAll={handleClearAll}
            onOpenMermaidModal={() => setIsMermaidModalOpen(true)}
            onCopyPNG={handleCopyPNG}
            onDownloadPNG={handleDownloadPNG}
            onExportPDF={handleExportPDF}
            isExportingPdf={isExportingPdf}
            isCopyingPng={isCopyingPng}
            isDownloadingPng={isDownloadingPng}
          />

          <TabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSwitchTab={switchTab}
            onCloseTab={handleCloseTabRequest}
            onCreateNewTab={() => setIsTemplatesModalOpen(true)}
            onReorderTabs={reorderTabs}
          />
        </header>
      )}

      {/* Hoja Principal de Especificación de Caso de Uso */}
      <UseCaseSheet
        ref={sheetRef}
        data={currentData}
        saveIndicator={saveIndicator}
        onUpdate={updateCurrentData}
      />

      {/* Modales */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <CustomColorModal
        isOpen={isCustomColorModalOpen}
        onClose={() => setIsCustomColorModalOpen(false)}
        onSaveTheme={handleSaveCustomTheme}
        customThemes={allThemes.filter(t => t.isCustom)}
        onDeleteCustomTheme={deleteCustomTheme}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        buttons={confirmModal.buttons}
        onClose={closeConfirmationDialog}
      />

      {isMermaidModalOpen && (
        <MermaidModal
          isOpen={isMermaidModalOpen}
          onClose={() => setIsMermaidModalOpen(false)}
          data={currentData}
          activeTheme={activeTheme}
          isDarkMode={currentDarkMode}
          onShowToast={showToast}
        />
      )}

      {/* Contenedor de Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
