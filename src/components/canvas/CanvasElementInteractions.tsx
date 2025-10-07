import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasElements } from '../../hooks/useCanvasElements';

interface CanvasElementInteractionsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pan: { x: number; y: number };
  interactionMode: 'pan' | 'drag';
}

export const CanvasElementInteractions: React.FC<CanvasElementInteractionsProps> = ({
  containerRef,
  zoom,
  pan,
  interactionMode,
}) => {
  const {
    selectElementById,
    clearElementSelection,
    moveElementTo,
    moveSelectedElements,
    resizeElementTo,
    selectedElementIds,
    getElementById,
  } = useCanvasElements();

  // Track which elements have resize editing enabled (via double-click)
  const [resizeEnabledIds, setResizeEnabledIds] = useState<Set<string>>(new Set());

  const dragStateRef = useRef<{
    isDragging: boolean;
    draggedElementId: string | null;
    startPosition: { x: number; y: number };
    startElementPosition: { x: number; y: number };
    isResizing: boolean;
    resizeHandle: string | null;
    startSize: { width: number; height: number };
  }>({
    isDragging: false,
    draggedElementId: null,
    startPosition: { x: 0, y: 0 },
    startElementPosition: { x: 0, y: 0 },
    isResizing: false,
    resizeHandle: null,
    startSize: { width: 0, height: 0 },
  });

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };

      try {
        const svg = containerRef.current.querySelector('svg');
        const transformGroup = (svg?.querySelector('g[data-custom-elements-layer]') as SVGGElement) || null;
        if (svg) {
          const pt = (svg as unknown as SVGSVGElement).createSVGPoint();
          pt.x = screenX;
          pt.y = screenY;
          const ctm = (transformGroup || svg).getScreenCTM();
          const inv = ctm && (ctm as any).inverse ? (ctm as any).inverse() : null;
          if (inv) {
            const mapped = (pt as any).matrixTransform(inv);
            return { x: mapped.x, y: mapped.y };
          }
        }
      } catch (err) {
        void err;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = (screenX - rect.left - pan.x) / zoom;
      const y = (screenY - rect.top - pan.y) / zoom;

      return { x, y };
    },
    [pan, zoom, containerRef]
  );

  // Handle mouse down on canvas elements
  const handleElementMouseDown = useCallback(
    (e: MouseEvent) => {
      const target = e.target as SVGElement;
      if (interactionMode !== 'drag' && !(target.closest('.resize-handle') || target.closest('.resize-handle-hit')))
        return;
      const elementGroup = target.closest('[data-element-id]') as SVGElement;

      if (!elementGroup) return;

      const elementId = elementGroup.getAttribute('data-element-id');
      if (!elementId) return;

      e.preventDefault();
      e.stopPropagation();
      // @ts-ignore
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        // @ts-ignore
        (e as any).stopImmediatePropagation();
      }

      const element = getElementById(elementId);
      if (!element) return;

      // Check if clicking on resize handle
      const resizeHandle = target.closest('.resize-handle, .resize-handle-hit') as SVGElement;
      if (resizeHandle) {
        const handleType = resizeHandle.getAttribute('data-handle');
        if (handleType) {
          dragStateRef.current = {
            isDragging: false,
            draggedElementId: elementId,
            startPosition: screenToCanvas(e.clientX, e.clientY),
            startElementPosition: element.position,
            isResizing: true,
            resizeHandle: handleType,
            startSize: element.size,
          };
          return;
        }
      }

      if (target.closest('.resize-handle-hit')) {
        return;
      }

      // Regular element click/drag
      if (interactionMode === 'drag') {
        dragStateRef.current = {
          isDragging: true,
          draggedElementId: elementId,
          startPosition: screenToCanvas(e.clientX, e.clientY),
          startElementPosition: element.position,
          isResizing: false,
          resizeHandle: null,
          startSize: element.size,
        };
      } else {
        // In pan mode, just select element to show handles
        dragStateRef.current = {
          isDragging: false,
          draggedElementId: elementId,
          startPosition: screenToCanvas(e.clientX, e.clientY),
          startElementPosition: element.position,
          isResizing: false,
          resizeHandle: null,
          startSize: element.size,
        };
      }

      // Select element if not already selected
      if (!selectedElementIds.includes(elementId)) {
        selectElementById(elementId);
      }
    },
    [interactionMode, getElementById, selectedElementIds, selectElementById, screenToCanvas]
  );

  // Add resize handles to selected elements
  const addResizeHandles = useCallback(
    (elementGroup: SVGElement, elementId: string) => {
      const element = getElementById(elementId);
      if (!element) {
        return;
      }
      // Remove existing handles
      elementGroup.querySelectorAll('.resize-handle').forEach((handle) => handle.remove());
      elementGroup.querySelectorAll('.resize-handle-hit').forEach((handle) => handle.remove());

      const HANDLE_SIZE = 16;
      const HIT_SIZE = 28;
      // Selection border is 2px outside element, handles should be just outside that
      // Center the handle on the corner: -HANDLE_SIZE/2 to center, -2 for border offset
      const CORNER_OFFSET = -HANDLE_SIZE / 2 - 2;
      const handles = [
        { position: 'nw', x: CORNER_OFFSET, y: CORNER_OFFSET },
        { position: 'ne', x: element.size.width - HANDLE_SIZE / 2 + 2, y: CORNER_OFFSET },
        { position: 'sw', x: CORNER_OFFSET, y: element.size.height - HANDLE_SIZE / 2 + 2 },
        {
          position: 'se',
          x: element.size.width - HANDLE_SIZE / 2 + 2,
          y: element.size.height - HANDLE_SIZE / 2 + 2,
        },
      ];

      handles.forEach((handle) => {
        const handleElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        handleElement.setAttribute('x', handle.x.toString());
        handleElement.setAttribute('y', handle.y.toString());
        handleElement.setAttribute('width', HANDLE_SIZE.toString());
        handleElement.setAttribute('height', HANDLE_SIZE.toString());
        handleElement.setAttribute('fill', '#3b82f6'); // BLUE - original color
        handleElement.setAttribute('stroke', '#ffffff'); // WHITE border - original
        handleElement.setAttribute('stroke-width', '2');
        handleElement.setAttribute('rx', '2');
        handleElement.setAttribute('ry', '2');
        handleElement.setAttribute('class', 'resize-handle');
        handleElement.setAttribute('data-handle', handle.position);
        handleElement.style.cursor = `${handle.position}-resize`;
        handleElement.style.pointerEvents = 'all';
        // Improve hit target on touch devices
        (handleElement as any).style && (handleElement as any).style.setProperty('touch-action', 'none');

        // Dedicated mousedown on handle to ensure resize starts
        handleElement.addEventListener('mousedown', (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof (ev as any).stopImmediatePropagation === 'function') {
            (ev as any).stopImmediatePropagation();
          }
          try {
            document.documentElement.dataset.canvasIsResizing = '1';
          } catch (err) {
            void err;
          }
          const element = getElementById(elementId);
          if (!element) return;
          dragStateRef.current = {
            isDragging: false,
            draggedElementId: elementId,
            startPosition: screenToCanvas(ev.clientX, ev.clientY),
            startElementPosition: element.position,
            isResizing: true,
            resizeHandle: handle.position,
            startSize: element.size,
          };
        });

        // Pointer events path (robust)
        const startPointerResize = (clientX: number, clientY: number) => {
          try {
            document.documentElement.dataset.canvasIsResizing = '1';
          } catch (err) {
            void err;
          }
          const element = getElementById(elementId);
          if (!element) return;
          dragStateRef.current = {
            isDragging: false,
            draggedElementId: elementId,
            startPosition: screenToCanvas(clientX, clientY),
            startElementPosition: element.position,
            isResizing: true,
            resizeHandle: handle.position,
            startSize: element.size,
          };
          const onMove = (pev: PointerEvent) => {
            const ds = dragStateRef.current;
            if (!ds.isResizing || !ds.draggedElementId) return;
            const current = screenToCanvas(pev.clientX, pev.clientY);
            const dx = current.x - ds.startPosition.x;
            const dy = current.y - ds.startPosition.y;
            let newW = ds.startSize.width;
            let newH = ds.startSize.height;
            let newX = ds.startElementPosition.x;
            let newY = ds.startElementPosition.y;
            switch (ds.resizeHandle) {
              case 'nw':
                newW = Math.max(20, ds.startSize.width - dx);
                newH = Math.max(20, ds.startSize.height - dy);
                // Keep element position fixed, only resize from corner
                newX = ds.startElementPosition.x;
                newY = ds.startElementPosition.y;
                break;
              case 'ne':
                newW = Math.max(20, ds.startSize.width + dx);
                newH = Math.max(20, ds.startSize.height - dy);
                // Keep element position fixed, only resize from corner
                newX = ds.startElementPosition.x;
                newY = ds.startElementPosition.y;
                break;
              case 'sw':
                newW = Math.max(20, ds.startSize.width - dx);
                newH = Math.max(20, ds.startSize.height + dy);
                // Keep element position fixed, only resize from corner
                newX = ds.startElementPosition.x;
                newY = ds.startElementPosition.y;
                break;
              case 'se':
                newW = Math.max(20, ds.startSize.width + dx);
                newH = Math.max(20, ds.startSize.height + dy);
                // Keep element position fixed, only resize from corner
                newX = ds.startElementPosition.x;
                newY = ds.startElementPosition.y;
                break;
            }
            resizeElementTo(ds.draggedElementId, { width: newW, height: newH });
            if (newX != ds.startElementPosition.x || newY != ds.startElementPosition.y) {
              moveElementTo(ds.draggedElementId, { x: newX, y: newY });
            }

            // Refresh resize handles to match new element size
            refreshResizeHandles(ds.draggedElementId);
          };
          const onUp = () => {
            try {
              delete (document.documentElement as any).dataset.canvasIsResizing;
            } catch (err) {
              void err;
            }
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp, true);

            // Reset drag state to prevent stuck behavior
            dragStateRef.current = {
              isDragging: false,
              draggedElementId: null,
              startPosition: { x: 0, y: 0 },
              startElementPosition: { x: 0, y: 0 },
              isResizing: false,
              resizeHandle: null,
              startSize: { width: 0, height: 0 },
            };
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp, true);
        };
        handleElement.addEventListener('pointerdown', (pev: PointerEvent) => {
          pev.preventDefault();
          pev.stopPropagation();
          (pev.target as any).setPointerCapture && (pev.target as any).setPointerCapture(pev.pointerId);
          startPointerResize(pev.clientX, pev.clientY);
        });

        // Invisible, larger hit area centered on the handle
        const hitRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const hitX = handle.x + HANDLE_SIZE / 2 - HIT_SIZE / 2; // Center the hit area on the visible handle
        const hitY = handle.y + HANDLE_SIZE / 2 - HIT_SIZE / 2; // Center the hit area on the visible handle
        hitRect.setAttribute('x', hitX.toString());
        hitRect.setAttribute('y', hitY.toString());
        hitRect.setAttribute('width', HIT_SIZE.toString());
        hitRect.setAttribute('height', HIT_SIZE.toString());
        hitRect.setAttribute('fill', '#000000');
        hitRect.setAttribute('opacity', '0');
        hitRect.setAttribute('class', 'resize-handle-hit');
        hitRect.setAttribute('data-handle', handle.position);
        hitRect.addEventListener('mousedown', (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          // @ts-ignore
          if (typeof (ev as any).stopImmediatePropagation === 'function') {
            // @ts-ignore
            (ev as any).stopImmediatePropagation();
          }
          try {
            document.documentElement.dataset.canvasIsResizing = '1';
          } catch (err) {
            void err;
          }
          const element = getElementById(elementId);
          if (!element) return;
          dragStateRef.current = {
            isDragging: false,
            draggedElementId: elementId,
            startPosition: screenToCanvas(ev.clientX, ev.clientY),
            startElementPosition: element.position,
            isResizing: true,
            resizeHandle: handle.position,
            startSize: element.size,
          };
        });
        hitRect.addEventListener('pointerdown', (pev: PointerEvent) => {
          pev.preventDefault();
          pev.stopPropagation();
          (pev.target as any).setPointerCapture && (pev.target as any).setPointerCapture(pev.pointerId);
          startPointerResize(pev.clientX, pev.clientY);
        });
        hitRect.style.pointerEvents = 'all';

        (hitRect as any).style && (hitRect as any).style.setProperty('touch-action', 'none');

        // Insert hit area first so the visible handle stays on top
        elementGroup.appendChild(hitRect);
        elementGroup.appendChild(handleElement);
      });
    },
    [getElementById, moveElementTo, resizeElementTo, screenToCanvas]
  );

  // Enable resize via double-click in drag mode
  const handleElementDoubleClick = useCallback(
    (e: MouseEvent) => {
      if (interactionMode !== 'drag') {
        return;
      }
      const target = e.target as Element;
      const elementGroup = target.closest('[data-element-id]') as SVGElement | null;
      if (!elementGroup) {
        return;
      }
      const elementId = elementGroup.getAttribute('data-element-id');
      if (!elementId) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      setResizeEnabledIds((prev) => {
        const next = new Set(prev);
        next.add(elementId);
        return next;
      });

      if (!selectedElementIds.includes(elementId)) {
        selectElementById(elementId);
      }
      // Add handles immediately for feedback
      addResizeHandles(elementGroup, elementId);
    },
    [interactionMode, selectedElementIds, selectElementById, addResizeHandles]
  );

  // Refresh resize handles for an element (remove and re-add)
  const refreshResizeHandles = useCallback(
    (elementId: string) => {
      const elementGroup = document.querySelector(`[data-element-id="${elementId}"]`) as SVGElement;
      if (elementGroup && resizeEnabledIds.has(elementId)) {
        addResizeHandles(elementGroup, elementId);
      }
    },
    [addResizeHandles, resizeEnabledIds]
  );

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Mouse move handler (logs disabled for clarity)
      const dragState = dragStateRef.current;

      if (!dragState.draggedElementId) return;

      const currentPosition = screenToCanvas(e.clientX, e.clientY);
      const deltaX = currentPosition.x - dragState.startPosition.x;
      const deltaY = currentPosition.y - dragState.startPosition.y;

      if (dragState.isResizing && dragState.resizeHandle) {
        // Handle resizing
        const element = getElementById(dragState.draggedElementId);
        if (!element) return;

        let newWidth = dragState.startSize.width;
        let newHeight = dragState.startSize.height;

        switch (dragState.resizeHandle) {
          case 'nw':
            newWidth = Math.max(20, dragState.startSize.width - deltaX);
            newHeight = Math.max(20, dragState.startSize.height - deltaY);
            // CRITICAL FIX: Keep element position FIXED during resize
            break;
          case 'ne':
            newWidth = Math.max(20, dragState.startSize.width + deltaX);
            newHeight = Math.max(20, dragState.startSize.height - deltaY);
            // CRITICAL FIX: Keep element position FIXED during resize
            break;
          case 'sw':
            newWidth = Math.max(20, dragState.startSize.width - deltaX);
            newHeight = Math.max(20, dragState.startSize.height + deltaY);
            // CRITICAL FIX: Keep element position FIXED during resize
            break;
          case 'se':
            newWidth = Math.max(20, dragState.startSize.width + deltaX);
            newHeight = Math.max(20, dragState.startSize.height + deltaY);
            // CRITICAL FIX: Keep element position FIXED during resize
            break;
        }

        // CRITICAL FIX: Only resize the element, NEVER move it during resize
        // This prevents the "element moves to corner of halo" issue
        resizeElementTo(dragState.draggedElementId, { width: newWidth, height: newHeight });
        // ELEMENT POSITION STAYS FIXED - let the halo expand/contract around it

        // Refresh resize handles to match new element size
        refreshResizeHandles(dragState.draggedElementId);
      } else if (dragState.isDragging) {
        // Handle dragging
        if (selectedElementIds.includes(dragState.draggedElementId) && selectedElementIds.length > 1) {
          // Move all selected elements
          moveSelectedElements({ dx: deltaX, dy: deltaY });
        } else {
          // Move single element
          const newPosition = {
            x: dragState.startElementPosition.x + deltaX,
            y: dragState.startElementPosition.y + deltaY,
          };
          moveElementTo(dragState.draggedElementId, newPosition);
        }
      }
    },
    [
      screenToCanvas,
      getElementById,
      selectedElementIds,
      resizeElementTo,
      moveElementTo,
      moveSelectedElements,
      refreshResizeHandles,
    ]
  );

  // Handle mouse up to end dragging/resizing
  const handleMouseUp = useCallback(() => {
    dragStateRef.current = {
      isDragging: false,
      draggedElementId: null,
      startPosition: { x: 0, y: 0 },
      startElementPosition: { x: 0, y: 0 },
      isResizing: false,
      resizeHandle: null,
      startSize: { width: 0, height: 0 },
    };
  }, []);

  try {
    delete (document.documentElement as any).dataset.canvasIsResizing;
  } catch (err) {
    void err;
  }

  // Handle canvas click for selection
  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as SVGElement;
      if (interactionMode !== 'drag' && !(target.closest('.resize-handle') || target.closest('.resize-handle-hit')))
        return;
      const elementGroup = target.closest('[data-element-id]');

      if (!elementGroup) {
        // Clicked on empty canvas, clear selection
        clearElementSelection();
      }
    },
    [interactionMode, clearElementSelection]
  );

  // Update resize handles when selection changes or when resize is enabled
  useEffect(() => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Remove all existing resize handles
    svgElement.querySelectorAll('.resize-handle').forEach((handle) => handle.remove());

    // Add resize handles only when in drag mode and resize was enabled (double-click)
    selectedElementIds.forEach((elementId) => {
      if (interactionMode !== 'drag') return;
      if (!resizeEnabledIds.has(elementId)) return;
      const elementGroup = svgElement.querySelector(`[data-element-id="${elementId}"]`) as SVGElement;
      if (elementGroup) {
        addResizeHandles(elementGroup, elementId);
      }
    });
  }, [selectedElementIds, addResizeHandles, containerRef, interactionMode, resizeEnabledIds, refreshResizeHandles]);

  // Set up event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    container.addEventListener('mousedown', handleElementMouseDown, true);
    container.addEventListener('dblclick', handleElementDoubleClick, true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleCanvasClick);

    // Add escape key listener to cancel resize/drag operations
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Reset drag state immediately
        dragStateRef.current = {
          isDragging: false,
          draggedElementId: null,
          startPosition: { x: 0, y: 0 },
          startElementPosition: { x: 0, y: 0 },
          isResizing: false,
          resizeHandle: null,
          startSize: { width: 0, height: 0 },
        };
        try {
          delete (document.documentElement as any).dataset.canvasIsResizing;
        } catch (err) {
          void err;
        }
        // Remove any remaining resize handles
        if (containerRef.current) {
          const svg = containerRef.current.querySelector('svg');
          if (svg) {
            const handles = svg.querySelectorAll('.resize-handle, .resize-handle-hit');
            handles.forEach((handle) => handle.remove());
          }
        }
      }
    };
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      container.removeEventListener('mousedown', handleElementMouseDown, true);
      container.removeEventListener('dblclick', handleElementDoubleClick, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [
    handleElementMouseDown,
    handleElementDoubleClick,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
    containerRef,
  ]);

  return null; // This component only handles interactions, no visual output
};

export default CanvasElementInteractions;
