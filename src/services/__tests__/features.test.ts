import { describe, it, expect } from 'vitest';
import { TEMPLATES_CATALOG } from '../../constants/templates';
import { calculateComplexity } from '../../components/usecase/ComplexityBadge';
import { createStep, createAltFlow, getNextAltFlowRef } from '../../constants/defaultData';
import { getAdaptiveThemeColor, BASE_THEMES } from '../../constants/themes';
import type { UseCaseData, Theme } from '../../types/useCase';

describe('Funciones Complementarias - Plantillas y Métricas', () => {
  describe('Catálogo de Plantillas Predefinidas', () => {
    it('debe contener las 5 plantillas requeridas con estructura válida', () => {
      expect(TEMPLATES_CATALOG.length).toBe(5);

      const ids = TEMPLATES_CATALOG.map(t => t.id);
      expect(ids).toContain('blank');
      expect(ids).toContain('auth');
      expect(ids).toContain('checkout');
      expect(ids).toContain('crud');
      expect(ids).toContain('student');

      TEMPLATES_CATALOG.forEach(template => {
        expect(template.title).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.data.pasos.length).toBeGreaterThan(0);
        expect(template.data.tipoDesencadenador).toBeDefined();
      });
    });
  });

  describe('Cálculo de Métricas y Complejidad', () => {
    const baseMock: UseCaseData = {
      nombre: 'Mock',
      id: 'MOCK 01',
      area: '',
      actores: '',
      actoresSecundarios: '',
      descripcion: '',
      evento: '',
      tipoDesencadenador: { externo: true, temporal: false },
      pasos: [],
      flujosAlternativos: [],
      precondiciones: '',
      postcondiciones: '',
      suposiciones: '',
      requerimientos: '',
      cuestiones: '',
      prioridad: 'Media',
      riesgo: 'Bajo',
    };

    it('debe clasificar como complejidad Baja casos simples sin excepciones', () => {
      const mock: UseCaseData = {
        ...baseMock,
        pasos: [createStep('Paso 1'), createStep('Paso 2')],
        flujosAlternativos: [],
      };
      const result = calculateComplexity(mock);
      expect(result.level).toBe('Baja');
      expect(result.stepsCount).toBe(2);
      expect(result.altCount).toBe(0);
    });

    it('debe clasificar como complejidad Media casos con 5-8 pasos o 1-2 excepciones', () => {
      const mock: UseCaseData = {
        ...baseMock,
        pasos: [
          createStep('P1'),
          createStep('P2'),
          createStep('P3'),
          createStep('P4'),
          createStep('P5'),
        ],
        flujosAlternativos: [createAltFlow('2.a', 'Error', 'Manejo')],
      };
      const result = calculateComplexity(mock);
      expect(result.level).toBe('Media');
      expect(result.stepsCount).toBe(5);
      expect(result.altCount).toBe(1);
    });

    it('debe clasificar como complejidad Alta casos con más de 8 pasos o más de 2 excepciones', () => {
      const mock: UseCaseData = {
        ...baseMock,
        pasos: Array.from({ length: 9 }, (_, i) => createStep(`Paso ${i + 1}`)),
        flujosAlternativos: [
          createAltFlow('1.a', 'Condicion 1', 'Accion 1'),
          createAltFlow('2.a', 'Condicion 2', 'Accion 2'),
          createAltFlow('3.a', 'Condicion 3', 'Accion 3'),
        ],
      };
      const result = calculateComplexity(mock);
      expect(result.level).toBe('Alta');
      expect(result.stepsCount).toBe(9);
      expect(result.altCount).toBe(3);
    });
  });

  describe('Generador Correlativo de Letras para Flujos Alternativos (getNextAltFlowRef)', () => {
    it('debe iniciar en 1.a cuando no hay flujos alternativos', () => {
      expect(getNextAltFlowRef([])).toBe('1.a');
    });

    it('debe generar 1.b y 1.c de forma consecutiva para el mismo paso principal', () => {
      const flows = [createAltFlow('1.a')];
      expect(getNextAltFlowRef(flows)).toBe('1.b');

      flows.push(createAltFlow('1.b'));
      expect(getNextAltFlowRef(flows)).toBe('1.c');
    });

    it('debe respetar el paso de la última excepción creada y calcular la siguiente letra', () => {
      const flows = [
        createAltFlow('1.a'),
        createAltFlow('1.b'),
        createAltFlow('2.a'),
      ];
      // Como el último es 2.a, la siguiente debe ser 2.b
      expect(getNextAltFlowRef(flows)).toBe('2.b');
    });
  });

  describe('Adaptación de Contraste para Temas Personalizados (getAdaptiveThemeColor)', () => {
    it('no debe alterar los temas base predefinidos', () => {
      const baseTheme = BASE_THEMES[0];
      expect(getAdaptiveThemeColor(baseTheme, true)).toBe(baseTheme.hexDark);
      expect(getAdaptiveThemeColor(baseTheme, false)).toBe(baseTheme.hexLight);
    });

    it('debe adaptar el color negro (#000000) a gris plata brillante (#e2e8f0) en modo oscuro', () => {
      const blackTheme: Theme = {
        id: 'custom-black',
        name: 'Negro',
        hexDark: '#000000',
        hexLight: '#000000',
        isCustom: true,
      };

      // En modo oscuro debe ser legible (#e2e8f0)
      expect(getAdaptiveThemeColor(blackTheme, true)).toBe('#e2e8f0');
      // En modo claro debe mantenerse negro (#000000) porque sobre blanco tiene contraste perfecto
      expect(getAdaptiveThemeColor(blackTheme, false)).toBe('#000000');
    });

    it('debe adaptar el color blanco (#ffffff) a pizarra oscuro en modo claro', () => {
      const whiteTheme: Theme = {
        id: 'custom-white',
        name: 'Blanco',
        hexDark: '#ffffff',
        hexLight: '#ffffff',
        isCustom: true,
      };

      // En modo claro se adapta a oscuro (#1e293b) para no perderse en el fondo blanco
      expect(getAdaptiveThemeColor(whiteTheme, false)).toBe('#1e293b');
      // En modo oscuro se mantiene blanco
      expect(getAdaptiveThemeColor(whiteTheme, true)).toBe('#ffffff');
    });
  });
});
