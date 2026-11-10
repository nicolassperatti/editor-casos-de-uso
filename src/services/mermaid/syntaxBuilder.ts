import type { UseCaseData, Theme, MermaidDiagramType } from '../../types/useCase';
import {
  wrapAndSanitizeMermaidText,
  parseStepNumberFromRef,
} from './wrapAndSanitize';
import { classifySequenceStepDirection } from './stepClassifier';

/**
 * Genera el código de sintaxis de Mermaid para Flowchart o Sequence Diagram.
 */
export function buildMermaidSyntax(
  type: MermaidDiagramType,
  data: UseCaseData,
  activeTheme: Theme,
  isDarkMode: boolean
): string {
  const d = data;
  const tipos: string[] = [];
  if (d.tipoDesencadenador?.externo) tipos.push('Externo');
  if (d.tipoDesencadenador?.temporal) tipos.push('Temporal');
  const tipoStr = tipos.length ? tipos.join(' / ') : 'No especificado';

  const validSteps = (d.pasos || []).filter(
    p => (p.accion && p.accion.trim()) || (p.info && p.info.trim())
  );
  const validAltFlows = (d.flujosAlternativos || []).filter(
    a => (a.condicion && a.condicion.trim()) || (a.accion && a.accion.trim())
  );
  const hasSecondaryActors = !!(d.actoresSecundarios && d.actoresSecundarios.trim());

  if (type === 'sequence') {
    // Modo 2: Diagrama de Secuencia Universal con Actores Secundarios y bloques ALT de Excepción
    const rawActor = (d.actores || 'Actor Principal').trim();
    const rawSecActor = (d.actoresSecundarios || '').trim();
    const actorName = wrapAndSanitizeMermaidText(rawActor, 28).replace(/<br\/>/g, ' ');
    const secActorName = hasSecondaryActors
      ? wrapAndSanitizeMermaidText(rawSecActor, 28).replace(/<br\/>/g, ' ')
      : '';
    const systemName = wrapAndSanitizeMermaidText(d.area || 'Sistema', 32).replace(/<br\/>/g, ' ');
    const ucTitle = wrapAndSanitizeMermaidText(
      `${d.id ? d.id + ' - ' : ''}${d.nombre || 'Caso de Uso'}`,
      62
    ).replace(/<br\/>/g, ' ');
    const lastParticipant = hasSecondaryActors ? 'SEC' : 'D';

    let seq = `sequenceDiagram\n`;
    seq += `    autonumber\n`;
    seq += `    actor A as ${actorName}\n`;
    seq += `    participant S as ${systemName}\n`;
    seq += `    participant D as Datos / Registros\n`;
    if (hasSecondaryActors) {
      seq += `    participant SEC as ${secActorName}\n`;
    }
    seq += `\n    Note over A,${lastParticipant}: Caso de Uso - ${ucTitle}<br/>Prioridad - ${wrapAndSanitizeMermaidText(
      d.prioridad || 'Media',
      20
    )} | Riesgo - ${wrapAndSanitizeMermaidText(d.riesgo || 'Medio', 20)}\n`;

    if (d.precondiciones && d.precondiciones.trim()) {
      seq += `    Note over A,S: Pre-condición - ${wrapAndSanitizeMermaidText(d.precondiciones, 56)}\n`;
    }

    if (d.evento && d.evento.trim()) {
      seq += `    Note over A,S: Desencadenador (${tipoStr}) - ${wrapAndSanitizeMermaidText(d.evento, 56)}\n`;
    }

    const handledAltIndices = new Set<number>();

    validSteps.forEach((p, idx) => {
      const stepNum = idx + 1;
      const stepText = wrapAndSanitizeMermaidText(p.accion || `Paso ${stepNum}`, 44);
      const infoText = p.info && p.info.trim() ? wrapAndSanitizeMermaidText(p.info, 38) : '';
      const direction = classifySequenceStepDirection(p.accion || '', rawActor, rawSecActor);

      if (direction === 'SYSTEM_TO_ACTOR') {
        seq += `    S-->>A: ${stepText}\n`;
        if (infoText) {
          seq += `    Note over A,S: Info P${stepNum} - ${infoText}\n`;
        }
      } else if (direction === 'SYSTEM_TO_SECONDARY' && hasSecondaryActors) {
        seq += `    S->>SEC: ${stepText}\n`;
        if (infoText) {
          seq += `    Note over S,SEC: Info P${stepNum} - ${infoText}\n`;
        }
      } else if (direction === 'SYSTEM_TO_DATA') {
        seq += `    S->>D: ${stepText}\n`;
        if (infoText) {
          seq += `    Note over S,D: Info P${stepNum} - ${infoText}\n`;
        }
      } else {
        seq += `    A->>S: ${stepText}\n`;
        if (infoText) {
          seq += `    Note over A,S: Info P${stepNum} - ${infoText}\n`;
        }
      }

      // Si existen flujos alternativos asociados a este paso, renderizar bloque alt
      validAltFlows.forEach((alt, altIdx) => {
        const targetStep = parseStepNumberFromRef(alt.pasoRef, validSteps.length);
        if (targetStep === stepNum) {
          handledAltIndices.add(altIdx);
          const refCode = wrapAndSanitizeMermaidText(alt.pasoRef || `${stepNum}.a`, 10);
          const condText = wrapAndSanitizeMermaidText(
            alt.condicion || 'Excepción / Condición alternativa',
            42
          ).replace(/<br\/>/g, ' ');
          const resText = wrapAndSanitizeMermaidText(alt.accion || 'Manejo de excepción', 44);
          seq += `    alt [${refCode}] ${condText}\n`;
          seq += `        S-->>A: ${resText}\n`;
          seq += `    end\n`;
        }
      });
    });

    // Flujos alternativos generales que no coincidan con un paso específico
    validAltFlows.forEach((alt, altIdx) => {
      if (!handledAltIndices.has(altIdx)) {
        const refCode = wrapAndSanitizeMermaidText(alt.pasoRef || `Alt`, 10);
        const condText = wrapAndSanitizeMermaidText(
          alt.condicion || 'Excepción / Flujo alternativo',
          42
        ).replace(/<br\/>/g, ' ');
        const resText = wrapAndSanitizeMermaidText(alt.accion || 'Resolución alternativa', 44);
        seq += `    alt [${refCode}] ${condText}\n`;
        seq += `        S-->>A: ${resText}\n`;
        seq += `    end\n`;
      }
    });

    if (d.postcondiciones && d.postcondiciones.trim()) {
      seq += `    Note over A,${lastParticipant}: Post-condición - ${wrapAndSanitizeMermaidText(
        d.postcondiciones,
        56
      )}\n`;
    }

    return seq;
  }

  // Modo 1 (Por defecto): Flowchart TD completo
  let code = `flowchart TD\n`;
  const headerTitle = wrapAndSanitizeMermaidText(
    `${d.id ? d.id + ' | ' : ''}${d.nombre || 'Caso de Uso'}`,
    48
  );
  const areaText = wrapAndSanitizeMermaidText(
    `Área: ${d.area || 'N/A'} | Prioridad: ${d.prioridad || 'N/A'} | Riesgo: ${d.riesgo || 'N/A'}`,
    52
  );
  const descText = wrapAndSanitizeMermaidText(d.descripcion || 'Sin descripción', 52);
  const actorText = wrapAndSanitizeMermaidText(`Actor Primario: ${d.actores || 'Actor'}`, 38);
  const trigText = wrapAndSanitizeMermaidText(`Evento (${tipoStr}): ${d.evento || 'Inicio'}`, 48);
  const preText = wrapAndSanitizeMermaidText(`Pre-condiciones: ${d.precondiciones || 'Ninguna'}`, 48);

  code += `    HEADER["<b>${headerTitle}</b><br/>${areaText}"]:::headerNode\n`;
  code += `    DESC["<b>Descripción:</b><br/>${descText}"]:::metaNode\n`;
  code += `    ACTOR(["<b>${actorText}</b>"]):::actorNode\n`;
  code += `    PRE["<b>${preText}</b>"]:::condNode\n`;
  code += `    TRIG{"<b>${trigText}</b>"}:::triggerNode\n\n`;

  code += `    HEADER --> DESC\n`;
  code += `    DESC --> PRE\n`;
  code += `    ACTOR --> TRIG\n`;
  code += `    PRE --> TRIG\n`;

  if (hasSecondaryActors) {
    const secActorText = wrapAndSanitizeMermaidText(
      `Actor(es) Secundario(s): ${d.actoresSecundarios}`,
      38
    );
    code += `    SEC_ACTOR(["<b>${secActorText}</b>"]):::actorNode\n`;
    code += `    SEC_ACTOR -.-> TRIG\n`;
  }
  code += `\n`;

  let prevNode = 'TRIG';
  const handledFlowAltIndices = new Set<number>();

  validSteps.forEach((p, i) => {
    const stepNum = i + 1;
    const sId = `STEP_${stepNum}`;
    const stepLabel = wrapAndSanitizeMermaidText(`${stepNum}. ${p.accion || 'Paso'}`, 44);
    code += `    ${sId}["${stepLabel}"]:::stepNode\n`;
    code += `    ${prevNode} --> ${sId}\n`;

    if (p.info && p.info.trim()) {
      const infoId = `INFO_${stepNum}`;
      const infoLabel = wrapAndSanitizeMermaidText(`Info: ${p.info}`, 36);
      code += `    ${infoId}[/"${infoLabel}"/]:::infoNode\n`;
      code += `    ${sId} -.-> ${infoId}\n`;
    }

    // Conectar ramas de flujos alternativos
    validAltFlows.forEach((alt, altIdx) => {
      const targetStep = parseStepNumberFromRef(alt.pasoRef, validSteps.length);
      if (targetStep === stepNum) {
        handledFlowAltIndices.add(altIdx);
        const altId = `ALT_${altIdx + 1}`;
        const refCode = wrapAndSanitizeMermaidText(alt.pasoRef || `${stepNum}.a`, 10);
        const condPart = wrapAndSanitizeMermaidText(alt.condicion || 'Si ocurre excepción', 38);
        const accPart = wrapAndSanitizeMermaidText(alt.accion || 'Manejo alternativo', 38);
        code += `    ${altId}["<b>[${refCode}] ${condPart}</b><br/>↳ ${accPart}"]:::warnNode\n`;
        code += `    ${sId} -. "Excepción / Alt" .-> ${altId}\n`;
      }
    });

    prevNode = sId;
  });

  // Flujos alternativos sin paso específico conectados al último paso
  validAltFlows.forEach((alt, altIdx) => {
    if (!handledFlowAltIndices.has(altIdx)) {
      const altId = `ALT_${altIdx + 1}`;
      const refCode = wrapAndSanitizeMermaidText(alt.pasoRef || `Alt`, 10);
      const condPart = wrapAndSanitizeMermaidText(alt.condicion || 'Si ocurre excepción', 38);
      const accPart = wrapAndSanitizeMermaidText(alt.accion || 'Manejo alternativo', 38);
      code += `    ${altId}["<b>[${refCode}] ${condPart}</b><br/>↳ ${accPart}"]:::warnNode\n`;
      code += `    ${prevNode} -. "Excepción / Alt" .-> ${altId}\n`;
    }
  });

  const postText = wrapAndSanitizeMermaidText(
    `Post-condiciones: ${d.postcondiciones || 'Completado'}`,
    48
  );
  const reqText = wrapAndSanitizeMermaidText(`Requerimientos: ${d.requerimientos || 'N/A'}`, 48);

  code += `\n    POST["<b>${postText}</b>"]:::condNode\n`;
  code += `    REQ["<b>${reqText}</b>"]:::metaNode\n`;
  code += `    ${prevNode} --> POST\n`;
  code += `    POST --> REQ\n`;

  if (d.cuestiones && d.cuestiones.trim()) {
    const cuestText = wrapAndSanitizeMermaidText(`Cuestiones pendientes: ${d.cuestiones}`, 48);
    code += `    CUEST["<b>${cuestText}</b>"]:::warnNode\n`;
    code += `    REQ -.-> CUEST\n`;
  }

  // Estilos de nodo dinámicos
  const accentHex = isDarkMode ? activeTheme.hexDark : activeTheme.hexLight;

  if (isDarkMode) {
    code += `\n    classDef headerNode fill:${accentHex},stroke:${accentHex},color:#ffffff,stroke-width:2px;\n`;
    code += `    classDef actorNode fill:#1e293b,stroke:${accentHex},color:#f8fafc,stroke-width:2px;\n`;
    code += `    classDef triggerNode fill:#0f172a,stroke:${accentHex},color:#f8fafc,stroke-width:2px;\n`;
    code += `    classDef stepNode fill:#1e293b,stroke:#475569,color:#f8fafc,stroke-width:1.5px;\n`;
    code += `    classDef infoNode fill:#0f172a,stroke:#64748b,color:#cbd5e1,stroke-dasharray: 4 4;\n`;
    code += `    classDef condNode fill:#172554,stroke:#3b82f6,color:#eff6ff,stroke-width:1.5px;\n`;
    code += `    classDef metaNode fill:#0f172a,stroke:#334155,color:#e2e8f0,stroke-width:1px;\n`;
    code += `    classDef warnNode fill:#451a03,stroke:#f59e0b,color:#fef3c7,stroke-width:1.5px;\n`;
  } else {
    code += `\n    classDef headerNode fill:${accentHex},stroke:${accentHex},color:#ffffff,stroke-width:2px;\n`;
    code += `    classDef actorNode fill:#f8fafc,stroke:${accentHex},color:#0f172a,stroke-width:2px;\n`;
    code += `    classDef triggerNode fill:#ffffff,stroke:${accentHex},color:#0f172a,stroke-width:2px;\n`;
    code += `    classDef stepNode fill:#ffffff,stroke:#94a3b8,color:#0f172a,stroke-width:1.5px;\n`;
    code += `    classDef infoNode fill:#f1f5f9,stroke:#94a3b8,color:#334155,stroke-dasharray: 4 4;\n`;
    code += `    classDef condNode fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a,stroke-width:1.5px;\n`;
    code += `    classDef metaNode fill:#f8fafc,stroke:#cbd5e1,color:#1e293b,stroke-width:1px;\n`;
    code += `    classDef warnNode fill:#fffbeb,stroke:#f59e0b,color:#78350f,stroke-width:1.5px;\n`;
  }

  return code;
}
