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

  // Si "Actor(es) secundario(s)" está vacío, ocultar celda lateral
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

  // Reemplazar textareas e inputs por divs con clases espejo
  const origFields = sourceSheet.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
    'textarea, input[type="text"]'
  );
  const cloneFields = clone.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
    'textarea, input[type="text"]'
  );

  cloneFields.forEach((field, i) => {
    const mirror = document.createElement('div');
    const val = origFields[i] ? origFields[i].value : field.value;

    if (field.tagName.toLowerCase() === 'input') {
      mirror.className = field.className;
      mirror.textContent = val || '';
    } else {
      mirror.className = field.className.replace('auto-textarea', 'export-text-mirror');
      mirror.textContent = val || ' ';
    }
    field.parentNode?.replaceChild(mirror, field);
  });

  return clone;
}
