import type { Theme } from '../types/useCase';

export const BASE_THEMES: Theme[] = [
  {
    id: 'neon-pink',
    name: 'Rosa Neón',
    hexDark: '#ff2a85',
    hexLight: '#e11d74',
  },
  {
    id: 'electric-blue',
    name: 'Azul Eléctrico',
    hexDark: '#00d2ff',
    hexLight: '#0066ff',
  },
  {
    id: 'soft-amber',
    name: 'Ámbar Suave',
    hexDark: '#fbbf24',
    hexLight: '#d97706',
  },
];

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '').trim();
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  const num = parseInt(fullHex, 16);
  if (isNaN(num)) return { r: 255, g: 42, b: 133 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function applyThemeCssVariables(theme: Theme, isDarkMode: boolean): void {
  if (typeof document === 'undefined') return;

  const activeHex = isDarkMode ? theme.hexDark : theme.hexLight;
  const rgb = hexToRgb(activeHex);
  const root = document.documentElement;

  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.setProperty('--accent-color', activeHex);
  root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty(
    '--accent-soft',
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDarkMode ? 0.14 : 0.1})`
  );
  root.style.setProperty(
    '--accent-border',
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDarkMode ? 0.45 : 0.38})`
  );
}

export const STORAGE_KEYS = {
  CUSTOM_THEMES: 'uc_custom_themes',
  ACTIVE_THEME: 'uc_active_theme',
  DARK_MODE: 'uc_dark_mode',
  TABS: 'uc_tabs_v1',
  ACTIVE_TAB_ID: 'uc_active_tab_id',
  LEGACY_FORM_DATA: 'uc_form_data',
} as const;
