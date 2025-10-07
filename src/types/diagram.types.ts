import { ShapeDefinition } from './shapes.types';
import { SVGShapeDefinition } from './svg-shapes.types';

export type InteractionMode = 'drag' | 'pan';

export interface MermaidRenderResult {
  svg: string;
  error?: Error | string | null;
  bindFunctions?: (element: Element) => void;
}

export interface MermaidConfig {
  startOnLoad: boolean;
  theme: string;
  securityLevel: string;
  logLevel: string;
  flowchart: {
    htmlLabels: boolean;
    useMaxWidth: boolean;
  };
}

export interface DiagramState {
  mermaidCode: string;
  renderResult: MermaidRenderResult | null;
  isLoading: boolean;
  error: string | null;
  history: string[];
  historyIndex: number;
}

export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  placingElement: PlacingElementInfo | null;
  selectedNodes: string[];
  isDragging: boolean;
  interactionMode: InteractionMode;
}

export interface PlacingElementInfo {
  type: 'shape' | 'svg-shape' | 'image' | 'text' | 'icon' | null;
  shapeDefinition?: ShapeDefinition;
  svgShapeDefinition?: SVGShapeDefinition;
  iconContent?: string; // For selected icon from panel
  imageData?: { url: string; alt: string }; // For selected image from panel (legacy)
  imageDefinition?: { url: string; altText: string; width: number; height: number }; // For enhanced image panel
  textDefinition?: {
    content: string;
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline';
    backgroundColor: string;
    padding: number;
    borderRadius: number;
  }; // For enhanced text panel
}

export interface EdgeInfo {
  pathEl: SVGPathElement;
  originalD: string;
  connectedNodeIds: string[];
}

export interface DragInfo {
  element: SVGGraphicsElement;
  draggedElementId: string;
  isCluster: boolean;
  allMovedNodeIds: string[];
  initialSvgTransform: { x: number; y: number };
  initialMousePos: { x: number; y: number };
}
