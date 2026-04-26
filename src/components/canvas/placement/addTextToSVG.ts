import React from 'react';
import { getTargetParent } from './placementUtils';

export const addTextToSVG = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  textContent: string,
  textStyle: Record<string, unknown>,
  clickX: number,
  clickY: number,
  nodeId: string
) => {
  if (!containerRef.current) return;

  const svgElement = containerRef.current.querySelector('svg');
  if (!svgElement) return;

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
