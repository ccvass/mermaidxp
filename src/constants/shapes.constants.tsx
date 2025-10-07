import { ShapeDefinition, ShapeLibraryConfig, ShapeSVGParams, ShapeSearchFilters } from '../types/shapes.types';
import { ADVANCED_SHAPE_LIBRARIES } from './advanced-shapes.constants';

// Enhanced Shape Icons with better visual representation
export const ShapeIcons = {
  Rectangle: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs bg-current/10">
      <span className="text-[8px]">□</span>
    </div>
  ),

  RoundedRectangle: () => (
    <div className="w-8 h-6 border-2 border-current rounded-md flex items-center justify-center text-xs bg-current/10">
      <span className="text-[8px]">▢</span>
    </div>
  ),

  Stadium: () => (
    <div className="w-8 h-6 border-2 border-current rounded-full flex items-center justify-center text-xs bg-current/10">
      <span className="text-[8px]">⬭</span>
    </div>
  ),

  Circle: () => (
    <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center text-xs bg-current/10">
      <span className="text-[8px]">●</span>
    </div>
  ),

  Diamond: () => (
    <div className="w-6 h-6 border-2 border-current transform rotate-45 flex items-center justify-center text-xs bg-current/10">
      <span className="transform -rotate-45 text-[8px]">◆</span>
    </div>
  ),

  Hexagon: () => (
    <div className="w-8 h-6 flex items-center justify-center text-lg text-current">
      <span className="text-sm">⬡</span>
    </div>
  ),

  Parallelogram: () => (
    <div className="w-8 h-6 border-2 border-current transform skew-x-12 flex items-center justify-center text-xs bg-current/10">
      <span className="transform -skew-x-12 text-[8px]">▱</span>
    </div>
  ),

  Trapezoid: () => (
    <div className="w-8 h-6 flex items-center justify-center text-current">
      <span className="text-sm">⬢</span>
    </div>
  ),

  Cylinder: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs relative bg-current/10">
      <div className="absolute -top-1 w-full h-2 border-2 border-current rounded-full bg-current/20"></div>
      <span className="text-[8px]">🗄️</span>
    </div>
  ),

  Flag: () => (
    <div className="w-8 h-6 flex items-center justify-center text-current">
      <span className="text-sm">🏁</span>
    </div>
  ),

  // Flowchart specific shapes
  Process: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs bg-blue-100 dark:bg-blue-900/30">
      <span className="text-[8px]">⚙️</span>
    </div>
  ),

  Decision: () => (
    <div className="w-6 h-6 border-2 border-current transform rotate-45 flex items-center justify-center text-xs bg-yellow-100 dark:bg-yellow-900/30">
      <span className="transform -rotate-45 text-[8px]">?</span>
    </div>
  ),

  StartEnd: () => (
    <div className="w-8 h-6 border-2 border-current rounded-full flex items-center justify-center text-xs bg-green-100 dark:bg-green-900/30">
      <span className="text-[8px]">⚡</span>
    </div>
  ),

  // UML shapes
  Class: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex flex-col items-center justify-center text-xs bg-purple-100 dark:bg-purple-900/30">
      <div className="text-[6px] border-b border-current w-full text-center">C</div>
      <div className="text-[6px]">---</div>
    </div>
  ),

  Actor: () => (
    <div className="w-6 h-6 flex items-center justify-center text-current">
      <span className="text-sm">👤</span>
    </div>
  ),

  UseCase: () => (
    <div className="w-8 h-5 border-2 border-current rounded-full flex items-center justify-center text-xs bg-current/10">
      <span className="text-[8px]">UC</span>
    </div>
  ),

  // Architecture shapes
  Server: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs bg-gray-100 dark:bg-gray-800">
      <span className="text-[8px]">🖥️</span>
    </div>
  ),

  Database: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs relative bg-current/10">
      <div className="absolute -top-1 w-full h-2 border-2 border-current rounded-full bg-current/20"></div>
      <span className="text-[8px]">💾</span>
    </div>
  ),

  Cloud: () => (
    <div className="w-8 h-6 flex items-center justify-center text-current">
      <span className="text-sm">☁️</span>
    </div>
  ),

  // Network shapes
  Router: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs bg-orange-100 dark:bg-orange-900/30">
      <span className="text-[8px]">📡</span>
    </div>
  ),

  Switch: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs bg-blue-100 dark:bg-blue-900/30">
      <span className="text-[8px]">🔀</span>
    </div>
  ),

  Firewall: () => (
    <div className="w-8 h-6 border-2 border-current rounded-sm flex items-center justify-center text-xs bg-red-100 dark:bg-red-900/30">
      <span className="text-[8px]">🛡️</span>
    </div>
  ),
};

// -------------------------
// SVG generator helpers
// -------------------------
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const withDefaults = (p: ShapeSVGParams) => ({
  ...p,
  x: p.x ?? 0,
  y: p.y ?? 0,
  width: p.width ?? 100,
  height: p.height ?? 60,
  fill: p.fill ?? '#e1f5fe',
  stroke: p.stroke ?? '#0277bd',
  strokeWidth: p.strokeWidth ?? 2,
});

const textEl = (p: ShapeSVGParams) => {
  const { x, y, width, height, text } = withDefaults(p);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#111">${esc(
    text || ''
  )}</text>`;
};

const rectSVG = (p: ShapeSVGParams & { rx?: number; ry?: number }) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const rx = (p as any).rx ?? 0;
  const ry = (p as any).ry ?? 0;
  return `<g id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const ellipseSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const circleSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const r = Math.min(width, height) / 2;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const diamondSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${
    y + height / 2
  }`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const hexagonSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const hw = width / 2;
  const points = `${x + hw * 0.5},${y} ${x + hw * 1.5},${y} ${x + width},${y + height / 2} ${x + hw * 1.5},${
    y + height
  } ${x + hw * 0.5},${y + height} ${x},${y + height / 2}`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const parallelogramSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const skew = Math.max(8, Math.round(width * 0.2));
  const points = `${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const trapezoidSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const topInset = Math.max(8, Math.round(width * 0.2));
  const points = `${x + topInset},${y} ${x + width - topInset},${y} ${x + width},${y + height} ${x},${y + height}`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const stadiumSVG = (p: ShapeSVGParams) =>
  rectSVG({ ...p, rx: Math.round((p.height ?? 60) / 2), ry: Math.round((p.height ?? 60) / 2) });

const cylinderSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const rx = width / 2;
  const ry = Math.max(6, Math.round(height * 0.15));
  const cx = x + width / 2;
  const topY = y + ry;
  const bodyHeight = height - ry * 2;
  return `<g id="${id}">
    <ellipse cx="${cx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <rect x="${x}" y="${topY}" width="${width}" height="${bodyHeight}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <ellipse cx="${cx}" cy="${y + height - ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    ${textEl(p)}
  </g>`;
};

const flagSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const poleW = Math.max(2, Math.round(width * 0.06));
  const flagW = width - poleW - 4;
  const flagH = Math.round(height * 0.7);
  const points = `${x + poleW + 2},${y} ${x + poleW + 2 + flagW},${y + flagH / 2} ${x + poleW + 2},${y + flagH}`;
  return `<g id="${id}">
    <rect x="${x}" y="${y}" width="${poleW}" height="${height}" fill="${stroke}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    ${textEl({ ...p, y: y + flagH + (height - flagH) / 2 })}
  </g>`;
};

// triangleSVG intentionally omitted here (present in advanced library) to avoid duplication

// -------------------------
// Basic Shapes Library
// -------------------------
export const BASIC_SHAPES: ShapeDefinition[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    type: 'rectangle',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.Rectangle,
    svgGenerator: (p) => rectSVG(p),
    description: 'Basic rectangular node',
    tags: ['basic', 'rectangle', 'box'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 60 },
    minSize: { width: 60, height: 30 },
    maxSize: { width: 300, height: 150 },
  },
  {
    id: 'rounded-rectangle',
    name: 'Rounded Rectangle',
    type: 'round',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.RoundedRectangle,
    svgGenerator: (p) => rectSVG({ ...p, rx: Math.round((p.height ?? 60) / 5), ry: Math.round((p.height ?? 60) / 5) }),
    description: 'Rounded corner rectangle',
    tags: ['basic', 'rounded', 'rectangle'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 60 },
    minSize: { width: 60, height: 30 },
    maxSize: { width: 300, height: 150 },
  },
  {
    id: 'stadium',
    name: 'Stadium',
    type: 'stadium',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.Stadium,
    svgGenerator: (p) => stadiumSVG(p),
    description: 'Stadium/pill shaped node',
    tags: ['basic', 'stadium', 'pill', 'oval'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 140, height: 60 },
    minSize: { width: 80, height: 40 },
    maxSize: { width: 300, height: 100 },
  },
  {
    id: 'circle',
    name: 'Circle',
    type: 'circle',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.Circle,
    svgGenerator: (p) => circleSVG(p),
    description: 'Circular node',
    tags: ['basic', 'circle', 'round'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 40, height: 40 },
    maxSize: { width: 200, height: 200 },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    type: 'diamond',
    category: 'flowchart',
    library: 'mermaid',
    icon: ShapeIcons.Diamond,
    svgGenerator: (p) => diamondSVG(p),
    description: 'Decision/diamond shape',
    tags: ['flowchart', 'decision', 'diamond', 'conditional'],
    isResizable: true,
    isRotatable: true,
    defaultSize: { width: 100, height: 100 },
    minSize: { width: 60, height: 60 },
    maxSize: { width: 200, height: 200 },
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    type: 'hexagon',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.Hexagon,
    svgGenerator: (p) => hexagonSVG(p),
    description: 'Hexagonal node',
    tags: ['basic', 'hexagon', 'six-sided'],
    isResizable: true,
    isRotatable: true,
    defaultSize: { width: 120, height: 100 },
    minSize: { width: 80, height: 60 },
    maxSize: { width: 250, height: 200 },
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram',
    type: 'parallelogram',
    category: 'flowchart',
    library: 'mermaid',
    icon: ShapeIcons.Parallelogram,
    svgGenerator: (p) => parallelogramSVG(p),
    description: 'Input/output shape',
    tags: ['flowchart', 'input', 'output', 'parallelogram'],
    isResizable: true,
    isRotatable: true,
    defaultSize: { width: 140, height: 70 },
    minSize: { width: 80, height: 40 },
    maxSize: { width: 300, height: 150 },
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid',
    type: 'trapezoid',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.Trapezoid,
    svgGenerator: (p) => trapezoidSVG(p),
    description: 'Trapezoid shape',
    tags: ['basic', 'trapezoid', 'manual'],
    isResizable: true,
    isRotatable: true,
    defaultSize: { width: 120, height: 80 },
    minSize: { width: 80, height: 50 },
    maxSize: { width: 250, height: 150 },
  },
  {
    id: 'cylinder',
    name: 'Database',
    type: 'cylinder',
    category: 'database',
    library: 'mermaid',
    icon: ShapeIcons.Cylinder,
    svgGenerator: (p) => cylinderSVG(p),
    description: 'Database/cylinder shape',
    tags: ['database', 'storage', 'cylinder', 'data'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 120 },
    minSize: { width: 60, height: 80 },
    maxSize: { width: 200, height: 250 },
  },
  {
    id: 'flag',
    name: 'Flag',
    type: 'flag',
    category: 'basic',
    library: 'mermaid',
    icon: ShapeIcons.Flag,
    svgGenerator: (p) => flagSVG(p),
    description: 'Flag/banner shape',
    tags: ['basic', 'flag', 'banner', 'marker'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 60 },
    minSize: { width: 80, height: 40 },
    maxSize: { width: 250, height: 120 },
  },
];

// Flowchart Shapes Library
export const FLOWCHART_SHAPES: ShapeDefinition[] = [
  {
    id: 'process',
    name: 'Process',
    type: 'process',
    category: 'flowchart',
    library: 'mermaid',
    icon: ShapeIcons.Process,
    svgGenerator: (p) => rectSVG(p),
    description: 'Process step in flowchart',
    tags: ['flowchart', 'process', 'step', 'action'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 140, height: 70 },
    minSize: { width: 80, height: 40 },
    maxSize: { width: 300, height: 150 },
  },
  {
    id: 'decision',
    name: 'Decision',
    type: 'decision',
    category: 'flowchart',
    library: 'mermaid',
    icon: ShapeIcons.Decision,
    svgGenerator: (p) => diamondSVG(p),
    description: 'Decision point in flowchart',
    tags: ['flowchart', 'decision', 'conditional', 'branch'],
    isResizable: true,
    isRotatable: true,
    defaultSize: { width: 120, height: 120 },
    minSize: { width: 80, height: 80 },
    maxSize: { width: 200, height: 200 },
  },
  {
    id: 'start-end',
    name: 'Start/End',
    type: 'start-end',
    category: 'flowchart',
    library: 'mermaid',
    icon: ShapeIcons.StartEnd,
    svgGenerator: (p) => stadiumSVG(p),
    description: 'Start or end point in flowchart',
    tags: ['flowchart', 'start', 'end', 'terminal'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 60 },
    minSize: { width: 80, height: 40 },
    maxSize: { width: 250, height: 100 },
  },
];

// UML Shapes Library
export const UML_SHAPES: ShapeDefinition[] = [
  {
    id: 'class',
    name: 'Class',
    type: 'class',
    category: 'uml',
    library: 'mermaid',
    icon: ShapeIcons.Class,
    svgGenerator: (p) => rectSVG(p),
    description: 'UML Class representation',
    tags: ['uml', 'class', 'object', 'oop'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 150, height: 100 },
    minSize: { width: 100, height: 80 },
    maxSize: { width: 300, height: 200 },
  },
  {
    id: 'actor',
    name: 'Actor',
    type: 'actor',
    category: 'uml',
    library: 'mermaid',
    icon: ShapeIcons.Actor,
    svgGenerator: (p) => circleSVG(p),
    description: 'UML Actor (user/system)',
    tags: ['uml', 'actor', 'user', 'system'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 80, height: 100 },
    minSize: { width: 60, height: 80 },
    maxSize: { width: 120, height: 150 },
  },
  {
    id: 'use-case',
    name: 'Use Case',
    type: 'use-case',
    category: 'uml',
    library: 'mermaid',
    icon: ShapeIcons.UseCase,
    svgGenerator: (p) => ellipseSVG(p),
    description: 'UML Use Case',
    tags: ['uml', 'use-case', 'functionality'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 140, height: 80 },
    minSize: { width: 100, height: 60 },
    maxSize: { width: 250, height: 120 },
  },
];

// Architecture Shapes Library
export const ARCHITECTURE_SHAPES: ShapeDefinition[] = [
  {
    id: 'server',
    name: 'Server',
    type: 'server',
    category: 'architecture',
    library: 'custom',
    icon: ShapeIcons.Server,
    svgGenerator: (p) => rectSVG(p),
    description: 'Server/compute resource',
    tags: ['architecture', 'server', 'compute', 'infrastructure'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 80 },
    minSize: { width: 80, height: 60 },
    maxSize: { width: 200, height: 150 },
  },
  {
    id: 'database-arch',
    name: 'Database',
    type: 'database',
    category: 'architecture',
    library: 'custom',
    icon: ShapeIcons.Database,
    svgGenerator: (p) => cylinderSVG(p),
    description: 'Database/storage system',
    tags: ['architecture', 'database', 'storage', 'data'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 120 },
    minSize: { width: 70, height: 90 },
    maxSize: { width: 180, height: 220 },
  },
  {
    id: 'cloud',
    name: 'Cloud',
    type: 'cloud',
    category: 'architecture',
    library: 'custom',
    icon: ShapeIcons.Cloud,
    svgGenerator: (p) => ellipseSVG(p),
    description: 'Cloud service/resource',
    tags: ['architecture', 'cloud', 'service', 'aws', 'azure'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 140, height: 80 },
    minSize: { width: 100, height: 60 },
    maxSize: { width: 250, height: 150 },
  },
];

// Network Shapes Library
export const NETWORK_SHAPES: ShapeDefinition[] = [
  {
    id: 'router',
    name: 'Router',
    type: 'router',
    category: 'network',
    library: 'custom',
    icon: ShapeIcons.Router,
    svgGenerator: (p) => rectSVG(p),
    description: 'Network router',
    tags: ['network', 'router', 'networking', 'infrastructure'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 60 },
    minSize: { width: 70, height: 40 },
    maxSize: { width: 150, height: 100 },
  },
  {
    id: 'switch',
    name: 'Switch',
    type: 'switch',
    category: 'network',
    library: 'custom',
    icon: ShapeIcons.Switch,
    svgGenerator: (p) => rectSVG(p),
    description: 'Network switch',
    tags: ['network', 'switch', 'networking', 'infrastructure'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 60 },
    minSize: { width: 70, height: 40 },
    maxSize: { width: 150, height: 100 },
  },
  {
    id: 'firewall',
    name: 'Firewall',
    type: 'firewall',
    category: 'network',
    library: 'custom',
    icon: ShapeIcons.Firewall,
    svgGenerator: (p) => rectSVG(p),
    description: 'Network firewall',
    tags: ['network', 'firewall', 'security', 'protection'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 60 },
    minSize: { width: 70, height: 40 },
    maxSize: { width: 150, height: 100 },
  },
];

// Combined Shape Libraries Configuration
export const SHAPE_LIBRARIES: ShapeLibraryConfig[] = [
  {
    name: 'Basic Shapes',
    version: '1.0.0',
    shapes: BASIC_SHAPES,
    categories: ['basic'],
    isEnabled: true,
    loadPriority: 1,
  },
  {
    name: 'Flowchart Shapes',
    version: '1.0.0',
    shapes: FLOWCHART_SHAPES,
    categories: ['flowchart'],
    isEnabled: true,
    loadPriority: 2,
  },
  {
    name: 'UML Shapes',
    version: '1.0.0',
    shapes: UML_SHAPES,
    categories: ['uml'],
    isEnabled: true,
    loadPriority: 3,
  },
  {
    name: 'Architecture Shapes',
    version: '1.0.0',
    shapes: ARCHITECTURE_SHAPES,
    categories: ['architecture'],
    isEnabled: true,
    loadPriority: 4,
  },
  {
    name: 'Network Shapes',
    version: '1.0.0',
    shapes: NETWORK_SHAPES,
    categories: ['network'],
    isEnabled: true,
    loadPriority: 5,
  },
  // Add advanced shape libraries
  ...ADVANCED_SHAPE_LIBRARIES,
];

// Category Display Names and Colors
export const SHAPE_CATEGORIES = {
  basic: {
    name: 'Basic Shapes',
    icon: '⬜',
    description: 'Fundamental geometric shapes',
    color: 'blue',
  },
  flowchart: {
    name: 'Flowchart',
    icon: '🔄',
    description: 'Process flow and decision shapes',
    color: 'green',
  },
  uml: {
    name: 'UML',
    icon: '📊',
    description: 'Unified Modeling Language shapes',
    color: 'purple',
  },
  architecture: {
    name: 'Architecture',
    icon: '🏗️',
    description: 'System architecture components',
    color: 'orange',
  },
  network: {
    name: 'Network',
    icon: '🌐',
    description: 'Network infrastructure shapes',
    color: 'cyan',
  },
  database: {
    name: 'Database',
    icon: '🗄️',
    description: 'Data storage and management',
    color: 'indigo',
  },
  business: {
    name: 'Business Process',
    icon: '💼',
    description: 'BPMN and business process shapes',
    color: 'emerald',
  },
  cloud: {
    name: 'Cloud Services',
    icon: '☁️',
    description: 'Cloud platform services (AWS, Azure, GCP)',
    color: 'sky',
  },
  kubernetes: {
    name: 'Kubernetes',
    icon: '⚙️',
    description: 'Container orchestration shapes',
    color: 'blue',
  },
  security: {
    name: 'Security',
    icon: '🔒',
    description: 'Security and protection components',
    color: 'red',
  },
  data: {
    name: 'Data Flow',
    icon: '📊',
    description: 'Data processing and flow shapes',
    color: 'violet',
  },
  application: {
    name: 'Applications',
    icon: '📱',
    description: 'Mobile and web application shapes',
    color: 'pink',
  },
  iot: {
    name: 'IoT',
    icon: '🔗',
    description: 'Internet of Things devices',
    color: 'teal',
  },
  custom: {
    name: 'Custom',
    icon: '🎨',
    description: 'User-defined custom shapes',
    color: 'gray',
  },
};

// Default search filters
export const DEFAULT_SEARCH_FILTERS: ShapeSearchFilters = {
  query: '',
  category: undefined,
  library: undefined,
  tags: [],
  isResizable: undefined,
  isRotatable: undefined,
};
