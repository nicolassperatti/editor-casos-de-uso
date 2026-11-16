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
    expect(blank.id).toBe('UC 003');
    expect(blank.pasos.length).toBe(3);
  });

  it('debe reordenar elementos en un arreglo de pestañas sin alterar los datos internos', () => {
    const tabA = createTabObject(createBlankUseCaseData(1), 'neon-pink', true);
    const tabB = createTabObject(createBlankUseCaseData(2), 'electric-blue', true);
    const tabC = createTabObject(createBlankUseCaseData(3), 'soft-amber', true);

    const initialList = [tabA, tabB, tabC];
    // Mover tabC (índice 2) al inicio (índice 0)
    const reordered = [...initialList];
    const [moved] = reordered.splice(2, 1);
    reordered.splice(0, 0, moved);

    expect(reordered[0].data.id).toBe('UC 003');
    expect(reordered[1].data.id).toBe('UC 001');
    expect(reordered[2].data.id).toBe('UC 002');
    expect(reordered[0].tabId).toBe(tabC.tabId);
  });

  it('debe permitir vaciar la lista de pestañas completamente para soportar el estado vacío (Empty State)', () => {
    const tabA = createTabObject(createBlankUseCaseData(1), 'neon-pink', true);
    let list = [tabA];

    // Cerrar la única pestaña abierta
    list = list.filter(t => t.tabId !== tabA.tabId);
    expect(list.length).toBe(0);
    expect(list).toEqual([]);
  });
});
