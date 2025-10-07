// Drag and Drop specific types to replace 'any' usage

export interface Point {
  x: number;
  y: number;
}

export interface DragInfo {
  draggedElementId: string;
  startPosition: Point;
  currentPosition: Point;
  elementType: 'node' | 'edge' | 'shape' | 'text' | 'image' | 'icon';
  originalTransform?: string;
  isDragging: boolean;
}

export interface EdgeInfo {
  id: string;
  connectedNodeIds: string[];
  pathData: string;
  element: SVGPathElement;
}

export interface DragHandler {
  element: HTMLElement | SVGElement;
  handler: (event: MouseEvent) => void;
  cleanup: () => void;
}

export interface ElementPlacementInfo {
  type: 'icon' | 'text' | 'image' | 'shape' | 'enhanced-shape';
  data: {
    icon?: string;
    text?: string;
    textStyle?: TextStyle;
    imageUrl?: string;
    shapeDefinition?: ShapeDefinition;
    [key: string]: unknown;
  };
  position: Point;
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}

export interface ShapeDefinition {
  id: string;
  name: string;
  category: string;
  svgPath: string;
  defaultSize: {
    width: number;
    height: number;
  };
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface CanvasTransform {
  zoom: number;
  pan: Point;
  bounds: {
    width: number;
    height: number;
  };
}

export interface DragAndDropHookReturn {
  activeDragInfo: DragInfo | null;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUpOrLeave: (e: React.MouseEvent) => void;
  markDraggableElements: () => void;
}
