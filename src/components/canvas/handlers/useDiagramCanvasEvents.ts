import React, { useCallback } from 'react';

export interface UseDiagramCanvasEventsParams {
  containerRef: React.RefObject<HTMLDivElement | null>;
  interactionMode: 'pan' | 'drag' | string;
  // History grouping controls
  beginGroup: () => void;
  endGroup: () => void;
  // Pan handlers and state
  pan: {
    handlePanStart: (e: React.MouseEvent<HTMLDivElement>) => void;
    handlePanMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handlePanEnd: () => boolean; // returns whether pan ended
    isPanning: boolean;
  };
  // Drag handlers and state
  drag: {
    activeDragInfo: unknown;
    handleDragMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleDragMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleDragMouseUp: () => void;
  };
}

export function useDiagramCanvasEvents({
  containerRef,
  interactionMode,
  beginGroup,
  endGroup,
  pan,
  drag,
}: UseDiagramCanvasEventsParams) {
  const { handlePanStart, handlePanMove, handlePanEnd, isPanning } = pan;
  const { activeDragInfo, handleDragMouseDown, handleDragMouseMove, handleDragMouseUp } = drag;

  const clearHalos = useCallback(() => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const haloSelectors = [
      '.selection-border',
      '.text-selection-border',
      '.icon-selection-border',
      '.svg-shape-selection-border',
      '.resize-handle',
    ];

    haloSelectors.forEach((selector) => {
      svgElement.querySelectorAll(selector).forEach((el) => {
        (el as SVGElement).style.display = 'none';
      });
    });

    svgElement
      .querySelectorAll('rect[stroke="#3b82f6"], rect[stroke="#007bff"], rect[stroke-dasharray]')
      .forEach((el) => {
        (el as SVGElement).style.display = 'none';
      });
  }, [containerRef]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as Element;

      const isResizeHandle = target.closest('.resize-handle, .resize-handle-hit');
      const isSelectionBorder = target.closest('.selection-border, .text-selection-border, .icon-selection-border');
      if (isResizeHandle || isSelectionBorder) return;

      if (interactionMode === 'drag') {
        const closestDraggable = target.closest('.draggable-element');
        const closestMarked = target.closest('[data-draggable-marked="true"]');
        const closestDataDraggable = target.closest('[data-draggable="true"]');

        if (target.tagName === 'svg' || target.closest('svg')) {
          handleDragMouseDown(e);
          return;
        }

        const draggableElement = closestDraggable || closestMarked || closestDataDraggable;
        if (draggableElement) {
          handleDragMouseDown(e);
          return;
        }
      }

      beginGroup();
      handlePanStart(e);
    },
    [interactionMode, beginGroup, handlePanStart, handleDragMouseDown]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      try {
        if (document.documentElement.dataset.canvasIsResizing === '1') return;
      } catch (err) {
        void err;
      }
      if (interactionMode === 'pan') {
        handlePanMove(e);
        return;
      }

      if (interactionMode === 'drag') {
        if (activeDragInfo) {
          handleDragMouseMove(e);
        } else {
          handlePanMove(e);
        }
        return;
      }

      handlePanMove(e);
    },
    [interactionMode, activeDragInfo, handlePanMove, handleDragMouseMove]
  );

  const handleMouseUp = useCallback(() => {
    const panEnded = handlePanEnd();
    if (panEnded) endGroup();

    if (activeDragInfo) {
      handleDragMouseUp();
    }

    if (panEnded || isPanning) {
      clearHalos();
    }
  }, [handlePanEnd, endGroup, activeDragInfo, handleDragMouseUp, isPanning, clearHalos]);

  const handleMouseLeave = useCallback(() => {
    const panEnded = handlePanEnd();

    if (activeDragInfo) {
      handleDragMouseUp();
    }

    if (panEnded || isPanning) {
      clearHalos();
    }
  }, [handlePanEnd, activeDragInfo, handleDragMouseUp, isPanning, clearHalos]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
}
