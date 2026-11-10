import { describe, it, expect } from 'vitest';
import { TEMPLATES_CATALOG } from '../../constants/templates';
import { calculateComplexity } from '../../components/usecase/ComplexityBadge';
import { createStep, createAltFlow } from '../../constants/defaultData';
import type { UseCaseData } from '../../types/useCase';

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
});
