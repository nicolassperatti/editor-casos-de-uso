import { normalizeForMatching } from './wrapAndSanitize';

export type StepDirection =
  | 'ACTOR_TO_SYSTEM'
  | 'SYSTEM_TO_ACTOR'
  | 'SYSTEM_TO_DATA'
  | 'SYSTEM_TO_SECONDARY';

/**
 * Clasifica universalmente quién inicia y quién recibe la acción
 * en cualquier tipo de proyecto o dominio basándose en heurísticas en español.
 */
export function classifySequenceStepDirection(
  actionText: string,
  primaryActorName: string,
  secondaryActorsName = ''
): StepDirection {
  const norm = normalizeForMatching(actionText);
  const normPrimary = normalizeForMatching(primaryActorName || 'actor');
  const normSecondaryList = normalizeForMatching(secondaryActorsName)
    .split(/[,;/|]+/)
    .map(s => s.trim())
    .filter(Boolean);

  // Extraer palabras clave del actor primario (ej. "Cliente", "Paciente", "Cajero", "Operador")
  const primaryTokens = normPrimary
    .split(/[\s,;/|]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !['del', 'los', 'las', 'por', 'con', 'para', 'una', 'uno'].includes(w));

  const mentionsSecondaryActor = normSecondaryList.some(sec => sec.length > 2 && norm.includes(sec));

  // 1. Respuestas, pantallas, notificaciones o confirmaciones que el Sistema envía de vuelta al Actor Primario (S -->> A)
  const isSystemResponseToActor =
    /\b(muestran?|envian?|devuelven?|retornan?|presentan?|notifican?|despliegan?|confirman?|informan?|responden?|emiten?|alertan?|redirigen?|descargan?|imprimen?|visualizan?)\b/.test(norm) ||
    /\b(se permite el inicio|se muestra|se envia|pantalla de|pagina web de|opciones principales|mensaje de|comprobante|certificado|ticket|resumen)\b/.test(norm);

  // 2. Interacción hacia Actor Secundario / Servicio Externo si se menciona explícitamente (S ->> SEC)
  if (mentionsSecondaryActor && !isSystemResponseToActor) {
    return 'SYSTEM_TO_SECONDARY';
  }

  // 3. Operaciones internas de persistencia, validación, cálculo o consulta de datos/registros (S ->> D)
  const isDatabaseOrInternalOp =
    /\b(leen?|se lee|verifican?|se verifica|validan?|se valida|escriben?|se escribe|actualizan?|se actualiza|guardan?|se guarda|registran?|se registra|consultan?|se consulta|calculan?|se calcula|procesan?|se procesa|autentican?|autorizan?|encriptan?|almacenan?|debitan?|acreditan?|archivos?|base de datos|repositorio|diario de|maestro|inventario|historial|catalogo|servidor actualiza|sistema valida|sistema verifica)\b/.test(norm);

  // 4. Acciones iniciadas por el Actor Primario en cualquier dominio (A ->> S)
  const startsWithPrimaryToken = primaryTokens.some(tok =>
    norm.startsWith('el ' + tok) ||
    norm.startsWith('la ' + tok) ||
    norm.startsWith('los ' + tok) ||
    norm.startsWith('las ' + tok) ||
    norm.startsWith('un ' + tok) ||
    norm.startsWith(tok)
  );

  const startsWithGenericActor =
    startsWithPrimaryToken ||
    /^(el |la )?(usuario|cliente|paciente|empleado|operador|administrador|comprador|vendedor|conductor|medico|profesor|gerente|solicitante|actor|visitante)\b/.test(norm) ||
    /\b(inicia sesion|introduce|hace clic|hace click|selecciona|decide|elige|completa|ingresa|solicita|escribe|adjunta|sube|carga|escanea|paga|transfiere|confirma el|presiona|pulsa|rellena|firma|envia la peticion|envia el formulario)\b/.test(norm);

  if (startsWithGenericActor && !isSystemResponseToActor && !isDatabaseOrInternalOp) {
    return 'ACTOR_TO_SYSTEM';
  }
  if (isDatabaseOrInternalOp && !isSystemResponseToActor) {
    return 'SYSTEM_TO_DATA';
  }
  if (isSystemResponseToActor) {
    return 'SYSTEM_TO_ACTOR';
  }
  return 'ACTOR_TO_SYSTEM';
}
