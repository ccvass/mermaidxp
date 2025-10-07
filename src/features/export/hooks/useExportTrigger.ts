/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, RefObject } from 'react';
import { exportService } from '../../../services/exportService';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { showNotification } from '../../../store/slices/uiSlice';

export const useExportTrigger = (svgContainerRef: RefObject<HTMLDivElement | null>) => {
  const dispatch = useAppDispatch();
  const { exportSvgTrigger, exportPngWhiteBgTrigger, exportPngTransparentTrigger, exportPdfTrigger } = useAppSelector(
    (state) => state.export
  );

  const getSvgElement = (): SVGElement | null => {
    if (!svgContainerRef.current) {
      dispatch(showNotification({ message: 'SVG container ref not available', type: 'error' }));
      return null;
    }
    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) {
      dispatch(showNotification({ message: 'SVG element not found in container', type: 'error' }));
      return null;
    }
    return svgElement;
  };

  useEffect(() => {
    if (exportSvgTrigger > 0) {
      const svg = getSvgElement();
      if (svg) {
        exportService
          .exportSVG(svg, 'diagram')
          .then(() => dispatch(showNotification({ message: 'SVG exported successfully', type: 'success' })))
          .catch((err) => dispatch(showNotification({ message: err.message, type: 'error' })));
      }
    }
  }, [exportSvgTrigger, dispatch, svgContainerRef]);

  useEffect(() => {
    if (exportPngWhiteBgTrigger > 0) {
      const svg = getSvgElement();
      if (svg) {
        exportService
          .exportPNG(svg, 'diagram', 'white')
          .then(() => dispatch(showNotification({ message: 'PNG exported successfully', type: 'success' })))
          .catch((err) => dispatch(showNotification({ message: err.message, type: 'error' })));
      }
    }
  }, [exportPngWhiteBgTrigger, dispatch, svgContainerRef]);

  useEffect(() => {
    if (exportPngTransparentTrigger > 0) {
      const svg = getSvgElement();
      if (svg) {
        exportService
          .exportPNG(svg, 'diagram', 'transparent')
          .then(() => dispatch(showNotification({ message: 'PNG exported successfully', type: 'success' })))
          .catch((err) => dispatch(showNotification({ message: err.message, type: 'error' })));
      }
    }
  }, [exportPngTransparentTrigger, dispatch, svgContainerRef]);

  useEffect(() => {
    if (exportPdfTrigger > 0) {
      const svg = getSvgElement();
      if (svg) {
        exportService
          .exportPDF(svg, 'diagram')
          .then(() => dispatch(showNotification({ message: 'PDF exported successfully', type: 'success' })))
          .catch((err) => dispatch(showNotification({ message: err.message, type: 'error' })));
      }
    }
  }, [exportPdfTrigger, dispatch, svgContainerRef]);
};
