import type { jsPDF as JsPDFType } from 'jspdf';
import { exportService } from '../../services/exportService';
import { mermaidService } from '../../services/mermaidService';
import { Theme } from '../../types/ui.types';
import { logger } from '../../utils/logger';

interface Sheet {
  title: string;
  code: string;
}

type NotifyFn = (msg: string, type: 'info' | 'success' | 'error' | 'warning') => void;

let isExporting = false;

export async function exportSingleDiagram(format: 'svg' | 'png' | 'pdf', notify: NotifyFn) {
  if (isExporting) {
    notify('An export is already in progress', 'warning');
    return;
  }

  const svgElement: SVGElement | null =
    document.querySelector('#mermaid-container svg') || document.querySelector('.sheets-active-diagram svg');

  if (!svgElement) {
    notify('No diagram found. Please render a diagram first.', 'error');
    return;
  }

  isExporting = true;
  try {
    if (format === 'svg') {
      await exportService.exportSVG(svgElement, 'diagram');
    } else if (format === 'png') {
      await exportService.exportPNG(svgElement, 'diagram', 'white');
    } else {
      await exportService.exportPDF(svgElement, 'diagram');
    }
    notify(`Diagram exported as ${format.toUpperCase()}`, 'success');
  } catch (error) {
    logger.error('Export error:', 'ExportController', error instanceof Error ? error : undefined);
    notify(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  } finally {
    isExporting = false;
  }
}

export async function exportAllPages(sheets: Sheet[], format: 'svg' | 'png' | 'pdf', theme: string, notify: NotifyFn) {
  if (isExporting) {
    notify('An export is already in progress', 'warning');
    return;
  }

  const themeEnum = theme === 'dark' ? Theme.Dark : Theme.Light;
  notify(`Rendering ${sheets.length} diagrams...`, 'info');

  isExporting = true;
  try {
    if (format === 'pdf') {
      await exportAllAsPdf(sheets, themeEnum, notify);
    } else {
      await exportAllAsSvgOrPng(sheets, format, themeEnum, notify);
    }
  } catch {
    notify('Export failed', 'error');
  } finally {
    isExporting = false;
  }
}

async function exportAllAsPdf(sheets: Sheet[], themeEnum: Theme, notify: NotifyFn) {
  const { jsPDF } = await import('jspdf');
  let pdf: JsPDFType | null = null;
  let exported = 0;
  const failed: string[] = [];

  for (let i = 0; i < sheets.length; i++) {
    let wrapper: HTMLDivElement | null = null;
    try {
      const result = await mermaidService.render(sheets[i].code, themeEnum);
      if (!result.svg || result.error) {
        failed.push(sheets[i].title);
        continue;
      }

      wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;overflow:visible';
      wrapper.innerHTML = result.svg;
      document.body.appendChild(wrapper);

      try {
        const svgEl = wrapper.querySelector('svg')!;
        svgEl.style.maxWidth = 'none';

        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => setTimeout(r, 100));

        const rect = svgEl.getBoundingClientRect();
        const svgW = Math.max(rect.width, 200);
        const svgH = Math.max(rect.height, 150);

        svgEl.setAttribute('width', String(Math.ceil(svgW)));
        svgEl.setAttribute('height', String(Math.ceil(svgH)));
        const svgStr = new XMLSerializer().serializeToString(svgEl);

        const scale = 6;
        const cW = Math.ceil(svgW * scale);
        const cH = Math.ceil(svgH * scale);
        const canvas = document.createElement('canvas');
        canvas.width = cW;
        canvas.height = cH;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cW, cH);

        const b64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, cW, cH);
            resolve();
          };
          img.onerror = () => reject(new Error('render'));
          img.src = b64;
        });

        const a4W = 841.89,
          a4H = 595.28,
          m = 36,
          tH = 28;
        const a4orient = svgW >= svgH ? 'l' : 'p';
        const testPW = a4orient === 'l' ? a4W : a4H;
        const testPH = a4orient === 'l' ? a4H : a4W;
        const testRatio = Math.min((testPW - 2 * m) / svgW, (testPH - 2 * m - tH) / svgH);

        let pageFormat: string | [number, number];
        let orient: 'l' | 'p';

        if (testRatio >= 0.35) {
          pageFormat = 'a4';
          orient = a4orient;
        } else {
          const targetW = svgW * 0.75 + 2 * m;
          const targetH = svgH * 0.75 + 2 * m + tH;
          pageFormat = [Math.max(targetW, 200), Math.max(targetH, 200)];
          orient = targetW >= targetH ? 'l' : 'p';
        }

        if (!pdf) {
          pdf = new jsPDF({ orientation: orient, unit: 'pt', format: pageFormat });
        } else {
          pdf.addPage(pageFormat, orient);
        }

        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const maxW = pw - 2 * m;
        const maxH = ph - 2 * m - tH;
        const ratio = Math.min(maxW / svgW, maxH / svgH);
        const w = svgW * ratio;
        const h = svgH * ratio;
        const x = (pw - w) / 2;
        const y = m + tH + (maxH - h) / 2;

        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 30);
        pdf.text(sheets[i].title, pw / 2, m + 16, { align: 'center' });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage({ imageData: imgData, format: 'PNG', x, y, width: w, height: h, compression: 'NONE' });
        exported++;
      } finally {
        document.body.removeChild(wrapper);
      }
    } catch (error) {
      failed.push(sheets[i].title);
      logger.error(
        `PDF export failed for page "${sheets[i].title}":`,
        'ExportController',
        error instanceof Error ? error : undefined
      );
      if (wrapper && wrapper.parentNode) {
        document.body.removeChild(wrapper);
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (pdf && exported > 0) {
    pdf.save('diagrams.pdf');
    const msg = failed.length
      ? `Exported ${exported}/${sheets.length} pages as PDF (failed: ${failed.join(', ')})`
      : `Exported ${exported}/${sheets.length} pages as PDF`;
    notify(msg, failed.length ? 'warning' : 'success');
  } else {
    notify(`PDF export failed for all ${sheets.length} pages`, 'error');
  }
}

async function exportAllAsSvgOrPng(sheets: Sheet[], format: 'svg' | 'png', themeEnum: Theme, notify: NotifyFn) {
  const div = document.createElement('div');
  div.style.cssText = 'position:absolute;left:-9999px;top:0';
  document.body.appendChild(div);

  let exported = 0;
  const failed: string[] = [];

  try {
    for (let i = 0; i < sheets.length; i++) {
      try {
        const result = await mermaidService.render(sheets[i].code, themeEnum);
        if (result.svg) {
          div.innerHTML = result.svg;
          const svg = div.querySelector('svg');
          if (svg) {
            const name = `${(i + 1).toString().padStart(2, '0')}-${sheets[i].title.replace(/[^a-zA-Z0-9]/g, '_')}`;
            if (format === 'svg') await exportService.exportSVG(svg as unknown as SVGElement, name);
            else await exportService.exportPNG(svg as unknown as SVGElement, name, 'white');
            exported++;
            await new Promise((r) => setTimeout(r, 300));
          } else {
            failed.push(sheets[i].title);
          }
        } else {
          failed.push(sheets[i].title);
        }
      } catch (error) {
        failed.push(sheets[i].title);
        logger.error(
          `Export failed for page "${sheets[i].title}":`,
          'ExportController',
          error instanceof Error ? error : undefined
        );
      }
    }
  } finally {
    document.body.removeChild(div);
  }

  if (exported > 0) {
    const msg = failed.length
      ? `Exported ${exported}/${sheets.length} pages (failed: ${failed.join(', ')})`
      : `Exported ${exported}/${sheets.length} pages`;
    notify(msg, failed.length ? 'warning' : 'success');
  } else {
    notify(`Export failed for all ${sheets.length} pages`, 'error');
  }
}
