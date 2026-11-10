import { describe, it, expect } from 'vitest';
import { classifySequenceStepDirection } from '../mermaid/stepClassifier';
import { buildMermaidSyntax } from '../mermaid/syntaxBuilder';
import { wrapAndSanitizeMermaidText, parseStepNumberFromRef } from '../mermaid/wrapAndSanitize';
import { DEFAULT_USE_CASE_DATA } from '../../constants/defaultData';
import { BASE_THEMES, hexToRgb } from '../../constants/themes';
import { validateAndSanitizeImportedJson } from '../export/jsonStorage';
import { getSanitizedFilename } from '../export/prepareClone';

describe('Servicios de Dominio - Mermaid y Exportación', () => {
  describe('Clasificador Semántico de Pasos de Secuencia (Español)', () => {
    it('debe clasificar acciones iniciadas por el actor primario como ACTOR_TO_SYSTEM', () => {
      const dir = classifySequenceStepDirection(
        'El estudiante inicia sesión en el servidor Web seguro.',
        'Estudiante'
      );
      expect(dir).toBe('ACTOR_TO_SYSTEM');
    });

    it('debe clasificar consultas y verificaciones de datos como SYSTEM_TO_DATA', () => {
      const dir = classifySequenceStepDirection(
        'Se lee el registro del estudiante y se verifica la contraseña.',
        'Estudiante'
      );
      expect(dir).toBe('SYSTEM_TO_DATA');
    });

    it('debe clasificar respuestas o pantallas como SYSTEM_TO_ACTOR', () => {
      const dir = classifySequenceStepDirection(
        'La información personal actual del estudiante se muestra en la página Web.',
        'Estudiante'
      );
      expect(dir).toBe('SYSTEM_TO_ACTOR');
    });

    it('debe clasificar comunicaciones hacia actores secundarios como SYSTEM_TO_SECONDARY', () => {
      const dir = classifySequenceStepDirection(
        'Se solicita autorización a la Pasarela de Pago.',
        'Estudiante',
        'Pasarela de Pago'
      );
      expect(dir).toBe('SYSTEM_TO_SECONDARY');
    });
  });

  describe('Sanitización y wrap de texto Mermaid', () => {
    it('debe sanitizar comillas, corchetes y saltos de línea conflictivos', () => {
      const raw = 'Texto con "comillas", [corchetes] y : dos puntos; punto y coma';
      const clean = wrapAndSanitizeMermaidText(raw);
      expect(clean).not.toContain('"');
      expect(clean).not.toContain('[');
      expect(clean).not.toContain(']');
      expect(clean).not.toContain(';');
      expect(clean).toContain("'comillas'");
    });

    it('debe extraer números enteros de referencias de paso', () => {
      expect(parseStepNumberFromRef('2.a', 8)).toBe(2);
      expect(parseStepNumberFromRef('Paso 5', 8)).toBe(5);
      expect(parseStepNumberFromRef('99', 8)).toBeNull(); // excede maxSteps
    });
  });

  describe('Generador de Sintaxis Mermaid (Flowchart & Sequence)', () => {
    it('debe generar diagrama de secuencia con participantes y notas estructuradas', () => {
      const code = buildMermaidSyntax('sequence', DEFAULT_USE_CASE_DATA, BASE_THEMES[0], true);
      expect(code).toContain('sequenceDiagram');
      expect(code).toContain('autonumber');
      expect(code).toContain('actor A as Estudiante');
      expect(code).toContain('participant S as Sistema de estudiantes');
      expect(code).toContain('participant D as Datos / Registros');
      expect(code).toContain('A->>S:');
      expect(code).toContain('S->>D:');
      expect(code).toContain('S-->>A:');
    });

    it('debe generar flowchart TD con todos los nodos correspondientes', () => {
      const code = buildMermaidSyntax('flowchart', DEFAULT_USE_CASE_DATA, BASE_THEMES[0], true);
      expect(code).toContain('flowchart TD');
      expect(code).toContain('HEADER[');
      expect(code).toContain('ACTOR([');
      expect(code).toContain('TRIG{');
      expect(code).toContain('STEP_1[');
      expect(code).toContain('INFO_1[/');
      expect(code).toContain('classDef headerNode');
    });
  });

  describe('Exportación y Almacenamiento JSON', () => {
    it('debe sanitizar nombres de archivo para descargas', () => {
      const filename = getSanitizedFilename(DEFAULT_USE_CASE_DATA, 'pdf');
      expect(filename).toBe('Estudiante_UC_005.pdf');
    });

    it('debe validar y completar propiedades faltantes en JSON importado', () => {
      const incomplete = {
        nombre: 'Caso Parcial',
        pasos: [{ accion: 'Hacer algo', info: '' }],
      };
      const validated = validateAndSanitizeImportedJson(incomplete);
      expect(validated.nombre).toBe('Caso Parcial');
      expect(validated.prioridad).toBe('Media');
      expect(validated.tipoDesencadenador.externo).toBe(true);
      expect(validated.pasos[0].id).toBeDefined();
    });
  });

  describe('Cálculo de Colores y Temas', () => {
    it('debe convertir colores HEX a valores RGB válidos', () => {
      const rgb = hexToRgb('#ff2a85');
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(42);
      expect(rgb.b).toBe(133);
    });
  });
});
