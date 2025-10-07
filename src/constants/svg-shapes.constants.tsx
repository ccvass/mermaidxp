import { SVGShapeDefinition, SVGShapeProps } from '../types/svg-shapes.types';

// SVG Shape Icons for the panel
export const SVGShapeIcons = {
  Rectangle: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm bg-current/10 flex items-center justify-center">
      <span className="text-[8px]">▭</span>
    </div>
  ),

  Circle: () => (
    <div className="w-6 h-6 border-2 border-current rounded-full bg-current/10 flex items-center justify-center">
      <span className="text-[8px]">●</span>
    </div>
  ),

  Ellipse: () => (
    <div className="w-8 h-5 border-2 border-current rounded-full bg-current/10 flex items-center justify-center">
      <span className="text-[8px]">⬭</span>
    </div>
  ),

  Triangle: () => (
    <div className="w-6 h-6 flex items-center justify-center text-current">
      <span className="text-sm">▲</span>
    </div>
  ),

  Diamond: () => (
    <div className="w-6 h-6 border-2 border-current transform rotate-45 bg-current/10 flex items-center justify-center">
      <span className="transform -rotate-45 text-[8px]">◆</span>
    </div>
  ),

  Star: () => (
    <div className="w-6 h-6 flex items-center justify-center text-current">
      <span className="text-sm">★</span>
    </div>
  ),

  Hexagon: () => (
    <div className="w-6 h-6 flex items-center justify-center text-current">
      <span className="text-sm">⬡</span>
    </div>
  ),

  Arrow: () => (
    <div className="w-8 h-4 flex items-center justify-center text-current">
      <span className="text-sm">→</span>
    </div>
  ),

  Line: () => (
    <div className="w-8 h-4 flex items-center justify-center">
      <div className="w-6 h-0.5 bg-current"></div>
    </div>
  ),

  Polyline: () => (
    <div className="w-8 h-6 flex items-center justify-center text-current">
      <span className="text-xs">⟋⟍</span>
    </div>
  ),

  Polygon: () => (
    <div className="w-6 h-6 flex items-center justify-center text-current">
      <span className="text-sm">⬟</span>
    </div>
  ),
};

// SVG Generation Functions
const generateRectangle = (props: SVGShapeProps): string => {
  return `<rect 
    id="${props.id}" 
    x="${props.x}" 
    y="${props.y}" 
    width="${props.width}" 
    height="${props.height}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${props.x + props.width / 2} ${props.y + props.height / 2})"` : ''}
  />`;
};

const generateCircle = (props: SVGShapeProps): string => {
  const radius = Math.min(props.width, props.height) / 2;
  const cx = props.x + props.width / 2;
  const cy = props.y + props.height / 2;

  return `<circle 
    id="${props.id}" 
    cx="${cx}" 
    cy="${cy}" 
    r="${radius}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${cx} ${cy})"` : ''}
  />`;
};

const generateEllipse = (props: SVGShapeProps): string => {
  const rx = props.width / 2;
  const ry = props.height / 2;
  const cx = props.x + rx;
  const cy = props.y + ry;

  return `<ellipse 
    id="${props.id}" 
    cx="${cx}" 
    cy="${cy}" 
    rx="${rx}" 
    ry="${ry}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${cx} ${cy})"` : ''}
  />`;
};

const generateTriangle = (props: SVGShapeProps): string => {
  const x1 = props.x + props.width / 2;
  const y1 = props.y;
  const x2 = props.x;
  const y2 = props.y + props.height;
  const x3 = props.x + props.width;
  const y3 = props.y + props.height;

  return `<polygon 
    id="${props.id}" 
    points="${x1},${y1} ${x2},${y2} ${x3},${y3}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${props.x + props.width / 2} ${props.y + props.height / 2})"` : ''}
  />`;
};

const generateDiamond = (props: SVGShapeProps): string => {
  const cx = props.x + props.width / 2;
  const cy = props.y + props.height / 2;
  const x1 = cx;
  const y1 = props.y;
  const x2 = props.x + props.width;
  const y2 = cy;
  const x3 = cx;
  const y3 = props.y + props.height;
  const x4 = props.x;
  const y4 = cy;

  return `<polygon 
    id="${props.id}" 
    points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${cx} ${cy})"` : ''}
  />`;
};

const generateStar = (props: SVGShapeProps): string => {
  const cx = props.x + props.width / 2;
  const cy = props.y + props.height / 2;
  const outerRadius = Math.min(props.width, props.height) / 2;
  const innerRadius = outerRadius * 0.4;

  let points = '';
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points += `${x},${y} `;
  }

  return `<polygon 
    id="${props.id}" 
    points="${points.trim()}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${cx} ${cy})"` : ''}
  />`;
};

const generateHexagon = (props: SVGShapeProps): string => {
  const cx = props.x + props.width / 2;
  const cy = props.y + props.height / 2;
  const radius = Math.min(props.width, props.height) / 2;

  let points = '';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points += `${x},${y} `;
  }

  return `<polygon 
    id="${props.id}" 
    points="${points.trim()}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${cx} ${cy})"` : ''}
  />`;
};

const generateArrow = (props: SVGShapeProps): string => {
  const bodyWidth = props.width * 0.7;
  const bodyHeight = props.height * 0.4;
  const bodyY = props.y + (props.height - bodyHeight) / 2;

  const points = `
    ${props.x},${bodyY}
    ${props.x + bodyWidth},${bodyY}
    ${props.x + bodyWidth},${props.y}
    ${props.x + props.width},${props.y + props.height / 2}
    ${props.x + bodyWidth},${props.y + props.height}
    ${props.x + bodyWidth},${bodyY + bodyHeight}
    ${props.x},${bodyY + bodyHeight}
  `;

  return `<polygon 
    id="${props.id}" 
    points="${points}" 
    fill="${props.style.fill}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${props.x + props.width / 2} ${props.y + props.height / 2})"` : ''}
  />`;
};

const generateLine = (props: SVGShapeProps): string => {
  return `<line 
    id="${props.id}" 
    x1="${props.x}" 
    y1="${props.y + props.height / 2}" 
    x2="${props.x + props.width}" 
    y2="${props.y + props.height / 2}" 
    stroke="${props.style.stroke}" 
    stroke-width="${props.style.strokeWidth}" 
    opacity="${props.style.opacity}"
    ${props.rotation ? `transform="rotate(${props.rotation} ${props.x + props.width / 2} ${props.y + props.height / 2})"` : ''}
  />`;
};

// SVG Shapes Library
export const SVG_SHAPES_LIBRARY: SVGShapeDefinition[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    type: 'rectangle',
    category: 'basic',
    icon: SVGShapeIcons.Rectangle,
    description: 'Basic rectangle shape',
    tags: ['rectangle', 'square', 'box', 'basic'],
    defaultSize: { width: 100, height: 60 },
    minSize: { width: 20, height: 20 },
    maxSize: { width: 500, height: 300 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateRectangle,
  },
  {
    id: 'circle',
    name: 'Circle',
    type: 'circle',
    category: 'basic',
    icon: SVGShapeIcons.Circle,
    description: 'Perfect circle shape',
    tags: ['circle', 'round', 'basic'],
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 20, height: 20 },
    maxSize: { width: 300, height: 300 },
    isResizable: true,
    isRotatable: false,
    defaultStyle: {
      fill: '#10b981',
      stroke: '#047857',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateCircle,
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    type: 'ellipse',
    category: 'basic',
    icon: SVGShapeIcons.Ellipse,
    description: 'Oval/ellipse shape',
    tags: ['ellipse', 'oval', 'basic'],
    defaultSize: { width: 120, height: 60 },
    minSize: { width: 30, height: 20 },
    maxSize: { width: 400, height: 200 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateEllipse,
  },
  {
    id: 'triangle',
    name: 'Triangle',
    type: 'triangle',
    category: 'geometric',
    icon: SVGShapeIcons.Triangle,
    description: 'Triangular shape',
    tags: ['triangle', 'geometric', 'polygon'],
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 30, height: 30 },
    maxSize: { width: 200, height: 200 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateTriangle,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    type: 'diamond',
    category: 'geometric',
    icon: SVGShapeIcons.Diamond,
    description: 'Diamond/rhombus shape',
    tags: ['diamond', 'rhombus', 'geometric'],
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 30, height: 30 },
    maxSize: { width: 200, height: 200 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateDiamond,
  },
  {
    id: 'star',
    name: 'Star',
    type: 'star',
    category: 'decorative',
    icon: SVGShapeIcons.Star,
    description: 'Five-pointed star',
    tags: ['star', 'decorative', 'polygon'],
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 30, height: 30 },
    maxSize: { width: 200, height: 200 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#fbbf24',
      stroke: '#f59e0b',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateStar,
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    type: 'hexagon',
    category: 'geometric',
    icon: SVGShapeIcons.Hexagon,
    description: 'Six-sided polygon',
    tags: ['hexagon', 'geometric', 'polygon'],
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 30, height: 30 },
    maxSize: { width: 200, height: 200 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#06b6d4',
      stroke: '#0891b2',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateHexagon,
  },
  {
    id: 'arrow',
    name: 'Arrow',
    type: 'arrow',
    category: 'arrows',
    icon: SVGShapeIcons.Arrow,
    description: 'Arrow shape pointing right',
    tags: ['arrow', 'pointer', 'direction'],
    defaultSize: { width: 100, height: 40 },
    minSize: { width: 40, height: 20 },
    maxSize: { width: 300, height: 100 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: '#84cc16',
      stroke: '#65a30d',
      strokeWidth: 2,
      opacity: 0.8,
    },
    generateSVG: generateArrow,
  },
  {
    id: 'line',
    name: 'Line',
    type: 'line',
    category: 'basic',
    icon: SVGShapeIcons.Line,
    description: 'Straight line',
    tags: ['line', 'straight', 'basic'],
    defaultSize: { width: 100, height: 2 },
    minSize: { width: 20, height: 1 },
    maxSize: { width: 500, height: 10 },
    isResizable: true,
    isRotatable: true,
    defaultStyle: {
      fill: 'none',
      stroke: '#374151',
      strokeWidth: 3,
      opacity: 1,
    },
    generateSVG: generateLine,
  },
];

// Category definitions
export const SVG_SHAPE_CATEGORIES = {
  all: { name: 'All Shapes', color: 'gray', icon: '📦' },
  basic: { name: 'Basic', color: 'blue', icon: '⬜' },
  geometric: { name: 'Geometric', color: 'purple', icon: '🔷' },
  arrows: { name: 'Arrows', color: 'green', icon: '➡️' },
  decorative: { name: 'Decorative', color: 'yellow', icon: '✨' },
  custom: { name: 'Custom', color: 'pink', icon: '🎨' },
} as const;
