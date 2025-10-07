// SVG Shapes - Independent graphic elements (not Mermaid nodes)
export type SVGShapeType =
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'hexagon'
  | 'arrow'
  | 'line'
  | 'polyline'
  | 'polygon';

export type SVGShapeCategory = 'basic' | 'geometric' | 'arrows' | 'decorative' | 'custom';

export interface SVGShapeDefinition {
  id: string;
  name: string;
  type: SVGShapeType;
  category: SVGShapeCategory;
  icon: React.ComponentType;
  description: string;
  tags: string[];
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  isResizable: boolean;
  isRotatable: boolean;
  defaultStyle: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
  // Function to generate the actual SVG element
  generateSVG: (props: SVGShapeProps) => string;
}

export interface SVGShapeProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
}

export interface PlacedSVGShape {
  id: string;
  shapeDefinition: SVGShapeDefinition;
  props: SVGShapeProps;
  isSelected: boolean;
  createdAt: Date;
}

export interface SVGShapeLibraryState {
  availableShapes: SVGShapeDefinition[];
  placedShapes: PlacedSVGShape[];
  selectedShapeId: string | null;
  isLoading: boolean;
  error: string | null;
}
