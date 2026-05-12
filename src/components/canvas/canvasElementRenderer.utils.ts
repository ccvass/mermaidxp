import { CanvasElement } from '../../store/slices/canvasElementsSlice';
import { SVG_SHAPES_LIBRARY } from '../../constants/svg-shapes.constants';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SHAPE_DEFINITION_MAP = new Map(SVG_SHAPES_LIBRARY.map((shape) => [shape.id, shape]));

// Create SVG element for canvas element
export function createElementSVG(element: CanvasElement, isSelected: boolean): SVGElement | null {
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('data-element-id', element.id);
  group.setAttribute('data-element-type', element.type);
  group.setAttribute('data-type', element.type);

  const classNames = ['canvas-element', `canvas-element-${element.type}`];
  switch (element.type) {
    case 'text':
      classNames.push('custom-text-group');
      break;
    case 'image':
      classNames.push('custom-image-group');
      break;
    case 'icon':
      classNames.push('custom-icon-group');
      break;
    case 'svg-shape':
    case 'enhanced-shape':
      classNames.push('custom-svg-shape-group');
      break;
  }
  group.setAttribute('class', classNames.join(' '));
  group.setAttribute('transform', `translate(${element.position.x}, ${element.position.y})`);

  if (element.rotation) {
    const centerX = element.size.width / 2;
    const centerY = element.size.height / 2;
    group.setAttribute(
      'transform',
      `translate(${element.position.x}, ${element.position.y}) rotate(${element.rotation}, ${centerX}, ${centerY})`
    );
  }

  let mainElement: SVGElement | null = null;

  switch (element.type) {
    case 'text':
      mainElement = createTextElement(element);
      break;
    case 'image':
      mainElement = createImageElement(element);
      break;
    case 'icon':
      mainElement = createIconElement(element);
      break;
    case 'svg-shape':
      mainElement = createSvgShapeElement(element) ?? createShapeElement(element);
      break;
    case 'enhanced-shape':
      mainElement = createShapeElement(element);
      break;
    default:
      return null;
  }

  if (mainElement) {
    group.appendChild(mainElement);
  }

  if (isSelected) {
    group.appendChild(createSelectionBorder(element));
  }

  group.setAttribute('cursor', 'move');
  group.setAttribute('data-draggable', 'true');
  group.style.pointerEvents = 'auto';

  return group;
}

function createTextElement(element: CanvasElement): SVGElement {
  const group = document.createElementNS(SVG_NS, 'g');

  const padding = element.style?.padding ?? 0;
  const width = element.size?.width ?? 100;
  const height = element.size?.height ?? element.style?.fontSize ?? 16;
  const backgroundColor = element.style?.backgroundColor ?? 'transparent';
  const borderRadius = element.style?.borderRadius ?? 0;

  if (backgroundColor && backgroundColor !== 'transparent') {
    const background = document.createElementNS(SVG_NS, 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', width.toString());
    background.setAttribute('height', height.toString());
    background.setAttribute('fill', backgroundColor);
    background.setAttribute('rx', borderRadius.toString());
    background.setAttribute('ry', borderRadius.toString());
    group.appendChild(background);
  }

  const textElement = document.createElementNS(SVG_NS, 'text');
  textElement.setAttribute('x', padding.toString());
  textElement.setAttribute('y', padding.toString());
  textElement.setAttribute('dominant-baseline', 'hanging');
  textElement.setAttribute('class', 'text-content');
  textElement.textContent = element.content || 'Text';

  if (element.style) {
    if (element.style.fontSize) textElement.setAttribute('font-size', `${element.style.fontSize}px`);
    if (element.style.fontFamily) textElement.setAttribute('font-family', element.style.fontFamily);
    if (element.style.color) textElement.setAttribute('fill', element.style.color);
    if (element.style.fontWeight) textElement.setAttribute('font-weight', element.style.fontWeight);
    if (element.style.fontStyle) textElement.setAttribute('font-style', element.style.fontStyle);
    if (element.style.textDecoration) textElement.setAttribute('text-decoration', element.style.textDecoration);
    if (element.style.opacity !== undefined) textElement.setAttribute('opacity', element.style.opacity.toString());
  }

  group.appendChild(textElement);
  return group;
}

function createImageElement(element: CanvasElement): SVGElement {
  const imageElement = document.createElementNS(SVG_NS, 'image');
  imageElement.setAttribute('x', '0');
  imageElement.setAttribute('y', '0');
  imageElement.setAttribute('width', element.size.width.toString());
  imageElement.setAttribute('height', element.size.height.toString());
  imageElement.setAttribute('href', element.imageUrl || '');
  imageElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  if (element.style?.opacity !== undefined) {
    imageElement.setAttribute('opacity', element.style.opacity.toString());
  }

  return imageElement;
}

function createIconElement(element: CanvasElement): SVGElement {
  const group = document.createElementNS(SVG_NS, 'g');

  const background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('x', '0');
  background.setAttribute('y', '0');
  background.setAttribute('width', element.size.width.toString());
  background.setAttribute('height', element.size.height.toString());
  background.setAttribute('fill', 'transparent');
  background.setAttribute('pointer-events', 'all');
  group.appendChild(background);

  const textElement = document.createElementNS(SVG_NS, 'text');
  textElement.setAttribute('x', (element.size.width / 2).toString());
  textElement.setAttribute('y', (element.size.height / 2).toString());
  textElement.setAttribute('text-anchor', 'middle');
  textElement.setAttribute('dominant-baseline', 'central');
  textElement.setAttribute('font-size', Math.min(element.size.width, element.size.height) * 0.8 + 'px');
  textElement.textContent = element.content || '🔷';

  if (element.style?.opacity !== undefined) {
    textElement.setAttribute('opacity', element.style.opacity.toString());
  }

  group.appendChild(textElement);
  return group;
}

function createSvgShapeElement(element: CanvasElement): SVGElement | null {
  const rawShapeData = (element.shapeData || {}) as Record<string, unknown>;
  const svgDef = rawShapeData.svgShapeDefinition as Record<string, unknown> | undefined;
  const shapeId = rawShapeData.shapeId || rawShapeData.shapeName || rawShapeData.id || svgDef?.id || svgDef?.shapeId;

  const definition = shapeId ? SHAPE_DEFINITION_MAP.get(String(shapeId)) : undefined;
  if (!definition) return null;

  const fill = 'none';
  const stroke = '#111827';
  const strokeWidth = 2;
  const opacity = element.style?.opacity ?? definition.defaultStyle.opacity ?? 1;

  try {
    const markup = definition.generateSVG({
      id: `${element.id}-shape`,
      x: 0,
      y: 0,
      width: element.size.width,
      height: element.size.height,
      rotation: element.rotation,
      style: { fill, stroke, strokeWidth, opacity },
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<svg xmlns="${SVG_NS}">${markup}</svg>`, 'image/svg+xml');
    const shapeElement = doc.documentElement.firstElementChild as SVGElement | null;
    if (!shapeElement) return null;

    shapeElement.setAttribute('class', `svg-shape-content svg-shape-${definition.id}`);
    shapeElement.setAttribute('data-shape-id', definition.id);
    shapeElement.setAttribute('pointer-events', 'auto');

    return shapeElement;
  } catch {
    return null;
  }
}

function createShapeElement(element: CanvasElement): SVGElement {
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', element.size.width.toString());
  rect.setAttribute('height', element.size.height.toString());
  rect.setAttribute('fill', '#e2e8f0');
  rect.setAttribute('stroke', '#94a3b8');
  rect.setAttribute('stroke-width', '1');
  rect.setAttribute('rx', '4');

  if (element.style?.opacity !== undefined) {
    rect.setAttribute('opacity', element.style.opacity.toString());
  }

  if (element.content) {
    const group = document.createElementNS(SVG_NS, 'g');
    group.appendChild(rect);

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', (element.size.width / 2).toString());
    text.setAttribute('y', (element.size.height / 2).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '14px');
    text.setAttribute('fill', element.style?.color || '#1f2937');
    text.textContent = element.content;

    group.appendChild(text);
    return group;
  }

  return rect;
}

function createSelectionBorder(element: CanvasElement): SVGElement {
  const border = document.createElementNS(SVG_NS, 'rect');
  const offset = 2;
  border.setAttribute('x', (-offset).toString());
  border.setAttribute('y', (-offset).toString());
  border.setAttribute('width', (element.size.width + offset * 2).toString());
  border.setAttribute('height', (element.size.height + offset * 2).toString());
  border.setAttribute('fill', 'none');
  border.setAttribute('stroke', '#3b82f6');
  border.setAttribute('stroke-width', '2');
  border.setAttribute('stroke-dasharray', '5,5');
  border.setAttribute('class', 'selection-border');
  border.style.pointerEvents = 'none';
  return border;
}

// Update existing element in SVG
export function updateElementInSVG(svgElement: SVGElement, element: CanvasElement, isSelected: boolean): void {
  if (element.rotation) {
    const centerX = element.size.width / 2;
    const centerY = element.size.height / 2;
    svgElement.setAttribute(
      'transform',
      `translate(${element.position.x}, ${element.position.y}) rotate(${element.rotation}, ${centerX}, ${centerY})`
    );
  } else {
    svgElement.setAttribute('transform', `translate(${element.position.x}, ${element.position.y})`);
  }

  const mainElement = selectMainElement(svgElement, element);
  if (mainElement) {
    updateElementContent(mainElement as SVGElement, element);
  }

  const existingBorder = svgElement.querySelector('.selection-border');
  if (isSelected && !existingBorder) {
    svgElement.appendChild(createSelectionBorder(element));
  } else if (!isSelected && existingBorder) {
    existingBorder.remove();
  } else if (isSelected && existingBorder) {
    const offset = 2;
    existingBorder.setAttribute('x', (-offset).toString());
    existingBorder.setAttribute('y', (-offset).toString());
    existingBorder.setAttribute('width', (element.size.width + offset * 2).toString());
    existingBorder.setAttribute('height', (element.size.height + offset * 2).toString());
  }
}

function updateElementContent(svgElement: SVGElement, element: CanvasElement): void {
  switch (element.type) {
    case 'text':
      if (svgElement.tagName === 'text') {
        svgElement.textContent = element.content || 'Text';
        if (element.style?.fontSize) svgElement.setAttribute('font-size', `${element.style.fontSize}px`);
        if (element.style?.color) svgElement.setAttribute('fill', element.style.color);
      }
      break;
    case 'image':
      if (svgElement.tagName === 'image') {
        svgElement.setAttribute('width', element.size.width.toString());
        svgElement.setAttribute('height', element.size.height.toString());
        svgElement.setAttribute('href', element.imageUrl || '');
      }
      break;
    case 'icon':
      if (svgElement.tagName === 'g') {
        const bg = svgElement.querySelector('rect');
        if (bg) {
          bg.setAttribute('width', element.size.width.toString());
          bg.setAttribute('height', element.size.height.toString());
        }
        const text = svgElement.querySelector('text');
        if (text) {
          text.textContent = element.content || '🔷';
          text.setAttribute('x', (element.size.width / 2).toString());
          text.setAttribute('y', (element.size.height / 2).toString());
          text.setAttribute('font-size', Math.min(element.size.width, element.size.height) * 0.8 + 'px');
        }
      }
      break;
    case 'svg-shape': {
      const newShape = createSvgShapeElement(element);
      if (newShape) {
        const existingShape = svgElement.querySelector('.svg-shape-content');
        if (existingShape) {
          existingShape.replaceWith(newShape);
        } else {
          const selection = svgElement.querySelector('.selection-border');
          if (selection) {
            svgElement.insertBefore(newShape, selection);
          } else {
            svgElement.appendChild(newShape);
          }
        }
      }
      break;
    }
    case 'enhanced-shape':
      if (svgElement.tagName === 'rect') {
        svgElement.setAttribute('width', element.size.width.toString());
        svgElement.setAttribute('height', element.size.height.toString());
        svgElement.setAttribute('fill', element.style?.backgroundColor || '#e2e8f0');
        svgElement.setAttribute('stroke', element.style?.color || '#64748b');
      }
      break;
  }

  if (element.style?.opacity !== undefined) {
    svgElement.setAttribute('opacity', element.style.opacity.toString());
  }
}

function selectMainElement(group: SVGElement, element: CanvasElement): SVGElement | null {
  switch (element.type) {
    case 'text': {
      const t = group.querySelector('text.text-content') || group.querySelector('text');
      return (t as SVGElement) || null;
    }
    case 'image': {
      const img = group.querySelector('image');
      return (img as SVGElement) || null;
    }
    case 'icon': {
      const iconGroup = group.querySelector('g');
      return (iconGroup as SVGElement) || null;
    }
    case 'svg-shape': {
      const shape = group.querySelector('.svg-shape-content');
      return (shape as SVGElement) || null;
    }
    case 'enhanced-shape': {
      const rect =
        (group.querySelector(':scope > rect:not(.selection-border):not(.resize-handle)') as SVGElement) ||
        (group.querySelector('rect:not(.selection-border):not(.resize-handle)') as SVGElement);
      return rect || null;
    }
    default:
      break;
  }
  return null;
}
