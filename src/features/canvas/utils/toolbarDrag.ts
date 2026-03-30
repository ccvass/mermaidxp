import { CanvasElement } from '../../../store/slices/canvasElementsSlice';
import { SVG_SHAPES_LIBRARY } from '../../../constants/svg-shapes.constants';
import { SVGShapeDefinition } from '../../../types/svg-shapes.types';

type Position = { x: number; y: number };

type PointerAnchor = {
  x: number;
  y: number;
};

let textMeasureCanvas: HTMLCanvasElement | null = null;

type TextDragPayload = {
  content: string;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  backgroundColor: string;
  padding: number;
  borderRadius: number;
};

type IconDragPayload = {
  icon: string;
  name?: string;
};

type ImageDragPayload = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};

type SvgShapeDragPayload = {
  shapeId: string;
};

export type ToolbarDragData =
  | { type: 'text'; payload: TextDragPayload; pointerAnchor?: PointerAnchor }
  | { type: 'icon'; payload: IconDragPayload; pointerAnchor?: PointerAnchor }
  | { type: 'image'; payload: ImageDragPayload; pointerAnchor?: PointerAnchor }
  | { type: 'svg-shape'; payload: SvgShapeDragPayload; pointerAnchor?: PointerAnchor };

export const CANVAS_DRAG_DATA_TYPE = 'application/x-mermaid-toolbar-element';

export function applyToolbarDragData(dataTransfer: DataTransfer | null, data: ToolbarDragData) {
  if (!dataTransfer) return;
  try {
    dataTransfer.effectAllowed = 'copy';
    dataTransfer.setData(CANVAS_DRAG_DATA_TYPE, JSON.stringify(data));
  } catch (error) {
    // Silently ignore failures (e.g. unsupported formats)
  }
}

export function hasToolbarDragData(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.types || []).includes(CANVAS_DRAG_DATA_TYPE);
}

export function extractToolbarDragData(dataTransfer: DataTransfer | null): ToolbarDragData | null {
  if (!dataTransfer) return null;
  try {
    const raw = dataTransfer.getData(CANVAS_DRAG_DATA_TYPE);
    if (!raw) return null;
    return JSON.parse(raw) as ToolbarDragData;
  } catch (error) {
    return null;
  }
}

interface ExtendedSvgShapeDefinition extends SVGShapeDefinition {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  path?: string;
}

function resolveSvgShape(shapeId: string): ExtendedSvgShapeDefinition | null {
  const shape = SVG_SHAPES_LIBRARY.find((item) => item.id === shapeId);
  if (!shape) return null;
  return shape as ExtendedSvgShapeDefinition;
}

export function buildElementFromToolbarDrag(
  data: ToolbarDragData,
  position: Position
): Omit<CanvasElement, 'id' | 'metadata'> | null {
  const createFontString = (payload: TextDragPayload) => {
    const weight = payload.fontWeight === 'bold' ? 'bold ' : '';
    const style = payload.fontStyle === 'italic' ? 'italic ' : '';
    return `${style}${weight}${payload.fontSize}px Arial, sans-serif`;
  };

  const measureTextWidth = (payload: TextDragPayload) => {
    if (typeof document !== 'undefined') {
      try {
        if (!textMeasureCanvas) {
          textMeasureCanvas = document.createElement('canvas');
        }
        const canvas = textMeasureCanvas;
        const context = canvas.getContext('2d');
        if (context) {
          context.font = createFontString(payload);
          return context.measureText(payload.content || '').width;
        }
      } catch (error) {
      }
    }
    return Math.max(payload.content.length, 1) * payload.fontSize * 0.6;
  };

  switch (data.type) {
    case 'text': {
      const { payload } = data;
      const baseWidth = measureTextWidth(payload);
      const width = baseWidth + payload.padding * 2;
      const height = payload.fontSize + payload.padding * 2;
      return {
        type: 'text',
        position,
        size: { width, height },
        content: payload.content,
        style: {
          fontSize: payload.fontSize,
          color: payload.color,
          fontFamily: 'Arial, sans-serif',
          fontWeight: payload.fontWeight,
          fontStyle: payload.fontStyle,
          textDecoration: payload.textDecoration,
          backgroundColor: payload.backgroundColor,
          borderRadius: payload.borderRadius,
          padding: payload.padding,
        },
      };
    }

    case 'icon': {
      const { payload } = data;
      return {
        type: 'icon',
        position,
        size: { width: 40, height: 40 },
        content: payload.icon,
      };
    }

    case 'image': {
      const { payload } = data;
      const width = payload.width ?? 100;
      const height = payload.height ?? 100;

      return {
        type: 'image',
        position,
        size: { width, height },
        imageUrl: payload.url,
        content: payload.altText || 'Image',
        style: {
          backgroundColor: '#ffffff',
        },
      };
    }

    case 'svg-shape': {
      const shape = resolveSvgShape(data.payload.shapeId);
      if (!shape) return null;

      const width = shape.width ?? shape.defaultSize.width ?? 100;
      const height = shape.height ?? shape.defaultSize.height ?? 60;

      return {
        type: 'svg-shape',
        position,
        size: { width, height },
        content: shape.name,
        shapeData: {
          shapeId: shape.id,
          shapeName: shape.name,
          svgPath: shape.path ?? '',
        },
        style: {
          backgroundColor: 'none',
          color: '#111827',
        },
      };
    }

    default:
      return null;
  }
}

export function describeToolbarDrag(data: ToolbarDragData): string {
  switch (data.type) {
    case 'text':
      return 'text element';
    case 'icon':
      return data.payload.name ? `${data.payload.name} icon` : 'icon';
    case 'image':
      return 'image';
    case 'svg-shape':
      return 'shape';
    default:
      return 'element';
  }
}
