import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { renderDiagram, setRenderResult } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { setPlacingElement, fitToViewport } from '../../store/slices/canvasSlice';
import { useDragAndDrop } from '../../state/hooks/useDragAndDrop';
import { usePan } from '../../state/hooks/usePan';
import { DragIndicator } from './DragIndicator';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { Theme } from '../../types/ui.types';
// import { initUnifiedResize } from '../../features/canvas/utils/unifiedResize'; // DISABLED - using CanvasElementInteractions
import { useDiagramCanvasEvents } from './handlers/useDiagramCanvasEvents';
import { useElementPlacement } from './placement/useElementPlacement';
import CanvasElementRenderer from './CanvasElementRenderer';
import CanvasElementInteractions from './CanvasElementInteractions';
import { useCanvasElements } from '../../hooks/useCanvasElements';
import {
  buildElementFromToolbarDrag,
  describeToolbarDrag,
  extractToolbarDragData,
  hasToolbarDragData,
} from '../../features/canvas/utils/toolbarDrag';
import CollaborationManager from '../collaboration/CollaborationManager';
import CollaborativeCursors from '../collaboration/CollaborativeCursors';
import { logger } from '../../utils/logger';
// Collaboration imports disabled

// Constants
const CustomElementSelector = '.custom-text-group, .custom-image-group, .custom-svg-shape-group, .custom-icon-group';

declare global {
  interface Window {
    mermaid: Record<string, unknown>;
  }
}

export const DiagramDisplay: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mermaidCode, renderResult, isLoading, error } = useAppSelector((state) => state.diagram);
  const sheetsActive = useAppSelector((state) => state.diagram.sheets.length > 0);
  const { theme } = useAppSelector((state) => state.ui);
  const { zoom, pan, interactionMode, placingElement } = useAppSelector((state) => state.canvas);

  const containerRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExecutingRef = useRef(false); // Prevent concurrent executions
  const lastRenderRef = useRef<string>(''); // Track last rendered content
  // const renderThrottleRef = useRef<NodeJS.Timeout>(); // Throttle renders - Unused
  const [isRendering, setIsRendering] = useState(false);
  const [renderVersion, setRenderVersion] = useState(0);
  const { beginGroup, endGroup, captureNow } = useHistoryEngine();
  const { createElement, deleteSelectedElements, hasSelection } = useCanvasElements();
  // Collaboration disabled
  // Collaboration disabled — stub values
  const users = [] as never[];
  const sessionId: string | undefined = undefined;
  const isConnected = false;
  const isEnabled = false;

  // Store custom elements before container wipe for re-insertion later
  const extractedElementsRef = useRef<
    Array<{
      element: SVGElement;
      originalParent: Element | null;
      nextSibling: Node | null;
    }>
  >([]);

  // Initialize drag and drop functionality
  const {
    activeDragInfo,
    handleMouseDown: handleDragMouseDown,
    handleMouseMove: handleDragMouseMove,
    handleMouseUpOrLeave: handleDragMouseUp,
    markDraggableElements,
  } = useDragAndDrop(containerRef, zoom);

  // Initialize pan functionality
  const { handlePanStart, handlePanMove, handlePanEnd, updateCursor, isPanning } = usePan(containerRef);

  // Update cursor when interaction mode changes
  useEffect(() => {
    updateCursor();
  }, [interactionMode, updateCursor]);

  // Debounced render function
  const debouncedRender = useCallback(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      if (sheetsActive) return; // Don't render when in sheets mode
      if (mermaidCode.trim()) {
        const themeEnum = theme === 'dark' ? Theme.Dark : Theme.Light;
        dispatch(renderDiagram({ code: mermaidCode, theme: themeEnum }));
      } else {
        // Clear the diagram when code is empty
        // Clear custom elements first
        extractedElementsRef.current = [];
        // Set render result to null (this will trigger React to unmount properly)
        dispatch(setRenderResult(null));
      }
    }, 300); // 300ms debounce
  }, [mermaidCode, theme, dispatch, sheetsActive]);

  // Initialize Mermaid
  useEffect(() => {
    // Mermaid initialization is handled by MermaidService — do not duplicate here
  }, [theme]);

  // Trigger render when code or theme changes
  useEffect(() => {
    debouncedRender();

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [debouncedRender]);

  // Reset zoom/pan when a new diagram is loaded (when renderResult changes from one diagram to another)
  // Render diagram when renderResult changes (NOT when zoom/pan changes)
  useEffect(() => {
    if (!renderResult || !containerRef.current || isExecutingRef.current) {
      return;
    }

    // Content check to prevent infinite loop (hash-based dedup)
    const currentContent = renderResult.svg.slice(0, 500);
    if (lastRenderRef.current === currentContent) {
      return;
    }

    isExecutingRef.current = true;
    lastRenderRef.current = currentContent;

    try {
      setIsRendering(true);

      const container = containerRef.current;

      // Extract and store custom elements before container wipe
      extractedElementsRef.current = [];

      try {
        // Find and detach all custom elements while preserving DOM order
        // NOTE: This is NOT a true removal - elements are preserved during pan
        const elements = container.querySelectorAll(CustomElementSelector);

        elements.forEach((element) => {
          try {
            const svgElement = element as SVGElement;
            const originalParent = svgElement.parentElement;
            const nextSibling = svgElement.nextSibling;

            // Ensure element visibility before extraction
            if (svgElement.style) {
              svgElement.style.opacity = '1';
              svgElement.style.visibility = 'visible';
              svgElement.style.display = 'block';
            }

            // Store element with its original context
            extractedElementsRef.current.push({
              element: svgElement,
              originalParent,
              nextSibling,
            });

            // Detach from DOM (but preserve in extractedElementsRef for re-insertion)
            if (originalParent) {
              originalParent.removeChild(svgElement);
            }
          } catch {}
        });
      } catch (extractError) {
        logger.error(
          'Error during custom element extraction:',
          'DiagramDisplay',
          extractError instanceof Error ? extractError : undefined
        );
      }

      // Clear remaining content
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create and configure SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderResult.svg;

      const svgElement = tempDiv.querySelector('svg');
      if (svgElement) {
        // Remove viewBox limits to allow unlimited panning
        svgElement.removeAttribute('viewBox');
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.overflow = 'visible'; // Allow content to be visible outside bounds

        // Disable native SVG tooltips via CSS instead of removing accessibility attributes
        svgElement.removeAttribute('title');
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = 'title { display: none; } [data-title] { pointer-events: auto; }';
        svgElement.prepend(style);

        // Wrap content in a group (no transform — CSS transform on SVG handles zoom/pan)
        const transformGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        transformGroup.setAttribute('data-diagram-content', 'true');

        // Move content to transform group
        while (svgElement.firstChild) {
          transformGroup.appendChild(svgElement.firstChild);
        }
        svgElement.appendChild(transformGroup);

        // Step 4: Re-inject preserved elements into the new transform group
        // After the new diagram is appended and inside the new transformGroup,
        // iterate the stored list and appendChild each preserved node so they inherit the same transform
        if (extractedElementsRef.current.length > 0) {
          extractedElementsRef.current.forEach(({ element }) => {
            try {
              // Ensure the element is properly styled for visibility
              if (element.style) {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = 'block';
                element.style.pointerEvents = 'auto';
              }

              // Ensure all child elements are also visible
              const childElements = element.querySelectorAll('*');
              childElements.forEach((child) => {
                if (child instanceof SVGElement && child.style) {
                  child.style.opacity = '1';
                  child.style.visibility = 'visible';
                  if (child.tagName.toLowerCase() !== 'defs') {
                    child.style.display = 'block';
                  }
                }
              });

              // Preserve transform attribute — it contains the element's position after drag/move

              // Append each preserved element to the transform group so it inherits the same transform
              transformGroup.appendChild(element);

              // Force a repaint by accessing a computed style
              if (element.getBoundingClientRect) {
                element.getBoundingClientRect();
              }
            } catch {}
          });

          // Clear the ref once done to avoid duplicates on subsequent renders
          extractedElementsRef.current = [];
        }

        // Add to container
        container.appendChild(svgElement);
        setRenderVersion((value) => value + 1);

        // Center the diagram in the viewport
        setTimeout(() => {
          if (containerRef.current && svgElement) {
            const containerRect = containerRef.current.getBoundingClientRect();

            // Use getBBox() for accurate SVG dimensions
            let diagramBounds;
            try {
              const bbox = svgElement.getBBox();
              diagramBounds = {
                x: bbox.x,
                y: bbox.y,
                width: bbox.width,
                height: bbox.height,
              };
            } catch {
              // Fallback to getBoundingClientRect if getBBox fails
              const svgRect = svgElement.getBoundingClientRect();
              diagramBounds = {
                x: 0,
                y: 0,
                width: svgRect.width,
                height: svgRect.height,
              };
            }

            const viewportBounds = {
              width: containerRect.width,
              height: containerRect.height,
            };

            // Always center new diagrams (removed isInitialState check)
            if (diagramBounds.width > 0 && diagramBounds.height > 0) {
              dispatch(fitToViewport({ diagramBounds, viewportBounds }));
            }
          }
        }, 100);

        // Setup drag & drop with optimized approach
        setTimeout(() => {
          if (isExecutingRef.current && containerRef.current && lastRenderRef.current === currentContent) {
            markDraggableElements(); // Only mark once per render
          }
          setIsRendering(false);
          isExecutingRef.current = false;
        }, 150); // Increased delay to allow centering to complete
      } else {
        setIsRendering(false);
        isExecutingRef.current = false;
      }
    } catch (err) {
      logger.error('Error rendering diagram:', 'DiagramDisplay', err instanceof Error ? err : undefined);
      dispatch(
        showNotification({
          message: 'Error rendering diagram',
          type: 'error',
        })
      );
      setIsRendering(false);
      isExecutingRef.current = false;
    }
  }, [renderResult, dispatch, markDraggableElements]);

  // Apply CSS to make SVG elements not block pan events
  useEffect(() => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    if (interactionMode === 'pan') {
      // In pan mode, allow panning through default mermaid nodes but keep
      // interactions enabled for custom elements and resize handles.
      svgElement.style.pointerEvents = 'auto';
      const svgChildren = svgElement.querySelectorAll('rect, text, tspan, circle, ellipse, polygon, path, g');
      svgChildren.forEach((child) => {
        const el = child as SVGElement;
        const isCustom =
          !!el.closest('.custom-text-group, .custom-image-group, .custom-svg-shape-group, .custom-icon-group') ||
          el.classList.contains('resize-handle') ||
          !!el.closest('.resize-handle');
        el.style.pointerEvents = isCustom ? 'auto' : 'none';
      });
    } else {
      // In drag mode, restore normal pointer events
      svgElement.style.pointerEvents = 'auto';
      const svgChildren = svgElement.querySelectorAll('rect, text, tspan, circle, ellipse, polygon, path, g');
      svgChildren.forEach((child) => {
        (child as SVGElement).style.pointerEvents = 'auto';
      });
    }
  }, [interactionMode, renderResult]);

  // Handle errors
  useEffect(() => {
    if (error) {
      dispatch(
        showNotification({
          message: `Diagram error: ${error}`,
          type: 'error',
        })
      );
    }
  }, [error, dispatch]);

  // Apply zoom and pan transform to SVG
  useEffect(() => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Apply transform to position and scale the diagram
    svgElement.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
    svgElement.style.transformOrigin = '0 0';
  }, [zoom, pan]);

  // Mouse event handlers extracted to reusable hook
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useDiagramCanvasEvents({
    containerRef,
    interactionMode,
    beginGroup,
    endGroup,
    pan: { handlePanStart, handlePanMove, handlePanEnd, isPanning },
    drag: { activeDragInfo, handleDragMouseDown, handleDragMouseMove, handleDragMouseUp },
  });

  // Legacy element placement functionality (for backward compatibility)
  const { handleCanvasClick: handleLegacyCanvasClick } = useElementPlacement({
    containerRef,
    pan,
    zoom,
    mermaidCode,
    placingElement,
    activeDragInfo,
    dispatch,
  });

  // Combined canvas click handler
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (placingElement) {
        handleLegacyCanvasClick(e);
      }
    },
    [handleLegacyCanvasClick, placingElement]
  );

  const handleCanvasDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!hasToolbarDragData(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!hasToolbarDragData(event.dataTransfer)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const dragData = extractToolbarDragData(event.dataTransfer);
      if (!dragData) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Compute world coordinates using the current transform matrix (robust against padding/zoom/pan)
      let canvasPosition: { x: number; y: number } = { x: 0, y: 0 };
      try {
        const svg = container.querySelector('svg');
        const transformGroup = svg?.querySelector('g[data-custom-elements-layer]') as SVGGElement | null;
        if (svg) {
          // createSVGPoint works across browsers; use group CTM if available
          const pt = (svg as SVGSVGElement).createSVGPoint();
          pt.x = event.clientX;
          pt.y = event.clientY;
          const ctm = (transformGroup || svg).getScreenCTM();
          // Support DOMMatrix.inverse() and legacy SVGMatrix.inverse()
          const inv = ctm && (ctm as any).inverse ? (ctm as any).inverse() : null;
          if (inv) {
            const mapped = (pt as any).matrixTransform(inv);
            canvasPosition = { x: mapped.x, y: mapped.y };
          } else {
            throw new Error('No CTM available');
          }
        } else {
          throw new Error('SVG not found');
        }
      } catch {
        // Fallback to manual math
        const rect = container.getBoundingClientRect();
        canvasPosition = {
          x: (event.clientX - rect.left - pan.x) / zoom,
          y: (event.clientY - rect.top - pan.y) / zoom,
        };
      }

      const rawElement = buildElementFromToolbarDrag(dragData, canvasPosition);
      if (!rawElement) {
        dispatch(
          showNotification({
            message: 'Unable to add dragged element',
            type: 'error',
          })
        );
        return;
      }

      const pointerAnchor = dragData.pointerAnchor ?? { x: 0.5, y: 0.5 };
      const elementData = {
        ...rawElement,
        position: {
          x: canvasPosition.x - (rawElement.size?.width ?? 0) * pointerAnchor.x,
          y: canvasPosition.y - (rawElement.size?.height ?? 0) * pointerAnchor.y,
        },
      } as typeof rawElement;

      createElement(elementData);
      dispatch(setPlacingElement(null));
      // Ensure explicit snapshot capture for precise undo/redo after a drop
      try {
        captureNow('element-drop');
      } catch {
        // ignore if history engine disabled
      }
      dispatch(
        showNotification({
          message: `Added ${describeToolbarDrag(dragData)} to canvas`,
          type: 'success',
        })
      );
    },
    [createElement, containerRef, dispatch, pan.x, pan.y, zoom, captureNow]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && placingElement) {
        dispatch(setPlacingElement(null));
        dispatch(
          showNotification({
            message: 'Element placement cancelled',
            type: 'info',
          })
        );
        return;
      }

      // Handle Delete key for removing selected custom elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        try {
          if (hasSelection) {
            deleteSelectedElements();
            dispatch(
              showNotification({
                message: 'Selected elements deleted',
                type: 'success',
              })
            );
          }
        } catch (deleteError) {
          logger.error(
            'Error handling delete key:',
            'DiagramDisplay',
            deleteError instanceof Error ? deleteError : undefined
          );
          dispatch(
            showNotification({
              message: 'Error deleting elements',
              type: 'error',
            })
          );
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [placingElement, dispatch, deleteSelectedElements, hasSelection]);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold mb-2">No Diagram Yet</h3>
      <p className="text-center max-w-md">
        Enter Mermaid code in the sidebar to see your diagram here. Try starting with a simple flowchart or sequence
        diagram.
      </p>
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">
        <div className="text-gray-600 dark:text-gray-400 mb-2">Example:</div>
        <div className="text-blue-600 dark:text-blue-400">
          graph TD
          <br />
          &nbsp;&nbsp;A[Start] --&gt; B[Process]
          <br />
          &nbsp;&nbsp;B --&gt; C[End]
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold mb-2">Diagram Error</h3>
      <p className="text-center max-w-md mb-4">
        There&apos;s an issue with your Mermaid syntax. Please check your code and try again.
      </p>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md">
        <div className="font-mono text-sm text-red-700 dark:text-red-300">{error}</div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full text-blue-500 dark:text-blue-400">
      <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <h3 className="text-xl font-semibold mb-2">{isRendering ? 'Rendering Diagram' : 'Loading'}</h3>
      <p>Please wait while we generate your diagram...</p>
    </div>
  );

  return (
    <div className="flex-1 relative bg-white dark:bg-gray-900 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full diagram-canvas-bg dark:diagram-canvas-bg-dark"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full overflow-hidden">
        {/* Element placement indicator */}
        {placingElement && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="text-center">
              Click to place{' '}
              {placingElement.type === 'shape' ? placingElement.shapeDefinition?.name || 'shape' : placingElement.type}
            </div>
            <div className="text-xs text-blue-200 text-center mt-1">Press ESC to cancel</div>
          </div>
        )}

        <div
          key={renderResult ? 'has-diagram' : 'empty-canvas'}
          ref={containerRef}
          className={`diagram-display w-full h-full relative ${
            placingElement
              ? 'cursor-crosshair'
              : isPanning
                ? 'cursor-grabbing'
                : interactionMode === 'pan'
                  ? 'cursor-grab'
                  : interactionMode === 'drag'
                    ? 'cursor-default'
                    : 'cursor-grab'
          }`}
          id="mermaid-container"
          onMouseDown={placingElement ? undefined : handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onClick={handleCanvasClick}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          // Add CSS to make SVG elements not block pan events
          onMouseDownCapture={(e) => {
            // In pan mode, only force pan if not over custom elements/handles
            // CRITICAL: Don't intercept clicks when placing an element
            if (interactionMode === 'pan' && !placingElement) {
              const target = e.target as Element;
              const overCustom = !!target.closest(
                '.custom-text-group, .custom-image-group, .custom-svg-shape-group, .custom-icon-group, .resize-handle'
              );
              if (!overCustom && target.tagName !== 'DIV' && target.tagName !== 'svg') {
                e.preventDefault();
                e.stopPropagation();
                handleMouseDown(e as any);
                return;
              }
            }
          }}
        >
          {isLoading || isRendering
            ? renderLoading()
            : error
              ? renderError()
              : !mermaidCode.trim()
                ? renderEmptyState()
                : !renderResult
                  ? renderEmptyState()
                  : null}

          {/* Canvas Element Renderer - renders custom elements in SVG */}
          <CanvasElementRenderer containerRef={containerRef} zoom={zoom} pan={pan} renderVersion={renderVersion} />

          {/* Canvas Element Interactions - handles drag, resize, selection */}
          <CanvasElementInteractions
            containerRef={containerRef}
            zoom={zoom}
            pan={pan}
            interactionMode={interactionMode}
          />

          {/* Collaboration Manager - handles real-time collaboration */}
          <CollaborationManager enabled={isEnabled} sessionId={sessionId} />

          {/* Collaborative Cursors - shows other users' cursors */}
          {isConnected && <CollaborativeCursors users={users} containerRef={containerRef} zoom={zoom} pan={pan} />}
        </div>
      </div>

      {/* Drag/Pan indicator */}
      {(activeDragInfo || isPanning) && (
        <DragIndicator
          isActive={!!activeDragInfo || isPanning}
          elementId={
            activeDragInfo && typeof activeDragInfo === 'object'
              ? activeDragInfo.draggedElementId
              : isPanning
                ? 'Canvas'
                : undefined
          }
        />
      )}
    </div>
  );
};

// UNIFIED RESIZE SYSTEM DISABLED - Using CanvasElementInteractions instead
// setTimeout(() => {
//   initUnifiedResize('mermaid-container');
// }, 1000);
