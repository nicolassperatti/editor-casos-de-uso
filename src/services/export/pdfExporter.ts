import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { UseCaseData } from '../../types/useCase';
import { prepareCleanCloneForExport, getSanitizedFilename } from './prepareClone';

interface PageSlice {
  startCss: number;
  endCss: number;
}

/**
 * Exporta el caso de uso a PDF detallado y multipágina con corte inteligente por fila.
 * Evita cortar o duplicar filas y tablas entre páginas A4.
 */
export async function exportUseCaseToPDF(
  sourceSheet: HTMLElement,
  data: UseCaseData,
  isDarkMode: boolean
): Promise<void> {
  const bgColor = isDarkMode ? '#0f172a' : '#ffffff';

  // Crear contenedor off-screen para medir cada fila antes de capturar
  const stage = document.createElement('div');
  stage.className = 'export-mode';
  stage.style.position = 'fixed';
  stage.style.left = '-9999px';
  stage.style.top = '0';
  stage.style.width = '980px';
  stage.style.padding = '20px';
  stage.style.backgroundColor = bgColor;
  stage.style.zIndex = '-1';

  const clone = prepareCleanCloneForExport(sourceSheet, data);
  stage.appendChild(clone);
  document.body.appendChild(stage);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const marginMm = 10;
    const usableWidthMm = pageWidthMm - marginMm * 2;
    const usableHeightMm = pageHeightMm - marginMm * 2;

    const stageRect = stage.getBoundingClientRect();
    const totalCssWidth = stageRect.width;
    const totalCssHeight = stageRect.height;

    // Altura máxima en píxeles CSS que cabe en una página A4 manteniendo proporción
    const maxPageCssHeight = (usableHeightMm / usableWidthMm) * totalCssWidth;

    const rowElements = Array.from(
      clone.querySelectorAll<HTMLElement>('.uc-row, .uc-header-band, .uc-step-row')
    ).filter(el => el.offsetParent !== null);

    const rowBounds = rowElements.map(el => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top - stageRect.top,
        bottom: r.bottom - stageRect.top,
        height: r.height,
      };
    });

    // Calcular puntos de corte de página exactos entre filas para no cortar ni duplicar
    const pageSlices: PageSlice[] = [];
    let currentStartCss = 0;

    while (currentStartCss < totalCssHeight - 2) {
      let targetEndCss = currentStartCss + maxPageCssHeight;

      if (targetEndCss >= totalCssHeight - 2) {
        pageSlices.push({ startCss: currentStartCss, endCss: totalCssHeight });
        break;
      }

      // Buscar si alguna fila es atravesada por la línea de corte targetEndCss
      const straddlingRow = rowBounds.find(
        row => row.top < targetEndCss - 1 && row.bottom > targetEndCss + 1
      );

      if (straddlingRow) {
        // Si la fila empieza después del inicio de la página actual, cortamos justo antes
        if (straddlingRow.top > currentStartCss + 20) {
          targetEndCss = straddlingRow.top;
        }
      }

      pageSlices.push({ startCss: currentStartCss, endCss: targetEndCss });
      currentStartCss = targetEndCss;
    }

    // Renderizar el contenedor completo en alta resolución una sola vez
    const scaleFactor = 2.2;
    const fullCanvas = await html2canvas(stage, {
      scale: scaleFactor,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
    });

    const paintPageBackground = () => {
      if (isDarkMode) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidthMm, pageHeightMm, 'F');
      }
    };

    // Extraer un sub-canvas limpio para cada página calculada
    pageSlices.forEach((slice, idx) => {
      if (idx > 0) pdf.addPage();
      paintPageBackground();

      const sy = Math.round(slice.startCss * scaleFactor);
      const sHeight = Math.min(
        Math.round((slice.endCss - slice.startCss) * scaleFactor),
        fullCanvas.height - sy
      );

      if (sHeight <= 0) return;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = fullCanvas.width;
      pageCanvas.height = sHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          fullCanvas,
          0,
          sy,
          fullCanvas.width,
          sHeight,
          0,
          0,
          fullCanvas.width,
          sHeight
        );
      }

      const sliceImgData = pageCanvas.toDataURL('image/png');
      const sliceHeightMm = (sHeight * usableWidthMm) / fullCanvas.width;

      pdf.addImage(
        sliceImgData,
        'PNG',
        marginMm,
        marginMm,
        usableWidthMm,
        sliceHeightMm,
        undefined,
        'FAST'
      );
    });

    pdf.save(getSanitizedFilename(data, 'pdf'));
  } finally {
    if (stage.parentNode) {
      document.body.removeChild(stage);
    }
  }
}
