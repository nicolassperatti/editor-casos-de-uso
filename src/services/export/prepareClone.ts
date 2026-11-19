import type { UseCaseData } from '../../types/useCase';

/**
 * Genera un nombre de archivo seguro y sanitizado para exportar.
 */
export function getSanitizedFilename(data: UseCaseData, ext: string): string {
  const rawName = (data.id || data.nombre || 'Caso_de_Uso').trim();
  const safe = rawName
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_\-\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50) || 'Caso_de_Uso';
  return `${safe}.${ext}`;
}

/**
 * Prepara una copia limpia del formulario fuera de pantalla para captura con html2canvas.
 * Sustituye textareas e inputs por divs con saltos de línea para que no se corten.
 */
export function prepareCleanCloneForExport(
  sourceSheet: HTMLElement,
  data: UseCaseData
): HTMLElement {
  const clone = sourceSheet.cloneNode(true) as HTMLElement;

  // 1. PRIMERO: Reemplazar textareas e inputs por divs con clases espejo.
  // Es CRÍTICO realizar esto ANTES de eliminar o modificar nodos del DOM
  // (como ocultar #secActorsCell si está vacío) para que los índices y la
  // correspondencia entre sourceSheet y clone coincidan exactamente 1:1.
  const origFields = sourceSheet.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
    'textarea, input[type="text"]'
  );
  const cloneFields = clone.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
    'textarea, input[type="text"]'
  );

  cloneFields.forEach((field, i) => {
    const mirror = document.createElement('div');
    if (field.id) {
      mirror.id = field.id;
    }
    // Priorizar coincidencia por id si está presente; fallback al índice 1:1
    const origById = field.id
      ? sourceSheet.querySelector<HTMLTextAreaElement | HTMLInputElement>(`#${field.id}`)
      : null;
    const val = origById ? origById.value : (origFields[i] ? origFields[i].value : field.value);

    if (field.tagName.toLowerCase() === 'input') {
      mirror.className = `${field.className} min-h-[22px] inline-flex items-center`;
      mirror.textContent = val || '\u00A0';
    } else {
      mirror.className = field.className.replace('auto-textarea', 'export-text-mirror');
      mirror.textContent = val || ' ';
    }
    field.parentNode?.replaceChild(mirror, field);
  });

  // 2. SEGUNDO: Si "Actor(es) secundario(s)" está vacío, ocultar celda lateral en el clon
  const secActorsVal = (data.actoresSecundarios || '').trim();
  const cloneSecCell = clone.querySelector('#secActorsCell');
  if (!secActorsVal && cloneSecCell) {
    const parentRow = cloneSecCell.parentElement;
    cloneSecCell.remove();
    if (parentRow && parentRow.firstElementChild) {
      parentRow.firstElementChild.classList.remove('md:col-span-7');
      parentRow.firstElementChild.classList.add('md:col-span-12');
    }
  }

  return clone;
}

export interface OffscreenExportStage {
  stage: HTMLDivElement;
  clone: HTMLElement;
  cleanup: () => void;
}

/**
 * Crea un contenedor aislado fuera de pantalla con el clon preparado
 * para capturas de alta resolución (PNG o PDF).
 */
export function createOffscreenExportStage(
  sourceSheet: HTMLElement,
  data: UseCaseData,
  isDarkMode: boolean,
  padding = '24px'
): OffscreenExportStage {
  const bgColor = isDarkMode ? '#0f172a' : '#ffffff';

  const stage = document.createElement('div');
  stage.className = 'export-mode';
  stage.style.position = 'fixed';
  stage.style.left = '-9999px';
  stage.style.top = '0';
  stage.style.width = '980px';
  stage.style.padding = padding;
  stage.style.backgroundColor = bgColor;
  stage.style.zIndex = '-1';

  const clone = prepareCleanCloneForExport(sourceSheet, data);
  stage.appendChild(clone);
  document.body.appendChild(stage);

  const cleanup = () => {
    if (stage.parentNode) {
      document.body.removeChild(stage);
    }
  };

  return { stage, clone, cleanup };
}
