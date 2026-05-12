import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./validationService');
vi.mock('../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { exportService } from './exportService';

function createMockSVG(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '100');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  svg.appendChild(rect);
  return svg;
}

describe('ExportService', () => {
  let mockSvg: SVGElement;
  let clickedLinks: HTMLAnchorElement[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSvg = createMockSVG();
    clickedLinks = [];

    // Mock URL.createObjectURL / revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Intercept link clicks
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clickedLinks.push(this);
    });
  });

  describe('exportSVG', () => {
    it('should create blob and trigger download', async () => {
      await exportService.exportSVG(mockSvg, 'test-diagram');

      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(clickedLinks).toHaveLength(1);
      expect(clickedLinks[0].download).toBe('test-diagram.svg');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should use default filename when not provided', async () => {
      await exportService.exportSVG(mockSvg);

      expect(clickedLinks[0].download).toBe('diagram.svg');
    });

    it('should include XML declaration in blob', async () => {
      await exportService.exportSVG(mockSvg, 'test');

      const blobArg = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
      const text = await blobArg.text();
      expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });
  });

  describe('exportPNG', () => {
    let mockCtx: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
      mockCtx = {
        fillRect: vi.fn(),
        drawImage: vi.fn(),
      };
      Object.defineProperty(mockCtx, 'fillStyle', { writable: true, value: '' });

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'canvas') {
          const canvas = {
            width: 0,
            height: 0,
            getContext: vi.fn().mockReturnValue(mockCtx),
            toBlob: vi.fn((cb: (blob: Blob | null) => void) => {
              cb(new Blob(['png-data'], { type: 'image/png' }));
            }),
          };
          return canvas as unknown as HTMLElement;
        }
        if (tag === 'a') {
          return Object.assign(document.createElementNS('http://www.w3.org/1999/xhtml', 'a'), {
            click: vi.fn(function (this: HTMLAnchorElement) { clickedLinks.push(this); }),
          }) as unknown as HTMLElement;
        }
        return document.createElementNS('http://www.w3.org/1999/xhtml', tag) as HTMLElement;
      });

      // Mock Image constructor
      class MockImage {
        width = 0;
        height = 0;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = '';
        get src() { return this._src; }
        set src(val: string) {
          this._src = val;
          setTimeout(() => this.onload?.(), 0);
        }
      }
      vi.stubGlobal('Image', MockImage);
    });

    it('should render SVG to canvas and trigger download', async () => {
      await exportService.exportPNG(mockSvg, 'test-png');

      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(clickedLinks).toHaveLength(1);
      expect(clickedLinks[0].download).toBe('test-png.png');
    });

    it('should handle transparent background', async () => {
      await exportService.exportPNG(mockSvg, 'test', 'transparent');

      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('exportToClipboard', () => {
    it('should write SVG string to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } });

      await exportService.exportToClipboard(mockSvg);

      expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('<svg'));
    });

    it('should throw on clipboard failure', async () => {
      Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });

      await expect(exportService.exportToClipboard(mockSvg)).rejects.toThrow('Failed to copy to clipboard');
    });
  });
});
