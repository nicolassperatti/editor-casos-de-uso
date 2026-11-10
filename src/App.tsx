import { useState, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useTabsManager } from './hooks/useTabsManager';
import { useToast } from './hooks/useToast';
import { Header } from './components/layout/Header';
import { ActionBar } from './components/layout/ActionBar';
import { TabsBar } from './components/layout/TabsBar';
import { UseCaseSheet } from './components/usecase/UseCaseSheet';
import { ToastContainer } from './components/ui/ToastContainer';
import { CustomColorModal } from './components/modals/CustomColorModal';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { MermaidModal } from './components/modals/mermaid/MermaidModal';
import {
  exportUseCaseToJson,
  validateAndSanitizeImportedJson,
  downloadUseCaseAsPNG,
  copyUseCaseAsPNG,
  exportUseCaseToPDF,
} from './services/export';

export default function App() {
  const {
    allThemes,
    activeTheme,
    activeThemeId,
    isDarkMode,
    selectTheme,
    toggleDarkMode,
    saveCustomTheme,
    deleteCustomTheme,
  } = useTheme();

  const {
    tabs,
    activeTabId,
    currentData,
    saveIndicator,
    canUndo,
    canRedo,
    undo,
    redo,
    updateCurrentData,
    createNewTab,
    closeTab,
    switchTab,
    resetToDefaultExample,
    clearAllFields,
    importJsonData,
  } = useTabsManager(activeThemeId, isDarkMode);

  const { toasts, showToast, removeToast } = useToast();

  const sheetRef = useRef<HTMLDivElement>(null);
  const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false);
  const [isMermaidModalOpen, setIsMermaidModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isCopyingPng, setIsCopyingPng] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);

  // Estado para el modal de confirmación desacoplado
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    onConfirm: () => {},
  });

  // Acciones con diálogo de confirmación
  const handleResetToDefault = () => {
    setConfirmModal({
      isOpen: true,
      title: '¿Restaurar datos de ejemplo?',
      message: 'Se reemplazarán los datos actuales de esta pestaña con los datos originales del ejemplo de la imagen.',
      isDanger: false,
      onConfirm: () => {
        resetToDefaultExample();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Datos originales de ejemplo restaurados', 'info');
      },
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: '¿Crear nuevo en blanco?',
      message: 'Se vaciarán todos los campos de esta pestaña para iniciar una nueva especificación desde cero.',
      isDanger: true,
      onConfirm: () => {
        clearAllFields();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Formulario vaciado para nuevo caso de uso', 'info');
      },
    });
  };

  const handleExportJSON = () => {
    try {
      exportUseCaseToJson(currentData);
      showToast('Archivo JSON exportado correctamente', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al exportar el archivo JSON', 'error');
    }
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const sanitized = validateAndSanitizeImportedJson(parsed);
        importJsonData(sanitized);
        showToast('Caso de uso importado con éxito', 'success');
      } catch (err) {
        console.error(err);
        showToast('El archivo JSON no tiene un formato válido', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyPNG = async () => {
    if (!sheetRef.current) return;
    try {
      setIsCopyingPng(true);
      await copyUseCaseAsPNG(sheetRef.current, currentData, isDarkMode);
      showToast('¡Formulario copiado al portapapeles como PNG!', 'success');
    } catch {
      // Fallback a descarga si el navegador restringe portapapeles
      try {
        await downloadUseCaseAsPNG(sheetRef.current, currentData, isDarkMode);
        showToast('Se descargó el PNG (portapapeles restringido)', 'info');
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
      await downloadUseCaseAsPNG(sheetRef.current, currentData, isDarkMode);
      showToast('Imagen PNG descargada con éxito', 'success');
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
      await exportUseCaseToPDF(sheetRef.current, currentData, isDarkMode);
      showToast('PDF exportado sin cortes ni duplicación de filas', 'success');
    } catch (err) {
      console.error(err);
      showToast('Hubo un problema al generar el PDF', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Barra Superior con Marca, Temas y Modo Oscuro */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <Header
          allThemes={allThemes}
          activeThemeId={activeThemeId}
          isDarkMode={isDarkMode}
          onSelectTheme={selectTheme}
          onToggleDarkMode={toggleDarkMode}
          onOpenCustomColorModal={() => setIsCustomColorModalOpen(true)}
        />

        <ActionBar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
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
          onCloseTab={closeTab}
          onCreateNewTab={() => createNewTab()}
        />
      </header>

      {/* Hoja Principal de Especificación de Caso de Uso */}
      <UseCaseSheet
        ref={sheetRef}
        data={currentData}
        saveIndicator={saveIndicator}
        onUpdate={updateCurrentData}
      />

      {/* Modales */}
      <CustomColorModal
        isOpen={isCustomColorModalOpen}
        onClose={() => setIsCustomColorModalOpen(false)}
        onSaveTheme={saveCustomTheme}
        customThemes={allThemes.filter(t => t.isCustom)}
        onDeleteCustomTheme={deleteCustomTheme}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <MermaidModal
        isOpen={isMermaidModalOpen}
        onClose={() => setIsMermaidModalOpen(false)}
        data={currentData}
        activeTheme={activeTheme}
        isDarkMode={isDarkMode}
        onShowToast={showToast}
      />

      {/* Contenedor de Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
