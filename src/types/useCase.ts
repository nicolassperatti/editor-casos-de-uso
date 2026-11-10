/**
 * Tipos y modelos de datos para la especificación de Casos de Uso.
 */

export interface Step {
  id: string;
  accion: string;
  info: string;
}

export interface AltFlow {
  id: string;
  pasoRef: string; // Referencia al paso (ej: "2.a", "4b", "Paso 3")
  condicion: string;
  accion: string;
}

export interface TriggerType {
  externo: boolean;
  temporal: boolean;
}

export interface UseCaseData {
  nombre: string;
  id: string;
  area: string;
  actores: string;
  actoresSecundarios: string;
  descripcion: string;
  evento: string;
  tipoDesencadenador: TriggerType;
  pasos: Step[];
  flujosAlternativos: AltFlow[];
  precondiciones: string;
  postcondiciones: string;
  suposiciones: string;
  requerimientos: string;
  cuestiones: string;
  prioridad: string;
  riesgo: string;
}

export interface Theme {
  id: string;
  name: string;
  hexDark: string;
  hexLight: string;
  isCustom?: boolean;
}

export interface TabSnapshot {
  data: UseCaseData;
  theme: string;
  darkMode: boolean;
}

export interface TabState {
  tabId: string;
  theme: string;
  darkMode: boolean;
  data: UseCaseData;
  history: string[]; // Serializaciones JSON de TabSnapshot
  historyIndex: number;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
}

export type MermaidDiagramType = 'flowchart' | 'sequence';
