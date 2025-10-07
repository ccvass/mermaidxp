/**
 * Lazy-loaded components for code splitting
 * Reduces initial bundle size by loading these on-demand
 */
import { lazy } from 'react';

// Export controller - only needed when user wants to export
export const LazyExportController = lazy(() =>
  import('../../features/export/components/ExportController').then((m) => ({ default: m.ExportController }))
);

// Undo/Redo Manager - legacy, only when history engine is disabled
export const LazyUndoRedoManager = lazy(() =>
  import('../UndoRedoManager').then((m) => ({ default: m.UndoRedoManager }))
);

// Diagram samples - only shown when user opens the gallery
export const LazyDiagramSamples = lazy(() =>
  import('../editor/DiagramSamples').then((m) => ({ default: m.DiagramSamples }))
);
