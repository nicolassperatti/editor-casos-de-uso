import type { UseCaseData, Step, AltFlow } from '../../types/useCase';
import { getSanitizedFilename } from './prepareClone';
import { createStep } from '../../constants/defaultData';

export interface UseCaseExportPayload {
  version: string;
  exportedAt: string;
  theme: string;
  darkMode: boolean;
  data: UseCaseData;
}

export interface ImportedUseCaseResult {
  data: UseCaseData;
  theme?: string;
  darkMode?: boolean;
}

/**
 * Descarga los datos del caso de uso como archivo JSON formateado
 * incluyendo el tema y modo de visualización correspondiente a la pestaña.
 */
export function exportUseCaseToJson(
  data: UseCaseData,
  theme = 'neon-pink',
  darkMode = true
): void {
  const payload: UseCaseExportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    theme,
    darkMode,
    data,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
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
 * Compatible tanto con archivos que tienen estructura completa { version, theme, darkMode, data }
 * como con archivos que contienen directamente el objeto UseCaseData.
 */
export function validateAndSanitizeImportedJson(raw: unknown): ImportedUseCaseResult {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('El contenido del archivo no es un objeto JSON válido');
  }

  const root = raw as Record<string, unknown>;
  const rawData =
    typeof root.data === 'object' && root.data !== null
      ? (root.data as Record<string, unknown>)
      : root;

  const pasos: Step[] = Array.isArray(rawData.pasos)
    ? rawData.pasos.map((p, idx) => {
        const item = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>;
        return {
          id: typeof item.id === 'string' && item.id ? item.id : `step-${idx + 1}-${Date.now()}`,
          accion: typeof item.accion === 'string' ? item.accion : '',
          info: typeof item.info === 'string' ? item.info : '',
        };
      })
    : [createStep('Paso 1')];

  const flujosAlternativos: AltFlow[] = Array.isArray(rawData.flujosAlternativos)
    ? rawData.flujosAlternativos.map((a, idx) => {
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
  if (typeof rawData.tipoDesencadenador === 'object' && rawData.tipoDesencadenador !== null) {
    const td = rawData.tipoDesencadenador as Record<string, unknown>;
    tipoDesencadenador.externo = Boolean(td.externo);
    tipoDesencadenador.temporal = Boolean(td.temporal);
  }

  const cleanData: UseCaseData = {
    nombre: typeof rawData.nombre === 'string' ? rawData.nombre : '',
    id: typeof rawData.id === 'string' ? rawData.id : '',
    area: typeof rawData.area === 'string' ? rawData.area : '',
    actores: typeof rawData.actores === 'string' ? rawData.actores : '',
    actoresSecundarios: typeof rawData.actoresSecundarios === 'string' ? rawData.actoresSecundarios : '',
    descripcion: typeof rawData.descripcion === 'string' ? rawData.descripcion : '',
    evento: typeof rawData.evento === 'string' ? rawData.evento : '',
    tipoDesencadenador,
    pasos: pasos.length > 0 ? pasos : [createStep()],
    flujosAlternativos,
    precondiciones: typeof rawData.precondiciones === 'string' ? rawData.precondiciones : '',
    postcondiciones: typeof rawData.postcondiciones === 'string' ? rawData.postcondiciones : '',
    suposiciones: typeof rawData.suposiciones === 'string' ? rawData.suposiciones : '',
    requerimientos: typeof rawData.requerimientos === 'string' ? rawData.requerimientos : '',
    cuestiones: typeof rawData.cuestiones === 'string' ? rawData.cuestiones : '',
    prioridad: typeof rawData.prioridad === 'string' ? rawData.prioridad : 'Media',
    riesgo: typeof rawData.riesgo === 'string' ? rawData.riesgo : 'Medio',
  };

  const theme = typeof root.theme === 'string' ? root.theme : undefined;
  const darkMode = typeof root.darkMode === 'boolean' ? root.darkMode : undefined;

  return {
    data: cleanData,
    theme,
    darkMode,
  };
}
