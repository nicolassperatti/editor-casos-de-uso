import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseCaseData, TabState } from '../types/useCase';
import { DEFAULT_USE_CASE_DATA, createStep } from '../constants/defaultData';
import { STORAGE_KEYS, BASE_THEMES } from '../constants/themes';

const MAX_HISTORY_STEPS = 50;

export const createBlankUseCaseData = (index = 1): UseCaseData => ({
  nombre: `Nuevo Caso de Uso ${index}`,
  id: `UC 00${index}`,
  area: '',
  actores: '',
  actoresSecundarios: '',
  descripcion: '',
  evento: '',
  tipoDesencadenador: { externo: true, temporal: false },
  pasos: [
    createStep(''),
    createStep(''),
    createStep(''),
  ],
  flujosAlternativos: [],
  precondiciones: '',
  postcondiciones: '',
  suposiciones: '',
  requerimientos: '',
  cuestiones: '',
  prioridad: 'Media',
  riesgo: 'Medio',
});

export function createTabObject(
  dataObj?: UseCaseData,
  theme = BASE_THEMES[0].id,
  darkMode = true
): TabState {
  const cleanData: UseCaseData = JSON.parse(
    JSON.stringify(dataObj || DEFAULT_USE_CASE_DATA)
  );
  const initialSnapshot = JSON.stringify({
    data: cleanData,
    theme,
    darkMode,
  });

  return {
    tabId: `tab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    theme,
    darkMode,
    data: cleanData,
    history: [initialSnapshot],
    historyIndex: 0,
  };
}

export function useTabsManager() {
  const [tabs, setTabs] = useState<TabState[]>(() => {
    try {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS);
      if (savedTabs) {
        const parsed: TabState[] = JSON.parse(savedTabs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(t => {
            const theme = t.theme || BASE_THEMES[0].id;
            const darkMode = typeof t.darkMode === 'boolean' ? t.darkMode : true;
            const initSnap = JSON.stringify({
              data: t.data,
              theme,
              darkMode,
            });
            return {
              ...t,
              theme,
              darkMode,
              history: Array.isArray(t.history) && t.history.length > 0 ? t.history : [initSnap],
              historyIndex: typeof t.historyIndex === 'number' ? t.historyIndex : 0,
            };
          });
        }
      }

      // Migración transparente si existían datos anteriores
      const legacyDataStr = localStorage.getItem(STORAGE_KEYS.LEGACY_FORM_DATA);
      const initialData = legacyDataStr ? JSON.parse(legacyDataStr) : DEFAULT_USE_CASE_DATA;
      return [createTabObject(initialData, BASE_THEMES[0].id, true)];
    } catch {
      return [createTabObject(DEFAULT_USE_CASE_DATA, BASE_THEMES[0].id, true)];
    }
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB_ID);
      return savedActive || (tabs[0]?.tabId ?? '');
    } catch {
      return tabs[0]?.tabId ?? '';
    }
  });

  const [saveIndicator, setSaveIndicator] = useState<string>('Guardado automático activo');
  const historyDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pestaña activa
  const activeTab = tabs.find(t => t.tabId === activeTabId) || tabs[0];
  const currentData = activeTab?.data || DEFAULT_USE_CASE_DATA;
  const currentThemeId = activeTab?.theme || BASE_THEMES[0].id;
  const currentDarkMode = typeof activeTab?.darkMode === 'boolean' ? activeTab.darkMode : true;

  // Persistir en localStorage
  useEffect(() => {
    try {
      const serializableTabs = tabs.map(t => ({
        tabId: t.tabId,
        theme: t.theme,
        darkMode: t.darkMode,
        data: t.data,
        history: (t.history || []).slice(-25),
        historyIndex: Math.min(
          t.historyIndex,
          Math.max(0, (t.history || []).slice(-25).length - 1)
        ),
      }));

      localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(serializableTabs));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB_ID, activeTabId);

      const now = new Date();
      setSaveIndicator(
        `Guardado ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (err) {
      console.warn('Error al guardar pestañas en almacenamiento local:', err);
    }
  }, [tabs, activeTabId]);

  // Push snapshot a historial
  const pushHistorySnapshot = useCallback(
    (tabId: string, newData: UseCaseData, theme: string, darkMode: boolean) => {
      setTabs(prevTabs =>
        prevTabs.map(tab => {
          if (tab.tabId !== tabId) return tab;

          const snapshot = JSON.stringify({
            data: newData,
            theme,
            darkMode,
          });

          if (tab.history[tab.historyIndex] === snapshot) {
            return tab;
          }

          const trimmed = tab.history.slice(0, tab.historyIndex + 1);
          trimmed.push(snapshot);

          let newHistory = trimmed;
          let newIndex = tab.historyIndex + 1;

          if (trimmed.length > MAX_HISTORY_STEPS) {
            newHistory = trimmed.slice(1);
            newIndex = newHistory.length - 1;
          }

          return {
            ...tab,
            data: newData,
            theme,
            darkMode,
            history: newHistory,
            historyIndex: newIndex,
          };
        })
      );
    },
    []
  );

  // Actualizar datos del caso de uso activo
  const updateCurrentData = useCallback(
    (updater: (prev: UseCaseData) => UseCaseData, immediateHistory = false) => {
      if (!activeTab) return;

      const updated = updater(activeTab.data);

      setTabs(prev =>
        prev.map(t => (t.tabId === activeTab.tabId ? { ...t, data: updated } : t))
      );

      if (immediateHistory) {
        if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
        pushHistorySnapshot(activeTab.tabId, updated, activeTab.theme, activeTab.darkMode);
      } else {
        if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
        historyDebounceTimer.current = setTimeout(() => {
          pushHistorySnapshot(activeTab.tabId, updated, activeTab.theme, activeTab.darkMode);
        }, 420);
      }
    },
    [activeTab, pushHistorySnapshot]
  );

  // Actualizar tema específico de la pestaña activa (con snapshot de historial)
  const updateCurrentTheme = useCallback(
    (themeId: string) => {
      if (!activeTab) return;
      if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);

      setTabs(prev =>
        prev.map(t => (t.tabId === activeTab.tabId ? { ...t, theme: themeId } : t))
      );
      pushHistorySnapshot(activeTab.tabId, activeTab.data, themeId, activeTab.darkMode);
    },
    [activeTab, pushHistorySnapshot]
  );

  // Actualizar modo oscuro de la pestaña activa (con snapshot de historial)
  const updateCurrentDarkMode = useCallback(
    (isDark: boolean) => {
      if (!activeTab) return;
      if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);

      setTabs(prev =>
        prev.map(t => (t.tabId === activeTab.tabId ? { ...t, darkMode: isDark } : t))
      );
      pushHistorySnapshot(activeTab.tabId, activeTab.data, activeTab.theme, isDark);
    },
    [activeTab, pushHistorySnapshot]
  );

  // Deshacer (Undo) - restaura datos, tema y modo oscuro del snapshot
  const undo = useCallback(() => {
    if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
    if (!activeTab || activeTab.historyIndex <= 0) return;

    setTabs(prev =>
      prev.map(tab => {
        if (tab.tabId !== activeTab.tabId) return tab;
        const newIndex = tab.historyIndex - 1;
        const snapshotStr = tab.history[newIndex];
        if (!snapshotStr) return tab;

        try {
          const parsed = JSON.parse(snapshotStr);
          return {
            ...tab,
            data: parsed.data,
            theme: parsed.theme || tab.theme,
            darkMode: typeof parsed.darkMode === 'boolean' ? parsed.darkMode : tab.darkMode,
            historyIndex: newIndex,
          };
        } catch {
          return tab;
        }
      })
    );
  }, [activeTab]);

  // Rehacer (Redo) - restaura datos, tema y modo oscuro del snapshot
  const redo = useCallback(() => {
    if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;

    setTabs(prev =>
      prev.map(tab => {
        if (tab.tabId !== activeTab.tabId) return tab;
        const newIndex = tab.historyIndex + 1;
        const snapshotStr = tab.history[newIndex];
        if (!snapshotStr) return tab;

        try {
          const parsed = JSON.parse(snapshotStr);
          return {
            ...tab,
            data: parsed.data,
            theme: parsed.theme || tab.theme,
            darkMode: typeof parsed.darkMode === 'boolean' ? parsed.darkMode : tab.darkMode,
            historyIndex: newIndex,
          };
        } catch {
          return tab;
        }
      })
    );
  }, [activeTab]);

  const canUndo = activeTab ? activeTab.historyIndex > 0 : false;
  const canRedo = activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false;

  // Atajos de teclado Ctrl+Z y Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Crear nueva pestaña (con datos o en blanco)
  const createNewTab = useCallback(
    (customData?: UseCaseData, customTheme?: string, customDark?: boolean) => {
      const dataToUse = customData || createBlankUseCaseData(tabs.length + 1);
      const themeToUse = customTheme || currentThemeId;
      const darkToUse = typeof customDark === 'boolean' ? customDark : currentDarkMode;

      const newTab = createTabObject(dataToUse, themeToUse, darkToUse);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.tabId);
    },
    [tabs.length, currentThemeId, currentDarkMode]
  );

  // Cerrar pestaña por ID
  const closeTab = useCallback(
    (tabIdToClose: string) => {
      setTabs(prev => {
        if (prev.length <= 1) return prev;

        const filtered = prev.filter(t => t.tabId !== tabIdToClose);
        if (activeTabId === tabIdToClose) {
          const closedIndex = prev.findIndex(t => t.tabId === tabIdToClose);
          const nextActive = filtered[Math.max(0, closedIndex - 1)] || filtered[0];
          setActiveTabId(nextActive.tabId);
        }
        return filtered;
      });
    },
    [activeTabId]
  );

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  // Restaurar el ejemplo original (en pestaña actual o en una nueva)
  const resetToDefaultExample = useCallback(
    (inNewTab = false) => {
      if (inNewTab) {
        createNewTab(
          JSON.parse(JSON.stringify(DEFAULT_USE_CASE_DATA)),
          'neon-pink',
          currentDarkMode
        );
      } else {
        if (!activeTab) return;
        const cleanData = JSON.parse(JSON.stringify(DEFAULT_USE_CASE_DATA));
        setTabs(prev =>
          prev.map(t =>
            t.tabId === activeTab.tabId ? { ...t, data: cleanData, theme: 'neon-pink' } : t
          )
        );
        pushHistorySnapshot(activeTab.tabId, cleanData, 'neon-pink', activeTab.darkMode);
      }
    },
    [activeTab, currentDarkMode, createNewTab, pushHistorySnapshot]
  );

  // Limpiar campos / nuevo en blanco (en pestaña actual o en una nueva)
  const clearAllFields = useCallback(
    (inNewTab = false) => {
      if (inNewTab) {
        createNewTab(createBlankUseCaseData(tabs.length + 1));
      } else {
        if (!activeTab) return;
        const blank = createBlankUseCaseData(tabs.length);
        setTabs(prev =>
          prev.map(t => (t.tabId === activeTab.tabId ? { ...t, data: blank } : t))
        );
        pushHistorySnapshot(activeTab.tabId, blank, activeTab.theme, activeTab.darkMode);
      }
    },
    [activeTab, tabs.length, createNewTab, pushHistorySnapshot]
  );

  // Importar JSON (en pestaña actual o en una nueva)
  const importJsonData = useCallback(
    (imported: UseCaseData, importedTheme?: string, importedDark?: boolean, inNewTab = false) => {
      const themeToUse = importedTheme || currentThemeId;
      const darkToUse = typeof importedDark === 'boolean' ? importedDark : currentDarkMode;

      if (inNewTab) {
        createNewTab(imported, themeToUse, darkToUse);
      } else {
        if (!activeTab) return;
        setTabs(prev =>
          prev.map(t =>
            t.tabId === activeTab.tabId
              ? { ...t, data: imported, theme: themeToUse, darkMode: darkToUse }
              : t
          )
        );
        pushHistorySnapshot(activeTab.tabId, imported, themeToUse, darkToUse);
      }
    },
    [activeTab, currentThemeId, currentDarkMode, createNewTab, pushHistorySnapshot]
  );

  return {
    tabs,
    activeTabId,
    activeTab,
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
  };
}
