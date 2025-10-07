import { EXPORT_CONFIG } from '../constants/api.constants';
import { validationService } from './validationService';

class ExportService {
  async exportSVG(svgElement: SVGElement, filename: string = 'diagram'): Promise<void> {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;

      // Add XML declaration
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`], {
        type: EXPORT_CONFIG.SVG.mimeType,
      });

      // Validate and sanitize filename
      const sanitizedFilename = validationService.validateExportFilename(filename);

      // Download the file
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizedFilename}${EXPORT_CONFIG.SVG.extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      throw new Error('Failed to export SVG');
    }
  }

  async exportPNG(
    svgElement: SVGElement,
    filename: string = 'diagram',
    background: 'white' | 'transparent' = 'white'
  ): Promise<void> {
    try {
      // Get SVG dimensions
      const bbox = (svgElement as SVGGraphicsElement).getBBox();
      const width = bbox.width * EXPORT_CONFIG.PNG.scale;
      const height = bbox.height * EXPORT_CONFIG.PNG.scale;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set background
      if (background === 'white') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
      }

      // Convert SVG to data URL to avoid CORS issues
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

      // Create image from SVG
      const img = new Image();
      img.width = width;
      img.height = height;

      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create PNG blob'));
                return;
              }

              // Validate and sanitize filename
              const sanitizedFilename = validationService.validateExportFilename(filename);

              // Download the file
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${sanitizedFilename}${EXPORT_CONFIG.PNG.extension}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);

              resolve();
            },
            EXPORT_CONFIG.PNG.mimeType,
            EXPORT_CONFIG.PNG.quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load SVG image'));
        };

        img.src = svgDataUrl;
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      throw new Error('Failed to export PNG');
    }
  }

  async exportPDF(svgElement: SVGElement, filename: string = 'diagram'): Promise<void> {
    try {
      // Check if jsPDF is available
      const w = window as any;
      if (!w.jspdf || !w.jspdf.jsPDF) {
        throw new Error('jsPDF library not loaded');
      }

      // Get SVG dimensions
      const bbox = (svgElement as SVGGraphicsElement).getBBox();
      const svgWidth = bbox.width;
      const svgHeight = bbox.height;

      // Create PDF with landscape orientation if diagram is wider than tall
      const orientation = svgWidth > svgHeight ? 'landscape' : 'portrait';
      const pdf = new w.jspdf.jsPDF({
        orientation,
        unit: 'pt',
        format: EXPORT_CONFIG.PDF.format,
      });

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate scale to fit diagram in PDF with padding
      const padding = 40; // 40pt padding
      const scaleX = (pdfWidth - 2 * padding) / svgWidth;
      const scaleY = (pdfHeight - 2 * padding) / svgHeight;
      const scale = Math.min(scaleX, scaleY);

      // Calculate centered position
      const scaledWidth = svgWidth * scale;
      const scaledHeight = svgHeight * scale;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      // Convert SVG to canvas first for better quality
      const canvas = document.createElement('canvas');
      canvas.width = svgWidth * 2; // 2x for better quality
      canvas.height = svgHeight * 2;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to image
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.width = canvas.width;
      img.height = canvas.height;

      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png', 0.95);
          pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

          // Validate and sanitize filename
          const sanitizedFilename = validationService.validateExportFilename(filename);

          // Save PDF
          pdf.save(`${sanitizedFilename}${EXPORT_CONFIG.PDF.extension}`);

          URL.revokeObjectURL(svgUrl);
          resolve();
        };

        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = svgUrl;
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }

  async exportToClipboard(svgElement: SVGElement): Promise<void> {
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      await navigator.clipboard.writeText(svgString);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }
}

export const exportService = new ExportService();
