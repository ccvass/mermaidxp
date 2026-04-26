import { vi } from 'vitest';

export const exportService = {
  exportSVG: vi.fn(),
  exportPNG: vi.fn(),
  exportPDF: vi.fn(),
  exportToClipboard: vi.fn(),
};
