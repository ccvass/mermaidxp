// Canvas specific types to replace 'any' usage

export interface CanvasDebugInfo {
  zoom: number;
  pan: { x: number; y: number };
  elementCount: number;
  svgDimensions: {
    width: number;
    height: number;
  };
  transformMatrix: string;
  timestamp: number;
}

export interface CanvasSpaceInfo {
  totalElements: number;
  elementTypes: Record<string, number>;
  canvasBounds: {
    width: number;
    height: number;
  };
  usedSpace: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  freeSpace: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TransformState {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

export interface ViewportBounds {
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface DiagramBounds {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  element: SVGElement;
}
