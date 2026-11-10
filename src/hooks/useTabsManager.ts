import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseCaseData, TabState } from '../types/useCase';
import { DEFAULT_USE_CASE_DATA, BLANK_USE_CASE_DATA } from '../constants/defaultData';
import { STORAGE_KEYS, BASE_THEMES } from '../constants/themes';

const MAX_HISTORY_STEPS = 50;

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

export function useTabsManager(currentThemeId: string, currentDarkMode: boolean) {
  const [tabs, setTabs] = useState<TabState[]>(() => {
    try {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS);
      if (savedTabs) {
        const parsed: TabState[] = JSON.parse(savedTabs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(t => {
            const initSnap = JSON.stringify({
              data: t.data,
              theme: t.theme || currentThemeId,
              darkMode: typeof t.darkMode === 'boolean' ? t.darkMode : currentDarkMode,
            });
            return {
              ...t,
              history: Array.isArray(t.history) && t.history.length > 0 ? t.history : [initSnap],
              historyIndex: typeof t.historyIndex === 'number' ? t.historyIndex : 0,
            };
          });
        }
      }

      // Migración transparente si el usuario tenía datos previos del HTML
      const legacyDataStr = localStorage.getItem(STORAGE_KEYS.LEGACY_FORM_DATA);
      const initialData = legacyDataStr ? JSON.parse(legacyDataStr) : DEFAULT_USE_CASE_DATA;
      return [createTabObject(initialData, currentThemeId, currentDarkMode)];
    } catch {
      return [createTabObject(DEFAULT_USE_CASE_DATA, currentThemeId, currentDarkMode)];
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

  // Asegurar que activeTabId apunte a una pestaña existente
  const activeTab = tabs.find(t => t.tabId === activeTabId) || tabs[0];
  const currentData = activeTab?.data || DEFAULT_USE_CASE_DATA;

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

  // Función para registrar un snapshot en la historia
  const pushHistorySnapshot = useCallback(
    (tabId: string, newData: UseCaseData) => {
      setTabs(prevTabs =>
        prevTabs.map(tab => {
          if (tab.tabId !== tabId) return tab;

          const snapshot = JSON.stringify({
            data: newData,
            theme: tab.theme,
            darkMode: tab.darkMode,
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
        pushHistorySnapshot(activeTab.tabId, updated);
      } else {
        if (historyDebounceTimer.current) clearTimeout(historyDebounceTimer.current);
        historyDebounceTimer.current = setTimeout(() => {
          pushHistorySnapshot(activeTab.tabId, updated);
        }, 420);
      }
    },
    [activeTab, pushHistorySnapshot]
  );

  // Deshacer (Undo)
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
            historyIndex: newIndex,
          };
        } catch {
          return tab;
        }
      })
    );
  }, [activeTab]);

  // Rehacer (Redo)
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

  // Gestión de pestañas
  const createNewTab = useCallback(
    (initialData?: UseCaseData) => {
      const newTab = createTabObject(initialData, currentThemeId, currentDarkMode);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.tabId);
    },
    [currentThemeId, currentDarkMode]
  );

  const closeTab = useCallback(
    (tabIdToClose: string) => {
      setTabs(prev => {
        if (prev.length <= 1) {
          // Si es la única pestaña, reiniciar a una en blanco
          const blank = createTabObject(BLANK_USE_CASE_DATA, currentThemeId, currentDarkMode);
          setActiveTabId(blank.tabId);
          return [blank];
        }

        const filtered = prev.filter(t => t.tabId !== tabIdToClose);
        if (activeTabId === tabIdToClose) {
          setActiveTabId(filtered[filtered.length - 1].tabId);
        }
        return filtered;
      });
    },
    [activeTabId, currentThemeId, currentDarkMode]
  );

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const resetToDefaultExample = useCallback(() => {
    updateCurrentData(() => JSON.parse(JSON.stringify(DEFAULT_USE_CASE_DATA)), true);
  }, [updateCurrentData]);

  const clearAllFields = useCallback(() => {
    updateCurrentData(() => JSON.parse(JSON.stringify(BLANK_USE_CASE_DATA)), true);
  }, [updateCurrentData]);

  const importJsonData = useCallback(
    (imported: UseCaseData) => {
      updateCurrentData(() => imported, true);
    },
    [updateCurrentData]
  );

  return {
    tabs,
    activeTabId,
    activeTab,
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
  };
}
