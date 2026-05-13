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

export interface DragHandler {
  element: HTMLElement | SVGElement;
  handler: (event: MouseEvent) => void;
  cleanup: () => void;
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
