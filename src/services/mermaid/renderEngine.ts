import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import type { Theme } from '../../types/useCase';

export function configureMermaidEngine(activeTheme: Theme, isDarkMode: boolean): void {
  const accentHex = isDarkMode ? activeTheme.hexDark : activeTheme.hexLight;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'antiscript',
    theme: isDarkMode ? 'dark' : 'default',
    fontFamily: 'Inter, sans-serif',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      padding: 16,
      nodeSpacing: 35,
      rankSpacing: 45,
      useMaxWidth: false,
    },
    sequence: {
      useMaxWidth: false,
      wrap: false,
      width: 220,
      noteMargin: 12,
      messageMargin: 40,
      boxMargin: 12,
      actorMargin: 90,
    },
    themeVariables: {
      primaryColor: isDarkMode ? '#1e293b' : '#ffffff',
      primaryTextColor: isDarkMode ? '#f8fafc' : '#0f172a',
      primaryBorderColor: accentHex,
      lineColor: accentHex,
      secondaryColor: isDarkMode ? '#0f172a' : '#f1f5f9',
      tertiaryColor: isDarkMode ? '#1e293b' : '#f8fafc',
    },
  });
}

export async function renderMermaidSvg(
  code: string,
  activeTheme: Theme,
  isDarkMode: boolean
): Promise<{ svg: string; id: string }> {
  configureMermaidEngine(activeTheme, isDarkMode);
  const id = `mermaid_svg_${Date.now()}`;
  const { svg } = await mermaid.render(id, code);
  return { svg, id };
}

export async function generateMermaidHighResCanvas(
  svgElement: SVGElement,
  currentZoom: number,
  isDarkMode: boolean
): Promise<HTMLCanvasElement> {
  const bgColor = isDarkMode ? '#0f172a' : '#ffffff';

  const stage = document.createElement('div');
  stage.style.position = 'fixed';
  stage.style.left = '-9999px';
  stage.style.top = '0';
  stage.style.padding = '36px';
  stage.style.backgroundColor = bgColor;
  stage.style.display = 'inline-block';
  stage.style.zIndex = '-1';

  const bbox = svgElement.getBoundingClientRect();
  const unscaledW = Math.ceil(bbox.width / (currentZoom || 1)) + 20;
  const unscaledH = Math.ceil(bbox.height / (currentZoom || 1)) + 20;

  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  clonedSvg.style.width = `${unscaledW}px`;
  clonedSvg.style.height = `${unscaledH}px`;
  clonedSvg.style.maxWidth = 'none';

  stage.appendChild(clonedSvg);
  document.body.appendChild(stage);

  try {
    const canvas = await html2canvas(stage, {
      scale: 2.5,
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
