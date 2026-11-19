import { describe, it, expect } from 'vitest';
import { classifySequenceStepDirection } from '../mermaid/stepClassifier';
import { buildMermaidSyntax } from '../mermaid/syntaxBuilder';
import { wrapAndSanitizeMermaidText, parseStepNumberFromRef } from '../mermaid/wrapAndSanitize';
import { DEFAULT_USE_CASE_DATA } from '../../constants/defaultData';
import { BASE_THEMES, hexToRgb } from '../../constants/themes';
import { validateAndSanitizeImportedJson } from '../export/jsonStorage';
import { getSanitizedFilename, prepareCleanCloneForExport } from '../export/prepareClone';

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
      const result = validateAndSanitizeImportedJson(incomplete);
      expect(result.data.nombre).toBe('Caso Parcial');
      expect(result.data.prioridad).toBe('Media');
      expect(result.data.tipoDesencadenador.externo).toBe(true);
      expect(result.data.pasos[0].id).toBeDefined();
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

  describe('Preparación de Clon para Exportación (prepareCleanCloneForExport)', () => {
    class MockElement {
      tagName: string;
      id: string = '';
      className: string = '';
      value: string = '';
      textContent: string = '';
      children: MockElement[] = [];
      parentElement: MockElement | null = null;
      get parentNode(): MockElement | null {
        return this.parentElement;
      }
      classList = {
        classes: new Set<string>(),
        add: (...cls: string[]) => cls.forEach(c => this.classList.classes.add(c)),
        remove: (...cls: string[]) => cls.forEach(c => this.classList.classes.delete(c)),
        contains: (c: string) => this.classList.classes.has(c),
      };

      constructor(tagName: string) {
        this.tagName = tagName.toUpperCase();
      }

      get firstElementChild(): MockElement | null {
        return this.children[0] || null;
      }

      appendChild(child: MockElement) {
        child.parentElement = this;
        this.children.push(child);
        return child;
      }

      removeChild(child: MockElement) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
          this.children.splice(idx, 1);
          child.parentElement = null;
        }
        return child;
      }

      remove() {
        this.parentElement?.removeChild(this);
      }

      replaceChild(newChild: MockElement, oldChild: MockElement) {
        const idx = this.children.indexOf(oldChild);
        if (idx !== -1) {
          newChild.parentElement = this;
          oldChild.parentElement = null;
          this.children[idx] = newChild;
        }
        return oldChild;
      }

      cloneNode(deep?: boolean): MockElement {
        const clone = new MockElement(this.tagName);
        clone.id = this.id;
        clone.className = this.className;
        clone.value = this.value;
        clone.textContent = this.textContent;
        this.classList.classes.forEach(c => clone.classList.add(c));
        if (deep) {
          this.children.forEach(child => {
            clone.appendChild(child.cloneNode(true));
          });
        }
        return clone;
      }

      querySelectorAll<T = MockElement>(selector: string): T[] {
        const results: MockElement[] = [];
        const matches = (node: MockElement): boolean => {
          if (selector === 'textarea, input[type="text"]') {
            return node.tagName === 'TEXTAREA' || node.tagName === 'INPUT';
          }
          if (selector.startsWith('#')) {
            return node.id === selector.slice(1);
          }
          if (selector.startsWith('.')) {
            const cls = selector.slice(1);
            return node.classList.contains(cls) || node.className.includes(cls);
          }
          return false;
        };

        const traverse = (node: MockElement) => {
          node.children.forEach(child => {
            if (matches(child)) {
              results.push(child);
            }
            traverse(child);
          });
        };
        traverse(this);
        return results as unknown as T[];
      }

      querySelector<T = MockElement>(selector: string): T | null {
        return (this.querySelectorAll<T>(selector)[0] as T) || null;
      }
    }

    const setupMockDocument = () => {
      const origDoc = globalThis.document;
      globalThis.document = {
        createElement: (tag: string) => new MockElement(tag),
      } as unknown as Document;
      return () => {
        globalThis.document = origDoc;
      };
    };

    it('debe mantener correspondencia 1:1 de campos sin desplazamiento cuando actoresSecundarios está vacío', () => {
      const restoreDoc = setupMockDocument();
      try {
        const source = new MockElement('DIV');

        const fNombre = new MockElement('TEXTAREA');
        fNombre.id = 'field-nombre';
        fNombre.value = 'Crear Cuenta Nueva';
        source.appendChild(fNombre);

        const fId = new MockElement('TEXTAREA');
        fId.id = 'field-id';
        fId.value = 'AUTH UC 001';
        source.appendChild(fId);

        const fActores = new MockElement('TEXTAREA');
        fActores.id = 'field-actores';
        fActores.value = 'Dueño De Mascota';
        source.appendChild(fActores);

        const secCell = new MockElement('DIV');
        secCell.id = 'secActorsCell';
        const fSec = new MockElement('TEXTAREA');
        fSec.id = 'field-actoresSecundarios';
        fSec.value = '';
        secCell.appendChild(fSec);
        source.appendChild(secCell);

        const fDesc = new MockElement('TEXTAREA');
        fDesc.id = 'field-descripcion';
        fDesc.value = 'Permitir que un dueño pueda registrarse';
        source.appendChild(fDesc);

        const fEvento = new MockElement('TEXTAREA');
        fEvento.id = 'field-evento';
        fEvento.value = 'El usuario pulsa registrarse';
        source.appendChild(fEvento);

        const altRow = new MockElement('DIV');
        const fPasoRef = new MockElement('INPUT');
        fPasoRef.className = 'w-16';
        fPasoRef.value = '3.a';
        altRow.appendChild(fPasoRef);

        const fCond = new MockElement('TEXTAREA');
        fCond.value = 'Si el mail ya existe';
        altRow.appendChild(fCond);

        const fAcc = new MockElement('TEXTAREA');
        fAcc.value = 'Se le avisa que ya existe';
        altRow.appendChild(fAcc);
        source.appendChild(altRow);

        const fPrioridad = new MockElement('TEXTAREA');
        fPrioridad.id = 'field-prioridad';
        fPrioridad.value = 'Alta';
        source.appendChild(fPrioridad);

        const mockData = {
          ...DEFAULT_USE_CASE_DATA,
          actoresSecundarios: '',
        };

        const clone = prepareCleanCloneForExport(source as unknown as HTMLElement, mockData) as unknown as MockElement;

        // 1. #secActorsCell debe eliminarse del clon
        expect(clone.querySelector('#secActorsCell')).toBeNull();

        // 2. Descripción debe mantener su texto exacto y NO estar vacía ni desplazada
        const descMirror = clone.querySelector('#field-descripcion');
        expect(descMirror).not.toBeNull();
        expect(descMirror?.textContent).toBe('Permitir que un dueño pueda registrarse');

        // 3. Evento debe mantener su texto exacto
        const eventMirror = clone.querySelector('#field-evento');
        expect(eventMirror?.textContent).toBe('El usuario pulsa registrarse');

        // 4. El input w-16 de pasoRef debe tener "3.a" y NO el texto largo de condición
        const pasoRefMirror = clone.querySelector('.w-16');
        expect(pasoRefMirror?.textContent).toBe('3.a');

        // 5. Prioridad debe tener "Alta" y no haberse corrido
        const prioridadMirror = clone.querySelector('#field-prioridad');
        expect(prioridadMirror?.textContent).toBe('Alta');
      } finally {
        restoreDoc();
      }
    });

    it('debe conservar secActorsCell cuando actoresSecundarios tiene contenido', () => {
      const restoreDoc = setupMockDocument();
      try {
        const source = new MockElement('DIV');

        const fActores = new MockElement('TEXTAREA');
        fActores.id = 'field-actores';
        fActores.value = 'Cliente';
        source.appendChild(fActores);

        const secCell = new MockElement('DIV');
        secCell.id = 'secActorsCell';
        const fSec = new MockElement('TEXTAREA');
        fSec.id = 'field-actoresSecundarios';
        fSec.value = 'Pasarela de Pago';
        secCell.appendChild(fSec);
        source.appendChild(secCell);

        const fDesc = new MockElement('TEXTAREA');
        fDesc.id = 'field-descripcion';
        fDesc.value = 'Descripción del pago';
        source.appendChild(fDesc);

        const mockData = {
          ...DEFAULT_USE_CASE_DATA,
          actoresSecundarios: 'Pasarela de Pago',
        };

        const clone = prepareCleanCloneForExport(source as unknown as HTMLElement, mockData) as unknown as MockElement;

        expect(clone.querySelector('#secActorsCell')).not.toBeNull();
        expect(clone.querySelector('#field-actoresSecundarios')?.textContent).toBe('Pasarela de Pago');
        expect(clone.querySelector('#field-descripcion')?.textContent).toBe('Descripción del pago');
      } finally {
        restoreDoc();
      }
    });
  });
});
