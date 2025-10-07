// Enhanced Shape Library Types
export type ShapeCategory =
  | 'basic'
  | 'flowchart'
  | 'uml'
  | 'architecture'
  | 'network'
  | 'database'
  | 'custom'
  | 'business'
  | 'cloud'
  | 'kubernetes'
  | 'security'
  | 'data'
  | 'application'
  | 'iot';

export type ShapeLibrary = 'mermaid' | 'd3' | 'custom' | 'lucidchart' | 'aws' | 'azure' | 'gcp' | 'kubernetes' | 'bpmn';

export interface ShapeSVGParams {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ShapeDefinition {
  id: string;
  name: string;
  type: string;
  category: ShapeCategory;
  library: ShapeLibrary;
  icon: React.ComponentType;
  preview?: React.ComponentType;
  svgGenerator: (params: ShapeSVGParams) => string;
  description: string;
  tags: string[];
  isResizable: boolean;
  isRotatable: boolean;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  customProperties?: Record<string, any>;
}

export interface ShapeLibraryConfig {
  name: string;
  version: string;
  shapes: ShapeDefinition[];
  categories: ShapeCategory[];
  isEnabled: boolean;
  loadPriority: number;
}

export interface ShapeSearchFilters {
  query: string;
  category?: ShapeCategory;
  library?: ShapeLibrary;
  tags?: string[];
  isResizable?: boolean;
  isRotatable?: boolean;
}

export interface ShapePreviewProps {
  shape: ShapeDefinition;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  interactive?: boolean;
}

export interface ShapeLibraryState {
  libraries: ShapeLibraryConfig[];
  activeLibraries: ShapeLibrary[];
  searchFilters: ShapeSearchFilters;
  selectedCategory: ShapeCategory | 'all';
  isLoading: boolean;
  error: string | null;
}
