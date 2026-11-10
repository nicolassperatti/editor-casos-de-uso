import html2canvas from 'html2canvas';
import type { UseCaseData } from '../../types/useCase';
import { prepareCleanCloneForExport, getSanitizedFilename } from './prepareClone';

/**
 * Genera un HTMLCanvasElement de alta resolución fuera de pantalla.
 */
export async function generateCleanCanvas(
  sourceSheet: HTMLElement,
  data: UseCaseData,
  isDarkMode: boolean
): Promise<HTMLCanvasElement> {
  const bgColor = isDarkMode ? '#0f172a' : '#ffffff';

  const stage = document.createElement('div');
  stage.className = 'export-mode';
  stage.style.position = 'fixed';
  stage.style.left = '-9999px';
  stage.style.top = '0';
  stage.style.width = '980px';
  stage.style.padding = '24px';
  stage.style.backgroundColor = bgColor;
  stage.style.zIndex = '-1';

  const clone = prepareCleanCloneForExport(sourceSheet, data);
  stage.appendChild(clone);
  document.body.appendChild(stage);

  try {
    const canvas = await html2canvas(stage, {
      scale: 2.2,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
    });
    return canvas;
  } finally {
    if (stage.parentNode) {
      document.body.removeChild(stage);
    }
  }
}

/**
 * Descarga el caso de uso como archivo PNG de alta resolución.
 */
export async function downloadUseCaseAsPNG(
  sourceSheet: HTMLElement,
  data: UseCaseData,
  isDarkMode: boolean
): Promise<void> {
  const canvas = await generateCleanCanvas(sourceSheet, data, isDarkMode);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = getSanitizedFilename(data, 'png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Copia el formulario completo al portapapeles como imagen PNG.
 * Retorna true si se copió con éxito al portapapeles, o lanza error si está restringido.
 */
export async function copyUseCaseAsPNG(
  sourceSheet: HTMLElement,
  data: UseCaseData,
  isDarkMode: boolean
): Promise<void> {
  const canvas = await generateCleanCanvas(sourceSheet, data, isDarkMode);
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/png')
  );

  if (!blob) throw new Error('No se pudo generar el blob de la imagen');

  if (navigator.clipboard && window.ClipboardItem) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  } else {
    throw new Error('ClipboardItem no soportado por este navegador');
  }
}
