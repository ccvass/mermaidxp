import React from 'react';
import { getTargetParent } from './placementUtils';

export const addSVGShapeToCanvas = (
  containerRef: React.RefObject<HTMLDivElement | null>,
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
