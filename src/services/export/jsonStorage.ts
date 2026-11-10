import type { UseCaseData, Step, AltFlow } from '../../types/useCase';
import { getSanitizedFilename } from './prepareClone';
import { createStep } from '../../constants/defaultData';

/**
 * Descarga los datos del caso de uso como archivo JSON formateado.
 */
export function exportUseCaseToJson(data: UseCaseData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getSanitizedFilename(data, 'json');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Valida y normaliza datos importados desde un archivo JSON.
 * Asegura que todos los campos requeridos y arrays de pasos existan con sus IDs.
 */
export function validateAndSanitizeImportedJson(raw: unknown): UseCaseData {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('El contenido del archivo no es un objeto JSON válido');
  }

  const obj = raw as Record<string, unknown>;

  const pasos: Step[] = Array.isArray(obj.pasos)
    ? obj.pasos.map((p, idx) => {
        const item = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>;
        return {
          id: typeof item.id === 'string' && item.id ? item.id : `step-${idx + 1}-${Date.now()}`,
          accion: typeof item.accion === 'string' ? item.accion : '',
          info: typeof item.info === 'string' ? item.info : '',
        };
      })
    : [createStep('Paso 1')];

  const flujosAlternativos: AltFlow[] = Array.isArray(obj.flujosAlternativos)
    ? obj.flujosAlternativos.map((a, idx) => {
        const item = (typeof a === 'object' && a !== null ? a : {}) as Record<string, unknown>;
        return {
          id: typeof item.id === 'string' && item.id ? item.id : `alt-${idx + 1}-${Date.now()}`,
          pasoRef: typeof item.pasoRef === 'string' ? item.pasoRef : '',
          condicion: typeof item.condicion === 'string' ? item.condicion : '',
          accion: typeof item.accion === 'string' ? item.accion : '',
        };
      })
    : [];

  const tipoDesencadenador = {
    externo: true,
    temporal: false,
  };
  if (typeof obj.tipoDesencadenador === 'object' && obj.tipoDesencadenador !== null) {
    const td = obj.tipoDesencadenador as Record<string, unknown>;
    tipoDesencadenador.externo = Boolean(td.externo);
    tipoDesencadenador.temporal = Boolean(td.temporal);
  }

  return {
    nombre: typeof obj.nombre === 'string' ? obj.nombre : '',
    id: typeof obj.id === 'string' ? obj.id : '',
    area: typeof obj.area === 'string' ? obj.area : '',
    actores: typeof obj.actores === 'string' ? obj.actores : '',
    actoresSecundarios: typeof obj.actoresSecundarios === 'string' ? obj.actoresSecundarios : '',
    descripcion: typeof obj.descripcion === 'string' ? obj.descripcion : '',
    evento: typeof obj.evento === 'string' ? obj.evento : '',
    tipoDesencadenador,
    pasos: pasos.length > 0 ? pasos : [createStep()],
    flujosAlternativos,
    precondiciones: typeof obj.precondiciones === 'string' ? obj.precondiciones : '',
    postcondiciones: typeof obj.postcondiciones === 'string' ? obj.postcondiciones : '',
    suposiciones: typeof obj.suposiciones === 'string' ? obj.suposiciones : '',
    requerimientos: typeof obj.requerimientos === 'string' ? obj.requerimientos : '',
    cuestiones: typeof obj.cuestiones === 'string' ? obj.cuestiones : '',
    prioridad: typeof obj.prioridad === 'string' ? obj.prioridad : 'Media',
    riesgo: typeof obj.riesgo === 'string' ? obj.riesgo : 'Medio',
  };
}
