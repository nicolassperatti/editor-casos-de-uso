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

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calcula un color adaptativo con contraste garantizado contra el fondo.
 * Si el usuario elige un color negro/muy oscuro en modo oscuro, eleva el brillo para
 * que los iconos, textos y bordes resalten con nitidez en lugar de verse apagados o finos.
 */
export function getAdaptiveThemeColor(theme: Theme, isDarkMode: boolean): string {
  const baseHex = isDarkMode ? theme.hexDark : theme.hexLight;
  if (!theme.isCustom) return baseHex;

  const baseRgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

  if (isDarkMode && hsl.l < 48) {
    // Modo Oscuro: si el color personalizado es muy oscuro (ej. negro #000000 o gris carbón):
    if (hsl.s < 18) {
      // Monocromo/negro: elevar a gris plata/titanio brillante de alto contraste
      return '#e2e8f0';
    } else {
      // Color con matiz (ej. azul noche, verde bosque): mantener tono y subir luminosidad al 70%
      const boosted = hslToRgb(hsl.h, Math.min(100, hsl.s + 15), 70);
      return rgbToHex(boosted);
    }
  } else if (!isDarkMode && hsl.l > 82) {
    // Modo Claro: si el color es blanco o casi blanco (#FFFFFF):
    if (hsl.s < 18) {
      // Monocromo/blanco: oscurecer a pizarra oscuro para excelente legibilidad sobre fondo blanco
      return '#1e293b';
    } else {
      const darkened = hslToRgb(hsl.h, Math.min(100, hsl.s + 10), 38);
      return rgbToHex(darkened);
    }
  }

  return baseHex;
}

export function applyThemeCssVariables(theme: Theme, isDarkMode: boolean): void {
  if (typeof document === 'undefined') return;

  const activeHex = getAdaptiveThemeColor(theme, isDarkMode);
  const rgb = hexToRgb(activeHex);
  const root = document.documentElement;

  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Brillo percibido (fórmula estándar ITU-R BT.601) para texto dentro de botones sólidos
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  const contrastText = brightness > 155 ? '#0f172a' : '#ffffff';

  root.style.setProperty('--accent-color', activeHex);
  root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--accent-contrast', contrastText);
  root.style.setProperty(
    '--accent-soft',
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDarkMode ? 0.16 : 0.1})`
  );
  root.style.setProperty(
    '--accent-border',
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDarkMode ? 0.48 : 0.38})`
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
