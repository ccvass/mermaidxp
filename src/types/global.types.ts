// Global type definitions for the Mermaid Pro Viewer application

// Window object extensions
declare global {
  interface Window {
    renderMermaidFromExternal?: (code: string) => void;
  }
}

// Theme type definition (compatible with string literals)
export type Theme = 'light' | 'dark';

// Export state type for the export functionality
export interface ExportState {
  isExporting: boolean;
  format: 'png' | 'svg' | 'pdf' | 'jpeg';
  quality: number;
  scale: number;
  background: boolean;
  lastExport?: {
    timestamp: number;
    format: string;
    size: number;
  };
}

// Undo/Redo functionality types
export interface HistoryState<T = any> {
  past: T[];
  present: T;
  future: T[];
  maxHistorySize: number;
}

export interface UndoRedoActions {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (state: unknown) => void;
  clearHistory: () => void;
}

// Accessibility types
export interface AccessibilityFeatures {
  announcements: string[];
  focusManagement: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  interactionLatency: number;
  lastMeasurement: number;
}

// Error boundary types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  timestamp?: number;
}

// File handling types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content: string;
}

export interface FileOperations {
  open: (file: File) => Promise<FileInfo>;
  save: (content: string, filename: string) => void;
  export: (format: string, options?: Record<string, unknown>) => Promise<Blob>;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Collaboration types (for future implementation)
export interface CollaborationState {
  isConnected: boolean;
  users: Array<{
    id: string;
    name: string;
    cursor?: { x: number; y: number };
    selection?: string;
  }>;
  changes: Array<{
    id: string;
    userId: string;
    timestamp: number;
    type: 'edit' | 'move' | 'delete';
    data: unknown;
  }>;
}

// Plugin system types (for future implementation)
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  hooks: {
    beforeRender?: (code: string) => string;
    afterRender?: (svg: string) => string;
    onError?: (error: Error) => void;
  };
}

export interface PluginManager {
  plugins: Plugin[];
  install: (plugin: Plugin) => void;
  uninstall: (pluginId: string) => void;
  enable: (pluginId: string) => void;
  disable: (pluginId: string) => void;
}

// Custom hook return types
export interface UseDragAndDropReturn {
  isDragging: boolean;
  dragRef: React.RefObject<HTMLElement>;
  dropRef: React.RefObject<HTMLElement>;
  draggedItem: unknown;
  handleDragStart: (item: unknown) => void;
  handleDragEnd: () => void;
  handleDrop: (targetId: string) => void;
}

export interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  hasValue: boolean;
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  modifiers: Array<'ctrl' | 'alt' | 'shift' | 'meta'>;
  action: string;
  description: string;
  handler: () => void;
}

export interface KeyboardShortcuts {
  shortcuts: KeyboardShortcut[];
  register: (shortcut: KeyboardShortcut) => void;
  unregister: (key: string) => void;
  enable: () => void;
  disable: () => void;
}

// Export the global types
export {};
