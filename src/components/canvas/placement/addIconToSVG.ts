import React from 'react';
import { getTargetParent } from './placementUtils';

export const addIconToSVG = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  iconContent: string,
  clickX: number,
  clickY: number,
  nodeId: string
) => {
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
    svgElement.querySelectorAll('.custom-text-group, .custom-image-group, .custom-icon-group').forEach((group) => {
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
