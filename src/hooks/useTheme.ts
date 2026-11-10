import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Theme } from '../types/useCase';
import { BASE_THEMES, applyThemeCssVariables, STORAGE_KEYS } from '../constants/themes';

export function useTheme(activeThemeId: string, isDarkMode: boolean) {
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allThemes = useMemo<Theme[]>(() => {
    return [...BASE_THEMES, ...customThemes];
  }, [customThemes]);

  const activeTheme = useMemo<Theme>(() => {
    return allThemes.find(t => t.id === activeThemeId) || BASE_THEMES[0];
  }, [allThemes, activeThemeId]);

  // Sincronizar variables CSS y clase dark en el elemento raíz cada vez que cambie de pestaña o de tema
  useEffect(() => {
    applyThemeCssVariables(activeTheme, isDarkMode);
  }, [activeTheme, isDarkMode]);

  const saveCustomTheme = useCallback(
    (name: string, rawHex: string): { success: boolean; themeId?: string; error?: string } => {
      let hex = (rawHex || '').trim();
      if (!hex.startsWith('#')) hex = '#' + hex;

      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        return { success: false, error: 'Ingresa un código HEX válido de 6 dígitos (ej. #10B981)' };
      }

      const cleanName = (name || '').trim() || `HEX ${customThemes.length + 1}`;
      const newTheme: Theme = {
        id: `custom-${Date.now()}`,
        name: cleanName,
        hexDark: hex,
        hexLight: hex,
        isCustom: true,
      };

      setCustomThemes(prev => {
        const updated = [...prev, newTheme];
        try {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error al guardar temas personalizados:', e);
        }
        return updated;
      });

      return { success: true, themeId: newTheme.id };
    },
    [customThemes.length]
  );

  const deleteCustomTheme = useCallback(
    (themeId: string) => {
      setCustomThemes(prev => {
        const updated = prev.filter(t => t.id !== themeId);
        try {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error al actualizar temas:', e);
        }
        return updated;
      });
    },
    []
  );

  return {
    allThemes,
    activeTheme,
    saveCustomTheme,
    deleteCustomTheme,
  };
}
