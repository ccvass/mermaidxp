/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useRef } from 'react';

import { DRAGGABLE_ELEMENT_CLASSES } from '../../constants/diagram.constants';

const getSVGTranslate = (element: SVGGraphicsElement): { x: number; y: number } => {
  const transform = element.getAttribute('transform');
  if (transform) {
    const match = /translate\(\s*(-?[\d.eE+-]+)\s*(?:[, ]\s*(-?[\d.eE+-]+))?\s*\)/.exec(transform);
    if (match) {
      const x = parseFloat(match[1]);
      const y = match[2] ? parseFloat(match[2]) : 0;
      return { x, y };
    }
  }
  return { x: 0, y: 0 };
};

const extractMermaidNodeId = (svgNodeGroup: SVGGraphicsElement): string | null => {
  const svgId = svgNodeGroup.id || '';

  const structuralOrStyleKeywords = new Set([
    'node',
    'default',
    'cluster',
    'root',
    'subgraph',
    'point',
    'label',
    'edge',
    'path',
    'statediagram-state',
    'type-normal',
    'type-start',
    'type-end',
    'type-divider',
    'type-group',
    'type-fork',
    'type-join',
    'clickable',
    'custom',
    'messageLine0',
    'messageLine1',
    'messageText',
    'highlight',
    'children',
    'leaf',
    'parent',
    'title',
    'divider',
    'loop',
    'alt',
    'opt',
    'rect',
    'text',
    'circle',
    'ellipse',
    'polygon',
    'foreignobject',
    'active',
    'done',
    'crit',
    'mermaid',
    'labs',
    'output',
    'error-indicator',
    'error-text',
    'version',
  ]);

  for (const cls of Array.from(svgNodeGroup.classList)) {
    if (!structuralOrStyleKeywords.has(cls.toLowerCase()) && svgId.includes(cls)) {
      if (/^\d+$/.test(cls) && !svgId.match(new RegExp(`(?:^|[-_:])${cls}(?:[-_:]|$)`))) {
        continue;
      }
      return cls;
    }
  }

  const idParts = svgId.split(/[-_:]/);
  const commonDiagramPrefixes = [
    'flowchart',
    'graph',
    'statediagram',
    'classdiagram',
    'sequencediagram',
    'gantt',
    'er',
    'gitgraph',
    'pie',
    'journey',
    'requirement',
    'c4',
    'actor',
    'state',
    'note',
    'task',
    'section',
  ];

  if (idParts.length > 1) {
    if (
      idParts.length > 2 &&
      commonDiagramPrefixes.includes(idParts[0].toLowerCase()) &&
      /^\d+$/.test(idParts[idParts.length - 1])
    ) {
      const potentialId = idParts.slice(1, -1).join('-');
      if (potentialId && !structuralOrStyleKeywords.has(potentialId.toLowerCase()) && potentialId.length > 0)
        return potentialId;
    }
    if (idParts.length === 2 && commonDiagramPrefixes.includes(idParts[0].toLowerCase())) {
      const potentialId = idParts[1];
      if (potentialId && !structuralOrStyleKeywords.has(potentialId.toLowerCase()) && potentialId.length > 0)
        return potentialId;
    }
    if (idParts.length > 1 && /^\d+$/.test(idParts[idParts.length - 1])) {
      const potentialId = idParts.slice(0, -1).join('-');
      if (
        potentialId &&
        !structuralOrStyleKeywords.has(potentialId.toLowerCase()) &&
        potentialId.length > 0 &&
        svgNodeGroup.classList.contains(potentialId)
      ) {
        return potentialId;
      }
    }
  }

  if (
    svgNodeGroup.classList.contains(svgId) &&
    !structuralOrStyleKeywords.has(svgId.toLowerCase()) &&
    svgId.length > 0
  ) {
    return svgId;
  }

  const potentialClassIds = Array.from(svgNodeGroup.classList).filter(
    (cls) =>
      !structuralOrStyleKeywords.has(cls.toLowerCase()) &&
      !cls.startsWith('LS-') &&
      !cls.startsWith('LE-') &&
      cls.length > 0
  );
  if (potentialClassIds.length === 1 && !/^\d+$/.test(potentialClassIds[0])) return potentialClassIds[0];
  if (potentialClassIds.length > 0 && potentialClassIds.some((cls) => !/^\d+$/.test(cls))) {
    const nonNumeric = potentialClassIds.find((cls) => !/^\d+$/.test(cls));
    if (nonNumeric) return nonNumeric;
  }
  if (potentialClassIds.length > 0) return potentialClassIds[0];

  if (svgId && !structuralOrStyleKeywords.has(svgId.toLowerCase()) && svgId.length > 0) {
    return svgId;
  }
  return null;
};

export const useDragAndDrop = (mermaidDivRef: React.RefObject<HTMLDivElement | null>, zoom: number) => {
  const [activeDragInfo, setActiveDragInfo] = useState<
    | {
        element: SVGGraphicsElement;
        draggedElementId: string;
        isCluster: boolean;
        allMovedNodeIds: string[];
        initialSvgTransform: { x: number; y: number };
        initialMousePos: { x: number; y: number };
      }
    | 'canvas'
    | null
  >(null);
  const canvasInitialPanRef = useRef<{ x: number; y: number } | null>(null);
  const hasLoggedOnce = useRef(false); // Prevent spam logging
  const canvasInitialMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const edgeInfoCacheRef = useRef<
    Array<{
      pathEl: SVGPathElement;
      originalD: string;
      connectedNodeIds: string[];
    }>
  >([]);

  // Prevent concurrent executions of markDraggableElements
  let isMarking = false;
  const markDraggableElementsRef = useRef<(() => void) | null>(null);
  // Initialize the function only once
  if (!markDraggableElementsRef.current) {
    markDraggableElementsRef.current = () => {
      if (!mermaidDivRef.current || isMarking) return;

      isMarking = true;

      try {
        // Clear previous markings
        mermaidDivRef.current.querySelectorAll('.draggable-element').forEach((el) => {
          el.classList.remove('draggable-element');
          // Eliminar listeners previos
          if ((el as any)._directDragHandler) {
            el.removeEventListener('mousedown', (el as any)._directDragHandler);
            (el as any)._directDragHandler = undefined;
          }
        });

        let count = 0;
        mermaidDivRef.current.querySelectorAll('svg g').forEach((group) => {
          const id = group.id;
          const classes = Array.from(group.classList);
          if (
            id.includes('edge') ||
            id.includes('marker') ||
            id.includes('arrow') ||
            classes.some((cls) => cls.includes('edge') || cls.includes('marker')) ||
            classes.some((cls) => cls.startsWith('custom-'))
          ) {
            return;
          }
          const hasShapes = group.querySelector('rect, circle, ellipse, polygon, path') !== null;
          const hasText = group.querySelector('text') !== null;
          if (hasShapes || hasText) {
            let isValid =
              (id && id.length > 0 && !id.includes('defs') && !id.includes('clip')) ||
              classes.some((cls) => DRAGGABLE_ELEMENT_CLASSES.includes(cls));

            const isSequenceDiagram =
              mermaidDivRef.current?.querySelector('svg[aria-roledescription="sequence"]') !== null;
            const isPieChart = mermaidDivRef.current?.querySelector('svg[aria-roledescription="pie"]') !== null;
            const isGanttChart = mermaidDivRef.current?.querySelector('svg[aria-roledescription="gantt"]') !== null;
            if (isSequenceDiagram || isPieChart || isGanttChart) {
              const draggableSelector = DRAGGABLE_ELEMENT_CLASSES.map((cls) => `.${cls}`).join(', ');
              const hasDraggableChild = group.querySelector(draggableSelector);
              if (hasDraggableChild) {
                isValid = true;
              }
            }

            if (isValid) {
              group.classList.add('draggable-element');
              // Forzar pointer-events y cursor en todos los hijos
              group.querySelectorAll('*').forEach((child) => {
                if (child instanceof SVGElement) {
                  child.style.pointerEvents = 'all';
                  child.style.cursor = 'grab';
                }
              });
              // Use proper drag handler with complete logic
              const handler = (e: Event) => {
                const mouseEvent = e as MouseEvent;
                const element = group as SVGGraphicsElement;

                if (!mermaidDivRef.current) return;
                if (mouseEvent.button !== 0) return; // Solo botón izquierdo

                mouseEvent.preventDefault();
                mouseEvent.stopPropagation();

                // Extraer node ID usando la función existente
                const draggedElementId = extractMermaidNodeId(element);
                if (!draggedElementId) return;

                const isClusterDrag = element.classList.contains('cluster');
                const allMovedNodeIds: string[] = [draggedElementId];

                if (isClusterDrag) {
                  const descendantSelectors = DRAGGABLE_ELEMENT_CLASSES.map((cls) => `.${cls}`).join(', ');
                  const descendantNodes = element.querySelectorAll<SVGGraphicsElement>(descendantSelectors);
                  descendantNodes.forEach((descNode) => {
                    if (element.contains(descNode) && descNode !== element) {
                      const descNodeId = extractMermaidNodeId(descNode);
                      if (descNodeId && !allMovedNodeIds.includes(descNodeId)) {
                        allMovedNodeIds.push(descNodeId);
                      }
                    }
                  });
                }

                element.classList.add('dragging');
                element.style.cursor = 'grabbing';
                document.body.style.cursor = 'grabbing';

                setActiveDragInfo({
                  element,
                  draggedElementId,
                  isCluster: isClusterDrag,
                  allMovedNodeIds,
                  initialSvgTransform: getSVGTranslate(element),
                  initialMousePos: { x: mouseEvent.clientX, y: mouseEvent.clientY },
                });
              };
              (group as any)._directDragHandler = handler;
              group.addEventListener('mousedown', handler);
              count++;
            }
          }
        });

        // Only log once when elements are successfully marked, not on every call
        if (count > 0 && !hasLoggedOnce.current) {
          hasLoggedOnce.current = true;
        }
      } finally {
        isMarking = false;
      }
    };
  }

  // Return the stable function reference
  const markDraggableElements = markDraggableElementsRef.current;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activeDragInfo || !mermaidDivRef.current) return;

      if (typeof activeDragInfo === 'object') {
        e.preventDefault();
        const { element, allMovedNodeIds, initialSvgTransform, initialMousePos } = activeDragInfo;

        const dxMouse = (e.clientX - initialMousePos.x) / zoom;
        const dyMouse = (e.clientY - initialMousePos.y) / zoom;
        const newTransformX = initialSvgTransform.x + dxMouse;
        const newTransformY = initialSvgTransform.y + dyMouse;
        element.setAttribute('transform', `translate(${newTransformX}, ${newTransformY})`);

        edgeInfoCacheRef.current.forEach((cachedEdge) => {
          const isConnected = cachedEdge.connectedNodeIds.some((id: string) => allMovedNodeIds.includes(id));
          if (isConnected) {
            let finalD = cachedEdge.originalD;
            let pathWasModified = false;

            const parentGroup = cachedEdge.pathEl.parentElement;

            if (
              parentGroup &&
              cachedEdge.connectedNodeIds.some(
                (id: string) => allMovedNodeIds.includes(id) && parentGroup.classList.contains(`LS-${id}`)
              )
            ) {
              finalD = finalD.replace(
                /^M\s*([\d.eE+-]+)\s*[, ]?\s*([\d.eE+-]+)/,
                (_match: string, p1: string, p2: string) => {
                  return `M ${parseFloat(p1) + dxMouse} ${parseFloat(p2) + dyMouse}`;
                }
              );
              pathWasModified = true;
            }

            if (
              parentGroup &&
              cachedEdge.connectedNodeIds.some(
                (id: string) => allMovedNodeIds.includes(id) && parentGroup.classList.contains(`LE-${id}`)
              )
            ) {
              finalD = finalD.replace(
                /L\s*([\d.eE+-]+)\s*[, ]?\s*([\d.eE+-]+)(?=\s*(?:marker-end|;|$))/,
                (_match: string, p1: string, p2: string) => {
                  return `L ${parseFloat(p1) + dxMouse} ${parseFloat(p2) + dyMouse}`;
                }
              );
              if (pathWasModified && !finalD.startsWith('M')) {
                const currentM = cachedEdge.pathEl.getAttribute('d')?.match(/^M\s*([\d.eE+-]+)\s*[, ]?\s*([\d.eE+-]+)/);
                if (currentM) finalD = `${currentM[0]}${finalD.substring(finalD.indexOf('L'))}`;
              }
              pathWasModified = true;
            }

            if (pathWasModified) {
              cachedEdge.pathEl.setAttribute('d', finalD);
            }
          }
        });
      } else if (activeDragInfo === 'canvas') {
        if (canvasInitialPanRef.current && canvasInitialMousePosRef.current) {
          e.preventDefault();
          // This part should be handled in the component that uses this hook
        }
      }
    },
    [activeDragInfo, zoom]
  );

  const handleMouseUpOrLeave = useCallback(() => {
    // Immediate cleanup for dragged elements
    if (activeDragInfo && typeof activeDragInfo === 'object' && activeDragInfo.element) {
      activeDragInfo.element.style.cursor = 'grab';
      activeDragInfo.element.classList.remove('dragging');
    }

    // Reset body cursor immediately
    document.body.style.cursor = 'default';

    // Reset container cursor based on mode
    if (mermaidDivRef.current) {
      // if (interactionMode === InteractionMode.Pan) {
      //   mermaidDivRef.current.style.cursor = 'grab';
      // } else {
      //   mermaidDivRef.current.style.cursor = 'default';
      // }
    }

    setActiveDragInfo(null);
    canvasInitialPanRef.current = null;
    canvasInitialMousePosRef.current = null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mermaidDivRef.current) return;

    // Check interaction mode to determine behavior
    // In Pan mode, always pan the canvas
    e.preventDefault();
    setActiveDragInfo('canvas');
    // canvasInitialPanRef.current = { ...pan };
    canvasInitialMousePosRef.current = { x: e.clientX, y: e.clientY };
    if (mermaidDivRef.current) mermaidDivRef.current.style.cursor = 'grabbing';
  }, []);

  return {
    activeDragInfo,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    markDraggableElements,
  };
};
