import React, { RefObject } from 'react';
import { useExportTrigger } from '../hooks/useExportTrigger';

interface ExportControllerProps {
  svgContainerRef: RefObject<HTMLDivElement | null>;
}

export const ExportController: React.FC<ExportControllerProps> = ({ svgContainerRef }) => {
  useExportTrigger(svgContainerRef);
  return null;
};
