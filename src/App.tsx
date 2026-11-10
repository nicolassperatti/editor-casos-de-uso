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
import { ConfirmationModal, type ConfirmModalButton } from './components/modals/ConfirmationModal';
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

  const closeConfirmationDialog = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // 1. Confirmación de Cerrar Pestaña
  const handleCloseTabRequest = (tabIdToClose: string) => {
    if (tabs.length <= 1) {
      showToast('Debe permanecer al menos una pestaña abierta', 'info');
      return;
    }

    const targetTab = tabs.find(t => t.tabId === tabIdToClose);
    const title = targetTab?.data.id || targetTab?.data.nombre || 'esta pestaña';

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
    setConfirmModal({
      isOpen: true,
      title: '¿Restaurar el ejemplo original?',
      message:
        'Esto cargará los datos del ejemplo original ("Estudiante UC 005") y restablecerá el color al tema original (Rosa Neón). ¿Deseas reemplazar la pestaña actual o abrirlo en una pestaña nueva?',
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
            resetToDefaultExample(true);
            showToast('Ejemplo original abierto en nueva pestaña', 'success');
          },
        },
        {
          label: 'Reemplazar Pestaña Actual',
          style: 'accent',
          onClick: () => {
            closeConfirmationDialog();
            resetToDefaultExample(false);
            showToast('Se restauraron los datos y el tema original (Rosa Neón)', 'info');
          },
        },
      ],
    });
  };

  // 3. Confirmación de Nuevo en Blanco (3 opciones)
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: '¿Limpiar formulario actual o crear pestaña?',
      message:
        'Si limpias la pestaña actual se borrará su contenido (aunque podrás recuperarlo con Deshacer). También puedes abrir directamente una nueva pestaña en blanco.',
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
            clearAllFields(true);
            showToast('Nueva pestaña en blanco creada', 'success');
          },
        },
        {
          label: 'Limpiar Pestaña Actual',
          style: 'danger',
          onClick: () => {
            closeConfirmationDialog();
            clearAllFields(false);
            showToast('Formulario en blanco listo para editar', 'info');
          },
        },
      ],
    });
  };

  // 4. Confirmación de Importar JSON (3 opciones)
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateAndSanitizeImportedJson(parsed);
        const docLabel = result.data.id || result.data.nombre || file.name;

        setConfirmModal({
          isOpen: true,
          title: '¿Cómo deseas importar este archivo JSON?',
          message: `Estás por cargar "${docLabel}". Si reemplazas la pestaña actual se sobrescribirá lo que tienes en pantalla (puedes usar Deshacer), o puedes abrirlo en una pestaña nueva sin tocar la actual.`,
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
                importJsonData(result.data, result.theme, result.darkMode, true);
                showToast('JSON importado en una nueva pestaña', 'success');
              },
            },
            {
              label: 'Reemplazar Pestaña Actual',
              style: 'accent',
              onClick: () => {
                closeConfirmationDialog();
                importJsonData(result.data, result.theme, result.darkMode, false);
                showToast('Caso de uso importado correctamente', 'success');
              },
            },
          ],
        });
      } catch (err) {
        console.error(err);
        showToast('El archivo JSON no tiene un formato válido', 'error');
      }
    };
    reader.readAsText(file);
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

  const handleCopyPNG = async () => {
    if (!sheetRef.current) return;
    try {
      setIsCopyingPng(true);
      await copyUseCaseAsPNG(sheetRef.current, currentData, currentDarkMode);
      showToast('¡Formulario copiado al portapapeles como PNG!', 'success');
    } catch {
      try {
        await downloadUseCaseAsPNG(sheetRef.current, currentData, currentDarkMode);
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
      await downloadUseCaseAsPNG(sheetRef.current, currentData, currentDarkMode);
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
      await exportUseCaseToPDF(sheetRef.current, currentData, currentDarkMode);
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
      {/* Barra Superior con Marca, Temas y Modo Oscuro (específicos de la pestaña activa) */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <Header
          allThemes={allThemes}
          activeThemeId={currentThemeId}
          isDarkMode={currentDarkMode}
          onSelectTheme={updateCurrentTheme}
          onToggleDarkMode={() => updateCurrentDarkMode(!currentDarkMode)}
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
          onCloseTab={handleCloseTabRequest}
          onCreateNewTab={() => {
            createNewTab();
            showToast('Nueva pestaña creada', 'success');
          }}
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

      <MermaidModal
        isOpen={isMermaidModalOpen}
        onClose={() => setIsMermaidModalOpen(false)}
        data={currentData}
        activeTheme={activeTheme}
        isDarkMode={currentDarkMode}
        onShowToast={showToast}
      />

      {/* Contenedor de Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
