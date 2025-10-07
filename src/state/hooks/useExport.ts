import { useState, useCallback } from 'react';

export const useExport = () => {
  const [exportSvgTrigger, setExportSvgTrigger] = useState(0);
  const [exportPngWhiteBgTrigger, setExportPngWhiteBgTrigger] = useState(0);
  const [exportPngTransparentTrigger, setExportPngTransparentTrigger] = useState(0);
  const [exportPdfTrigger, setExportPdfTrigger] = useState(0);

  const handleExportSVG = useCallback(() => setExportSvgTrigger((prev) => prev + 1), []);
  const handleExportPngWhiteBg = useCallback(() => setExportPngWhiteBgTrigger((prev) => prev + 1), []);
  const handleExportPngTransparent = useCallback(() => setExportPngTransparentTrigger((prev) => prev + 1), []);
  const handleExportPDF = useCallback(() => setExportPdfTrigger((prev) => prev + 1), []);

  return {
    exportSvgTrigger,
    exportPngWhiteBgTrigger,
    exportPngTransparentTrigger,
    exportPdfTrigger,
    handleExportSVG,
    handleExportPngWhiteBg,
    handleExportPngTransparent,
    handleExportPDF,
  };
};
