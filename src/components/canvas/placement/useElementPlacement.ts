import React, { useCallback } from 'react';
import { setPlacingElement } from '../../../store/slices/canvasSlice';
import { setMermaidCode } from '../../../store/slices/diagramSlice';
import { showNotification } from '../../../store/slices/uiSlice';
import { logger } from '../../../utils/logger';

export interface UseElementPlacementParams {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  zoom: number;
  mermaidCode: string;
  placingElement: unknown;
  activeDragInfo: unknown;
  dispatch: (action: unknown) => void;
}

export function useElementPlacement({
  containerRef,
  pan,
  zoom,
  mermaidCode,
  placingElement,
  activeDragInfo,
  dispatch,
}: UseElementPlacementParams) {
  const promptForText = (title: string, message: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const result = window.prompt(`${title}\n\n${message}`);
      resolve(result);
    });
  };

  const positionElementAtCoordinates = useCallback(
    (nodeId: string, x: number, y: number) => {
      if (!containerRef.current) return;

      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) return;

      const findElement = () => {
        let element = svgElement.querySelector(`[id*="${nodeId}"]`);
        if (element) return element as SVGElement;

        const allGroups = svgElement.querySelectorAll('g.node');
        if (allGroups.length > 0) {
          element = allGroups[allGroups.length - 1];
          if (element) return element as SVGElement;
        }

        const allElements = svgElement.querySelectorAll('g');
        if (allElements.length > 0) {
          return allElements[allElements.length - 1] as SVGElement;
        }

        return null;
      };

      let attempts = 0;
      const maxAttempts = 10;

      const tryPosition = () => {
        const element = findElement();

        if (element) {
          const adjustedX = x - pan.x;
          const adjustedY = y - pan.y;
          const newTransform = `translate(${adjustedX}, ${adjustedY})`;
          element.setAttribute('transform', newTransform);

          const childElements = element.querySelectorAll('g, rect, circle, path, text');
          childElements.forEach((child) => {
            if (child !== element) {
              (child as SVGElement).setAttribute('transform', newTransform);
            }
          });

          return true;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryPosition, 50);
        } // else: no-op

        return false;
      };

      setTimeout(tryPosition, 100);
    },
    [containerRef, pan]
  );

  const handleElementPlacement = useCallback(
    async (element: Record<string, unknown>, _screenX: number, _screenY: number, diagramX: number, diagramY: number) => {
      if (!element) return;

      // Helper: get the custom-elements-layer (or SVG root as fallback)
      const getTargetParent = (svg: SVGElement): SVGElement => {
        return (svg.querySelector('g[data-custom-elements-layer]') as SVGElement) || svg;
      };

      const addTextToSVG = (
        textContent: string,
        textStyle: Record<string, unknown>,
        clickX: number,
        clickY: number,
        nodeId: string
      ) => {
        if (!containerRef.current) return;

        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) return;

        const parent = getTargetParent(svgElement as unknown as SVGElement);
        console.error('🟢 addTextToSVG called', { textContent, clickX, clickY, parentTag: parent.tagName, parentClass: parent.getAttribute('class') });

        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        textGroup.setAttribute('class', 'custom-text-group');
        textGroup.setAttribute('data-id', nodeId);
        textGroup.setAttribute('data-type', 'text');

        let currentFontSize = Number(textStyle.fontSize || 16);
        const getTextDimensions = (fontSize: number) => ({
          width: textContent.length * (fontSize * 0.6),
          height: fontSize,
        });

        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', clickX.toString());
        textElement.setAttribute('y', clickY.toString());
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'middle');
        textElement.setAttribute('font-size', String(currentFontSize));
        textElement.setAttribute('fill', String(textStyle.color || ''));
        textElement.setAttribute('font-weight', String(textStyle.fontWeight || ''));
        textElement.setAttribute('font-style', String(textStyle.fontStyle || ''));
        textElement.setAttribute('text-decoration', String(textStyle.textDecoration || ''));
        textElement.setAttribute('cursor', 'move');
        textElement.setAttribute('class', 'placed-text');
        textElement.textContent = textContent;

        let backgroundRect: SVGElement | null = null;
        if (String(textStyle.backgroundColor || 'transparent') !== 'transparent') {
          backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          updateBackgroundRect();
          backgroundRect.setAttribute('class', 'text-background');
          textGroup.appendChild(backgroundRect);
        }

        function updateBackgroundRect() {
          if (!backgroundRect) return;
          const dims = getTextDimensions(Number(currentFontSize));
          const pad = Number(Number(textStyle.padding || 0) || 0);
          backgroundRect.setAttribute('x', (clickX - dims.width / 2 - pad).toString());
          backgroundRect.setAttribute('y', (clickY - dims.height / 2 - pad).toString());
          backgroundRect.setAttribute('width', (dims.width + pad * 2).toString());
          backgroundRect.setAttribute('height', (dims.height + pad * 2).toString());
          backgroundRect.setAttribute('fill', String(String(textStyle.backgroundColor || 'transparent') || ''));
          backgroundRect.setAttribute('rx', String(Number(textStyle.borderRadius || 0) || 0));
          backgroundRect.setAttribute('ry', String(Number(textStyle.borderRadius || 0) || 0));
        }

        const selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const updateSelectionRect = () => {
          const dims = getTextDimensions(Number(currentFontSize));
          const pad = Number(Number(textStyle.padding || 0) || 0);
          selectionRect.setAttribute('x', (clickX - dims.width / 2 - pad - 2).toString());
          selectionRect.setAttribute('y', (clickY - dims.height / 2 - pad - 2).toString());
          selectionRect.setAttribute('width', (dims.width + pad * 2 + 4).toString());
          selectionRect.setAttribute('height', (dims.height + pad * 2 + 4).toString());
        };

        updateSelectionRect();
        selectionRect.setAttribute('fill', 'none');
        selectionRect.setAttribute('stroke', '#3b82f6');
        selectionRect.setAttribute('stroke-width', '2');
        selectionRect.setAttribute('stroke-dasharray', '5,5');
        selectionRect.setAttribute('class', 'text-selection-border');
        selectionRect.style.display = 'none';

        const handleSize = 16;
        const handles = [
          { position: 'nw', cursor: 'nw-resize' },
          { position: 'ne', cursor: 'ne-resize' },
          { position: 'sw', cursor: 'sw-resize' },
          { position: 'se', cursor: 'se-resize' },
        ];
        const handleElements: SVGElement[] = [];

        const updateHandlePositions = () => {
          const dims = getTextDimensions(currentFontSize);
          const rectX = clickX - dims.width / 2 - Number(textStyle.padding || 0) - 2;
          const rectY = clickY - dims.height / 2 - Number(textStyle.padding || 0) - 2;
          const rectWidth = dims.width + Number(textStyle.padding || 0) * 2 + 4;
          const rectHeight = dims.height + Number(textStyle.padding || 0) * 2 + 4;

          const positions = [
            { x: rectX - handleSize / 2, y: rectY - handleSize / 2 },
            { x: rectX + rectWidth - handleSize / 2, y: rectY - handleSize / 2 },
            { x: rectX - handleSize / 2, y: rectY + rectHeight - handleSize / 2 },
            { x: rectX + rectWidth - handleSize / 2, y: rectY + rectHeight - handleSize / 2 },
          ];

          handleElements.forEach((handle, handleIndex) => {
            handle.setAttribute('x', positions[handleIndex].x.toString());
            handle.setAttribute('y', positions[handleIndex].y.toString());
          });
        };

        handles.forEach((handle) => {
          const handleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          handleRect.setAttribute('width', handleSize.toString());
          handleRect.setAttribute('height', handleSize.toString());
          handleRect.setAttribute('fill', '#3b82f6');
          handleRect.setAttribute('stroke', 'white');
          handleRect.setAttribute('stroke-width', '2');
          (handleRect as any).style && (handleRect as any).style.setProperty('touch-action', 'none');
          handleRect.setAttribute('cursor', handle.cursor);
          handleRect.setAttribute('class', `resize-handle resize-${handle.position}`);
          handleRect.style.display = 'none';
          handleElements.push(handleRect);
        });

        updateHandlePositions();

        textElement.addEventListener('click', (e) => {
          e.stopPropagation();
          svgElement.querySelectorAll('.custom-text-group, .custom-image-group, .custom-icon').forEach((group) => {
            group.querySelectorAll('.text-selection-border, .selection-border, .resize-handle').forEach((el) => {
              (el as SVGElement).style.display = 'none';
            });
          });

          selectionRect.style.display = 'block';
          handleElements.forEach((handle) => {
            handle.style.setProperty('display', 'block', 'important');
            handle.style.setProperty('pointer-events', 'all', 'important');
            handle.style.setProperty('z-index', '9999', 'important');
          });
        });

        let isResizing = false;
        let resizeHandle = '';
        let startX = 0,
          startY = 0,
          startFontSize = 0;

        handleElements.forEach((handle, handleIndex) => {
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            resizeHandle = handles[handleIndex].position as string;

            const rect = svgElement.getBoundingClientRect();
            startX = (e as MouseEvent).clientX - rect.left;
            startY = (e as MouseEvent).clientY - rect.top;
            startFontSize = currentFontSize;
          });
        });

        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;

          const rect = svgElement.getBoundingClientRect();
          const currentX = e.clientX - rect.left;
          const currentY = e.clientY - rect.top;
          const deltaX = currentX - startX;
          const deltaY = currentY - startY;

          let fontSizeChange = 0;
          switch (resizeHandle) {
            case 'se':
              fontSizeChange = (deltaX + deltaY) / 4;
              break;
            case 'sw':
              fontSizeChange = (-deltaX + deltaY) / 4;
              break;
            case 'ne':
              fontSizeChange = (deltaX - deltaY) / 4;
              break;
            case 'nw':
              fontSizeChange = (-deltaX - deltaY) / 4;
              break;
          }

          const newFontSize = Math.max(8, Math.min(72, startFontSize + fontSizeChange));
          currentFontSize = newFontSize;

          textElement.setAttribute('font-size', newFontSize.toString());

          if (backgroundRect) updateBackgroundRect();
          updateSelectionRect();
          updateHandlePositions();
        };

        const handleMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            resizeHandle = '';
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        const cleanup = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        (textGroup as any).__cleanup = cleanup;

        textGroup.appendChild(textElement);
        textGroup.appendChild(selectionRect);
        handleElements.forEach((handle) => textGroup.appendChild(handle));

        textGroup.removeAttribute('transform');
        textGroup.style.opacity = '1';
        textGroup.style.visibility = 'visible';
        textGroup.style.display = 'block';

        getTargetParent(svgElement).appendChild(textGroup);
      };

      const addImageToSVG = (
        imageUrl: string,
        _altText: string,
        clickX: number,
        clickY: number,
        nodeId: string,
        width = 80,
        height = 80
      ) => {
        if (!containerRef.current) return;
        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) return;

        const imageGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        imageGroup.setAttribute('class', 'custom-image-group');
        imageGroup.setAttribute('data-id', nodeId);
        imageGroup.setAttribute('data-type', 'image');

        const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        const imageX = clickX - width / 2;
        const imageY = clickY - height / 2;
        imageElement.setAttribute('x', imageX.toString());
        imageElement.setAttribute('y', imageY.toString());
        imageElement.setAttribute('width', width.toString());
        imageElement.setAttribute('height', height.toString());
        imageElement.setAttribute('href', imageUrl);
        imageElement.setAttribute('class', 'placed-image');
        imageElement.setAttribute('cursor', 'move');

        const selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        selectionRect.setAttribute('x', imageX.toString());
        selectionRect.setAttribute('y', imageY.toString());
        selectionRect.setAttribute('width', width.toString());
        selectionRect.setAttribute('height', height.toString());
        selectionRect.setAttribute('fill', 'none');
        selectionRect.setAttribute('stroke', '#3b82f6');
        selectionRect.setAttribute('stroke-width', '2');
        selectionRect.setAttribute('stroke-dasharray', '5,5');
        selectionRect.setAttribute('class', 'selection-border');
        selectionRect.style.display = 'none';

        const handleSize = 16;
        const handles = [
          { position: 'nw', cursor: 'nw-resize' },
          { position: 'ne', cursor: 'ne-resize' },
          { position: 'sw', cursor: 'sw-resize' },
          { position: 'se', cursor: 'se-resize' },
        ];
        const handleElements: SVGElement[] = [];

        const updateHandlePositions = () => {
          const currentX = parseFloat(imageElement.getAttribute('x') || '0');
          const currentY = parseFloat(imageElement.getAttribute('y') || '0');
          const currentWidth = parseFloat(imageElement.getAttribute('width') || '80');
          const currentHeight = parseFloat(imageElement.getAttribute('height') || '80');

          const positions = [
            { x: currentX - handleSize / 2, y: currentY - handleSize / 2 },
            { x: currentX + currentWidth - handleSize / 2, y: currentY - handleSize / 2 },
            { x: currentX - handleSize / 2, y: currentY + currentHeight - handleSize / 2 },
            { x: currentX + currentWidth - handleSize / 2, y: currentY + currentHeight - handleSize / 2 },
          ];

          handleElements.forEach((handle, handleIndex) => {
            handle.setAttribute('x', positions[handleIndex].x.toString());
            handle.setAttribute('y', positions[handleIndex].y.toString());
          });
        };

        handles.forEach((handle) => {
          const handleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          handleRect.setAttribute('width', handleSize.toString());
          handleRect.setAttribute('height', handleSize.toString());
          handleRect.setAttribute('fill', '#3b82f6');
          handleRect.setAttribute('stroke', 'white');
          handleRect.setAttribute('stroke-width', '2');
          (handleRect as any).style && (handleRect as any).style.setProperty('touch-action', 'none');
          handleRect.setAttribute('cursor', handle.cursor);
          handleRect.setAttribute('class', `resize-handle resize-${handle.position}`);
          handleRect.style.display = 'none';
          handleElements.push(handleRect);
        });

        updateHandlePositions();

        let isSelected = false;
        imageElement.addEventListener('click', (e) => {
          e.stopPropagation();
          svgElement.querySelectorAll('.custom-image-group').forEach((group) => {
            group.querySelectorAll('.selection-border, .resize-handle').forEach((el) => {
              (el as SVGElement).style.display = 'none';
            });
          });

          isSelected = !isSelected;
          selectionRect.style.display = isSelected ? 'block' : 'none';
          handleElements.forEach((handle) => {
            handle.style.display = isSelected ? 'block' : 'none';
          });
        });

        let isResizing = false;
        let resizeHandle = '';
        let startX = 0,
          startY = 0,
          startWidth = 0,
          startHeight = 0,
          startImageX = 0,
          startImageY = 0;

        handleElements.forEach((handle, handleIndex) => {
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            resizeHandle = handles[handleIndex].position as string;

            const rect = svgElement.getBoundingClientRect();
            startX = (e as MouseEvent).clientX - rect.left;
            startY = (e as MouseEvent).clientY - rect.top;
            startWidth = parseFloat(imageElement.getAttribute('width') || '80');
            startHeight = parseFloat(imageElement.getAttribute('height') || '80');
            startImageX = parseFloat(imageElement.getAttribute('x') || '0');
            startImageY = parseFloat(imageElement.getAttribute('y') || '0');
          });
        });

        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;

          const rect = svgElement.getBoundingClientRect();
          const currentX = e.clientX - rect.left;
          const currentY = e.clientY - rect.top;
          const deltaX = currentX - startX;
          const deltaY = currentY - startY;

          let newWidth = startWidth;
          let newHeight = startHeight;
          let newX = startImageX;
          let newY = startImageY;

          switch (resizeHandle) {
            case 'se':
              newWidth = Math.max(20, startWidth + deltaX);
              newHeight = Math.max(20, startHeight + deltaY);
              break;
            case 'sw':
              newWidth = Math.max(20, startWidth - deltaX);
              newHeight = Math.max(20, startHeight + deltaY);
              newX = startImageX + (startWidth - newWidth);
              break;
            case 'ne':
              newWidth = Math.max(20, startWidth + deltaX);
              newHeight = Math.max(20, startHeight - deltaY);
              newY = startImageY + (startHeight - newHeight);
              break;
            case 'nw':
              newWidth = Math.max(20, startWidth - deltaX);
              newHeight = Math.max(20, startHeight - deltaY);
              newX = startImageX + (startWidth - newWidth);
              newY = startImageY + (startHeight - newHeight);
              break;
          }

          imageElement.setAttribute('width', newWidth.toString());
          imageElement.setAttribute('height', newHeight.toString());
          imageElement.setAttribute('x', newX.toString());
          imageElement.setAttribute('y', newY.toString());

          selectionRect.setAttribute('width', newWidth.toString());
          selectionRect.setAttribute('height', newHeight.toString());
          selectionRect.setAttribute('x', newX.toString());
          selectionRect.setAttribute('y', newY.toString());

          updateHandlePositions();
        };

        const handleMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            resizeHandle = '';
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        const cleanup = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        (imageGroup as any).__cleanup = cleanup;

        imageElement.addEventListener('error', () => {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', imageX.toString());
          rect.setAttribute('y', imageY.toString());
          rect.setAttribute('width', width.toString());
          rect.setAttribute('height', height.toString());
          rect.setAttribute('fill', '#f3f4f6');
          rect.setAttribute('stroke', '#d1d5db');
          rect.setAttribute('stroke-width', '1');

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', (imageX + width / 2).toString());
          text.setAttribute('y', (imageY + height / 2).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('fill', '#6b7280');
          text.setAttribute('font-size', '12');
          text.textContent = '🖼️';

          imageGroup.replaceChild(rect, imageElement);
          imageGroup.appendChild(text);
        });

        imageGroup.appendChild(imageElement);
        imageGroup.appendChild(selectionRect);
        handleElements.forEach((handle) => imageGroup.appendChild(handle));

        imageGroup.removeAttribute('transform');
        imageGroup.style.opacity = '1';
        imageGroup.style.visibility = 'visible';
        imageGroup.style.display = 'block';

        getTargetParent(svgElement).appendChild(imageGroup);
      };

      const addSVGShapeToCanvas = (
        shapeDef: Record<string, unknown>,
        clickX: number,
        clickY: number,
        nodeId: string,
        width = 100,
        height = 100
      ) => {
        if (!containerRef.current) return;
        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) return;

        const shapeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        shapeGroup.setAttribute('class', 'custom-svg-shape-group');
        shapeGroup.setAttribute('data-id', nodeId);
        shapeGroup.setAttribute('data-type', 'svg-shape');

        let shapeElement: SVGElement;
        const x = clickX - width / 2;
        const y = clickY - height / 2;

        switch (shapeDef.type) {
          case 'rectangle':
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shapeElement.setAttribute('x', x.toString());
            shapeElement.setAttribute('y', y.toString());
            shapeElement.setAttribute('width', width.toString());
            shapeElement.setAttribute('height', height.toString());
            break;
          case 'circle':
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            shapeElement.setAttribute('cx', clickX.toString());
            shapeElement.setAttribute('cy', clickY.toString());
            shapeElement.setAttribute('r', (Math.min(width, height) / 2).toString());
            break;
          case 'ellipse':
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            shapeElement.setAttribute('cx', clickX.toString());
            shapeElement.setAttribute('cy', clickY.toString());
            shapeElement.setAttribute('rx', (width / 2).toString());
            shapeElement.setAttribute('ry', (height / 2).toString());
            break;
          case 'diamond': {
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const points = `${clickX},${y} ${x + width},${clickY} ${clickX},${y + height} ${x},${clickY}`;
            shapeElement.setAttribute('points', points);
            break;
          }
          case 'triangle': {
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const trianglePoints = `${clickX},${y} ${x + width},${y + height} ${x},${y + height}`;
            shapeElement.setAttribute('points', trianglePoints);
            break;
          }
          case 'hexagon': {
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const hexW = width / 2;
            const hexPoints = `${clickX - hexW * 0.5},${y} ${clickX + hexW * 0.5},${y} ${clickX + hexW},${clickY} ${clickX + hexW * 0.5},${y + height} ${clickX - hexW * 0.5},${y + height} ${clickX - hexW},${clickY}`;
            shapeElement.setAttribute('points', hexPoints);
            break;
          }
          case 'star': {
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const starPoints: string[] = [];
            const outerRadius = Math.min(width, height) / 2;
            const innerRadius = outerRadius * 0.4;
            for (let i = 0; i < 10; i++) {
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const px = clickX + radius * Math.cos(angle);
              const py = clickY + radius * Math.sin(angle);
              starPoints.push(`${px},${py}`);
            }
            shapeElement.setAttribute('points', starPoints.join(' '));
            break;
          }
          default:
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shapeElement.setAttribute('x', x.toString());
            shapeElement.setAttribute('y', y.toString());
            shapeElement.setAttribute('width', width.toString());
            shapeElement.setAttribute('height', height.toString());
        }

        shapeElement.setAttribute('fill', String(shapeDef.fill || '#e1f5fe'));
        shapeElement.setAttribute('stroke', String(shapeDef.stroke || '#0277bd'));
        shapeElement.setAttribute('stroke-width', String(shapeDef.strokeWidth || '2'));
        shapeElement.setAttribute('cursor', 'move');
        shapeElement.setAttribute('class', 'placed-svg-shape');

        const selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        selectionRect.setAttribute('class', 'svg-shape-selection-border');
        selectionRect.setAttribute('fill', 'none');
        selectionRect.setAttribute('stroke', '#3b82f6');
        selectionRect.setAttribute('stroke-width', '2');
        selectionRect.setAttribute('stroke-dasharray', '5,5');
        selectionRect.style.display = 'none';

        const handles = [
          { position: 'nw', cursor: 'nw-resize' },
          { position: 'ne', cursor: 'ne-resize' },
          { position: 'sw', cursor: 'sw-resize' },
          { position: 'se', cursor: 'se-resize' },
        ];

        const handleElements: SVGElement[] = handles.map((handle) => {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('width', '8');
          rect.setAttribute('height', '8');
          rect.setAttribute('fill', '#3b82f6');
          rect.setAttribute('stroke', 'white');
          rect.setAttribute('stroke-width', '1');
          rect.setAttribute('cursor', handle.cursor);
          rect.setAttribute('class', `resize-handle resize-${handle.position}`);
          rect.style.display = 'none';
          return rect;
        });

        const updateSelectionAndHandles = () => {
          const bbox = (shapeElement as SVGGraphicsElement).getBBox();
          const shapeX = bbox.x;
          const shapeY = bbox.y;
          const shapeWidth = bbox.width;
          const shapeHeight = bbox.height;

          const padding = 4;

          selectionRect.setAttribute('x', (shapeX - padding).toString());
          selectionRect.setAttribute('y', (shapeY - padding).toString());
          selectionRect.setAttribute('width', (shapeWidth + padding * 2).toString());
          selectionRect.setAttribute('height', (shapeHeight + padding * 2).toString());

          const handlePositions = [
            { x: shapeX - padding - 4, y: shapeY - padding - 4 },
            { x: shapeX + shapeWidth + padding - 4, y: shapeY - padding - 4 },
            { x: shapeX - padding - 4, y: shapeY + shapeHeight + padding - 4 },
            { x: shapeX + shapeWidth + padding - 4, y: shapeY + shapeHeight + padding - 4 },
          ];

          handleElements.forEach((handle, handleIndex) => {
            handle.setAttribute('x', handlePositions[handleIndex].x.toString());
            handle.setAttribute('y', handlePositions[handleIndex].y.toString());
          });
        };

        shapeGroup.appendChild(shapeElement);
        shapeGroup.appendChild(selectionRect);
        handleElements.forEach((handle) => shapeGroup.appendChild(handle));

        shapeGroup.removeAttribute('transform');
        shapeGroup.style.opacity = '1';
        shapeGroup.style.visibility = 'visible';
        shapeGroup.style.display = 'block';

        const svgRoot = containerRef.current.querySelector('svg');
        getTargetParent(svgRoot!).appendChild(shapeGroup);

        updateSelectionAndHandles();

        shapeElement.addEventListener('click', (e) => {
          e.stopPropagation();
          svgRoot
            ?.querySelectorAll(
              '.selection-border, .text-selection-border, .icon-selection-border, .svg-shape-selection-border, .resize-handle'
            )
            .forEach((el) => {
              (el as SVGElement).style.display = 'none';
            });

          selectionRect.style.display = 'block';
          handleElements.forEach((handle) => {
            handle.style.setProperty('display', 'block', 'important');
            handle.style.setProperty('pointer-events', 'all', 'important');
            handle.style.setProperty('z-index', '9999', 'important');
          });
        });

        handleElements.forEach((handle) => {
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
          });
        });
      };

      const addIconToSVG = (iconContent: string, clickX: number, clickY: number, nodeId: string) => {
        if (!containerRef.current) return;
        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) return;

        const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('class', 'custom-icon-group');
        iconGroup.setAttribute('data-id', nodeId);
        iconGroup.setAttribute('data-type', 'icon');

        let currentFontSize = 24;

        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', clickX.toString());
        textElement.setAttribute('y', (clickY + 8).toString());
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('font-size', currentFontSize.toString());
        textElement.setAttribute('class', 'icon-text');
        textElement.setAttribute('cursor', 'move');
        textElement.textContent = iconContent;

        const selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const updateSelectionRect = () => {
          const iconSize = currentFontSize;
          selectionRect.setAttribute('x', (clickX - iconSize / 2 - 4).toString());
          selectionRect.setAttribute('y', (clickY - iconSize / 2 - 4).toString());
          selectionRect.setAttribute('width', (iconSize + 8).toString());
          selectionRect.setAttribute('height', (iconSize + 8).toString());
        };

        updateSelectionRect();
        selectionRect.setAttribute('fill', 'none');
        selectionRect.setAttribute('stroke', '#3b82f6');
        selectionRect.setAttribute('stroke-width', '2');
        selectionRect.setAttribute('stroke-dasharray', '5,5');
        selectionRect.setAttribute('class', 'icon-selection-border');
        selectionRect.style.display = 'none';

        const handleSize = 16;
        const handles = [
          { position: 'nw', cursor: 'nw-resize' },
          { position: 'ne', cursor: 'ne-resize' },
          { position: 'sw', cursor: 'sw-resize' },
          { position: 'se', cursor: 'se-resize' },
        ];
        const handleElements: SVGElement[] = [];

        const updateHandlePositions = () => {
          const iconSize = currentFontSize;
          const rectX = clickX - iconSize / 2 - 4;
          const rectY = clickY - iconSize / 2 - 4;
          const rectSize = iconSize + 8;

          const positions = [
            { x: rectX - handleSize / 2, y: rectY - handleSize / 2 },
            { x: rectX + rectSize - handleSize / 2, y: rectY - handleSize / 2 },
            { x: rectX - handleSize / 2, y: rectY + rectSize - handleSize / 2 },
            { x: rectX + rectSize - handleSize / 2, y: rectY + rectSize - handleSize / 2 },
          ];

          handleElements.forEach((handle, handleIndex) => {
            handle.setAttribute('x', positions[handleIndex].x.toString());
            handle.setAttribute('y', positions[handleIndex].y.toString());
          });
        };

        handles.forEach((handle) => {
          const handleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          handleRect.setAttribute('width', handleSize.toString());
          handleRect.setAttribute('height', handleSize.toString());
          handleRect.setAttribute('fill', '#3b82f6');
          handleRect.setAttribute('stroke', 'white');
          handleRect.setAttribute('stroke-width', '2');
          (handleRect as any).style && (handleRect as any).style.setProperty('touch-action', 'none');
          handleRect.setAttribute('cursor', handle.cursor);
          handleRect.setAttribute('class', `resize-handle resize-${handle.position}`);
          handleRect.style.display = 'none';
          handleElements.push(handleRect);
        });

        updateHandlePositions();

        textElement.addEventListener('click', (e) => {
          e.stopPropagation();
          svgElement
            .querySelectorAll('.custom-text-group, .custom-image-group, .custom-icon-group')
            .forEach((group) => {
              group
                .querySelectorAll('.text-selection-border, .selection-border, .icon-selection-border, .resize-handle')
                .forEach((el) => {
                  (el as SVGElement).style.display = 'none';
                });
            });

          selectionRect.style.display = 'block';
          handleElements.forEach((handle) => {
            handle.style.setProperty('display', 'block', 'important');
            handle.style.setProperty('pointer-events', 'all', 'important');
            handle.style.setProperty('z-index', '9999', 'important');
          });
        });

        let isResizing = false;
        let resizeHandle = '';
        let startX = 0,
          startY = 0,
          startFontSize = 0;

        handleElements.forEach((handle, handleIndex) => {
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            resizeHandle = handles[handleIndex].position as string;

            const rect = svgElement.getBoundingClientRect();
            startX = (e as MouseEvent).clientX - rect.left;
            startY = (e as MouseEvent).clientY - rect.top;
            startFontSize = currentFontSize;
          });
        });

        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;

          const rect = svgElement.getBoundingClientRect();
          const currentX = e.clientX - rect.left;
          const currentY = e.clientY - rect.top;
          const deltaX = currentX - startX;
          const deltaY = currentY - startY;

          let fontSizeChange = 0;
          switch (resizeHandle) {
            case 'se':
              fontSizeChange = (deltaX + deltaY) / 3;
              break;
            case 'sw':
              fontSizeChange = (-deltaX + deltaY) / 3;
              break;
            case 'ne':
              fontSizeChange = (deltaX - deltaY) / 3;
              break;
            case 'nw':
              fontSizeChange = (-deltaX - deltaY) / 3;
              break;
          }

          const newFontSize = Math.max(12, Math.min(96, startFontSize + fontSizeChange));
          currentFontSize = newFontSize;

          textElement.setAttribute('font-size', newFontSize.toString());
          updateSelectionRect();
          updateHandlePositions();
        };

        const handleMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            resizeHandle = '';
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        const cleanup = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        (iconGroup as any).__cleanup = cleanup;

        iconGroup.appendChild(textElement);
        iconGroup.appendChild(selectionRect);
        handleElements.forEach((handle) => iconGroup.appendChild(handle));

        iconGroup.removeAttribute('transform');
        iconGroup.style.opacity = '1';
        iconGroup.style.visibility = 'visible';
        iconGroup.style.display = 'block';

        getTargetParent(svgElement).appendChild(iconGroup);
      };

      try {
        let newNodeCode = '';
        const nodeId = `node_${Date.now()}`;

        switch (element.type) {
          case 'shape':
            if (element.shapeDefinition) {
              const def = element.shapeDefinition as Record<string, unknown>;
              const shapeName = await promptForText('Shape Text', `Enter text for the ${def.name}:`);
              if (shapeName) {
                newNodeCode = `\n    ${(def.syntax as (id: string, name: string) => string)(nodeId, shapeName)}`;
              }
            } else {
              const shapeName = await promptForText('Shape Text', 'Enter text for the shape:');
              if (shapeName) {
                newNodeCode = `\n    ${nodeId}[${shapeName}]`;
              }
            }
            break;

          case 'image': {
            let imageUrl = '';
            let altText = 'Image';
            let width = 80;
            let height = 80;

            if (element.imageDefinition) {
              const imgDef = element.imageDefinition as Record<string, unknown>;
              imageUrl = String(imgDef.url || '');
              altText = String(imgDef.altText || 'Image');
              width = Number(imgDef.width || 80);
              height = Number(imgDef.height || 80);
            } else {
              imageUrl = (await promptForText('Image URL', 'Enter the image URL:')) || '';
              if (imageUrl) {
                altText = (await promptForText('Alt Text', 'Enter alt text (optional):')) || 'Image';
              }
            }

            if (imageUrl) {
              addImageToSVG(imageUrl, altText, diagramX, diagramY, nodeId, width, height);
              dispatch(setPlacingElement(null));
              return;
            }
            break;
          }

          case 'svg-shape': {
            if (element.svgShapeDefinition) {
              const shapeDef = element.svgShapeDefinition as Record<string, unknown>;
              addSVGShapeToCanvas(shapeDef, diagramX, diagramY, nodeId);
              dispatch(setPlacingElement(null));
              return;
            } else {
              dispatch(setPlacingElement(null));
              return;
            }
          }

          case 'text': {
            let textContent = '';
            let textStyle = {
              fontSize: 16,
              color: '#000000',
              fontWeight: 'normal' as 'normal' | 'bold',
              fontStyle: 'normal' as 'normal' | 'italic',
              textDecoration: 'none' as 'none' | 'underline',
              backgroundColor: 'transparent',
              padding: 4,
              borderRadius: 0,
            };

            if (element.textDefinition) {
              const textDef = element.textDefinition as Record<string, unknown>;
              textContent = String(textDef.content || '');
              textStyle = {
                fontSize: Number(textDef.fontSize || 16),
                color: String(textDef.color || '#000'),
                fontWeight: (textDef.fontWeight || 'normal') as 'normal' | 'bold',
                fontStyle: (textDef.fontStyle || 'normal') as 'normal' | 'italic',
                textDecoration: (textDef.textDecoration || 'none') as 'none' | 'underline',
                backgroundColor: String(textDef.backgroundColor || 'transparent'),
                padding: Number(textDef.padding || 4),
                borderRadius: Number(textDef.borderRadius || 0),
              };
            } else {
              textContent = (await promptForText('Text Content', 'Enter the text content:')) || '';
            }

            if (textContent) {
              addTextToSVG(textContent, textStyle, diagramX, diagramY, nodeId);
              dispatch(setPlacingElement(null));
              return;
            }
            break;
          }

          case 'icon': {
            let iconContent = '';
            if (element.iconContent) {
              iconContent = String(element.iconContent);
            } else {
              iconContent = (await promptForText('Icon/Emoji', 'Enter an emoji or Unicode character:')) || '';
            }

            if (iconContent) {
              addIconToSVG(iconContent, diagramX, diagramY, nodeId);
              dispatch(setPlacingElement(null));
              return;
            }
            break;
          }
        }

        if (newNodeCode) {
          let updatedCode = mermaidCode.trim();

          if (!updatedCode) {
            updatedCode = 'flowchart TD';
          } else if (!updatedCode.includes('flowchart') && !updatedCode.includes('graph')) {
            dispatch(
              showNotification({
                message: 'Can only add elements to flowchart/graph diagrams',
                type: 'warning',
              } as any)
            );
            dispatch(setPlacingElement(null));
            return;
          }

          updatedCode += newNodeCode;

          dispatch(setMermaidCode(updatedCode));
          setTimeout(() => {
            positionElementAtCoordinates(nodeId, diagramX, diagramY);
          }, 100);

          dispatch(
            showNotification({
              message: `${element.type === 'shape' ? String((element.shapeDefinition as Record<string, unknown>)?.name || 'Shape') : String(element.type)} added successfully`,
              type: 'success' as const,
            })
          );
        }

        dispatch(setPlacingElement(null));
      } catch (error) {
        logger.error('Element placement error:', 'useElementPlacement', error instanceof Error ? error : undefined);
        dispatch(
          showNotification({
            message: `Failed to add ${element && element.type ? element.type : 'element'}`,
            type: 'error',
          } as any)
        );
        dispatch(setPlacingElement(null));
      }
    },
    [containerRef, mermaidCode, dispatch, positionElementAtCoordinates]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!placingElement) {
        return;
      }

      if (!containerRef.current) return;
      if (activeDragInfo) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e as React.MouseEvent).clientX - rect.left;
      const y = (e as React.MouseEvent).clientY - rect.top;

      const diagramX = (x - pan.x) / zoom;
      const diagramY = (y - pan.y) / zoom;

      console.error('🟢 handleCanvasClick fired', { type: (placingElement as Record<string, unknown>).type, diagramX, diagramY });
      handleElementPlacement(placingElement as Record<string, unknown>, x, y, diagramX, diagramY);
    },
    [placingElement, activeDragInfo, pan, zoom, handleElementPlacement, containerRef]
  );

  return { handleCanvasClick };
}
