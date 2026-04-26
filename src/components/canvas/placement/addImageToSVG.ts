import React from 'react';
import { getTargetParent } from './placementUtils';

export const addImageToSVG = (
  containerRef: React.RefObject<HTMLDivElement | null>,
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
