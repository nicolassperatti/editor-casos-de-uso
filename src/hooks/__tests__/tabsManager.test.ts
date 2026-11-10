import { describe, it, expect } from 'vitest';
import { createTabObject, createBlankUseCaseData } from '../useTabsManager';
import { DEFAULT_USE_CASE_DATA, BLANK_USE_CASE_DATA } from '../../constants/defaultData';

describe('Gestión de Estado de Pestañas (TabState)', () => {
  it('debe inicializar una pestaña con datos limpios y un snapshot en su historial', () => {
    const tab = createTabObject(DEFAULT_USE_CASE_DATA, 'neon-pink', true);

    expect(tab.tabId).toMatch(/^tab_/);
    expect(tab.theme).toBe('neon-pink');
    expect(tab.darkMode).toBe(true);
    expect(tab.history.length).toBe(1);
    expect(tab.historyIndex).toBe(0);
    expect(tab.data.nombre).toBe(DEFAULT_USE_CASE_DATA.nombre);
  });

  it('debe crear copias inmutables e independientes al instanciar pestañas', () => {
    const tab1 = createTabObject(DEFAULT_USE_CASE_DATA, 'electric-blue', false);
    const tab2 = createTabObject(BLANK_USE_CASE_DATA, 'soft-amber', true);

    tab1.data.nombre = 'Nombre Modificado';
    expect(tab2.data.nombre).toBe('');
    expect(tab1.tabId).not.toBe(tab2.tabId);
    expect(tab1.theme).toBe('electric-blue');
    expect(tab1.darkMode).toBe(false);
    expect(tab2.theme).toBe('soft-amber');
    expect(tab2.darkMode).toBe(true);
  });

  it('debe generar una plantilla en blanco con 3 filas de pasos y numeración', () => {
    const blank = createBlankUseCaseData(3);
    expect(blank.nombre).toBe('Nuevo Caso de Uso 3');
    expect(blank.id).toBe('UC 003');
    expect(blank.pasos.length).toBe(3);
  });
});
