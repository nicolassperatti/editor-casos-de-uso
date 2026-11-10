import type { UseCaseData, Step, AltFlow } from '../types/useCase';

export const createStep = (accion = '', info = '', id?: string): Step => ({
  id: id || `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  accion,
  info,
});

export const createAltFlow = (pasoRef = '', condicion = '', accion = '', id?: string): AltFlow => ({
  id: id || `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  pasoRef,
  condicion,
  accion,
});

export const DEFAULT_USE_CASE_DATA: UseCaseData = {
  nombre: "Cambiar información de estudiante",
  id: "Estudiante UC 005",
  area: "Sistema de estudiantes",
  actores: "Estudiante",
  actoresSecundarios: "",
  descripcion: "Permitir al estudiante cambiar su propia información tal como el nombre, la dirección de su casa, el número telefónico de su casa, la dirección del campus, el número telefónico del campus, el número telefónico celular y demás información mediante el uso de un sitio Web.",
  evento: "El estudiante usa el sitio Web Cambiar información de estudiante, introduce el ID y contraseña de estudiante y hace clic en el botón Enviar.",
  tipoDesencadenador: {
    externo: true,
    temporal: false,
  },
  pasos: [
    {
      id: "step-1",
      accion: "El estudiante inicia sesión en el servidor Web seguro.",
      info: "ID de estudiante, contraseña",
    },
    {
      id: "step-2",
      accion: "Se lee el registro del estudiante y se verifica la contraseña.",
      info: "Registro de estudiante, ID de estudiante, contraseña",
    },
    {
      id: "step-3",
      accion: "La información personal actual del estudiante se muestra en la página Web Cambiar datos de estudiante.",
      info: "Registro de estudiante",
    },
    {
      id: "step-4",
      accion: "El estudiante introduce los cambios en el formulario Web Cambiar datos de estudiante y hace clic en el botón Enviar.",
      info: "Formulario Web Cambiar datos de estudiante",
    },
    {
      id: "step-5",
      accion: "Los cambios se validan en el servidor Web.",
      info: "Formulario Web Cambiar datos de estudiante",
    },
    {
      id: "step-6",
      accion: "Se escribe el registro en el Diario de cambios de estudiantes.",
      info: "Formulario Web Cambiar datos de estudiante",
    },
    {
      id: "step-7",
      accion: "Se actualiza el registro del estudiante en el Archivo maestro de estudiantes.",
      info: "Formulario Web Cambiar datos de estudiante, Registro de estudiante",
    },
    {
      id: "step-8",
      accion: "Se envía la página Web de confirmación al estudiante.",
      info: "Formulario Web Cambiar datos de estudiante",
    },
  ],
  flujosAlternativos: [],
  precondiciones: "El estudiante se encuentra en la página Web Cambiar información de estudiante.",
  postcondiciones: "El estudiante cambió con éxito su información personal.",
  suposiciones: "El estudiante tiene un navegador y un ID de usuario y contraseña válidos.",
  requerimientos: "Permitir que los estudiantes puedan cambiar su información personal mediante el uso de un sitio Web seguro.",
  cuestiones: "¿Hay que controlar el número de veces que se permite a un estudiante iniciar sesión?",
  prioridad: "Media",
  riesgo: "Medio",
};

export const BLANK_USE_CASE_DATA: UseCaseData = {
  nombre: "",
  id: "",
  area: "",
  actores: "",
  actoresSecundarios: "",
  descripcion: "",
  evento: "",
  tipoDesencadenador: {
    externo: true,
    temporal: false,
  },
  pasos: [
    {
      id: "step-1",
      accion: "",
      info: "",
    },
  ],
  flujosAlternativos: [],
  precondiciones: "",
  postcondiciones: "",
  suposiciones: "",
  requerimientos: "",
  cuestiones: "",
  prioridad: "Media",
  riesgo: "Bajo",
};
