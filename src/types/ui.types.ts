export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum DiagramMode {
  Diagram = 'diagram',
  Whiteboard = 'whiteboard',
}

export enum InteractionMode {
  Drag = 'drag',
  Pan = 'pan',
}

export interface IconProps {
  className?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  theme: Theme;
  diagramMode: DiagramMode;
  interactionMode: InteractionMode;
  isSidebarVisible: boolean;
  notifications: Notification[];
  activeModal: string | null;
}
