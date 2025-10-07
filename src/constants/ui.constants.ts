export const APP_TITLE = 'Mermaid Visualizer Pro';

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 400,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 3,
  ZOOM_STEP: 0.1,
  PAN_SPEED: 1,
  DEBOUNCE_DELAY: 300,
  NOTIFICATION_DURATION: 3000,
  ANIMATION_DURATION: 200,
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_SIDEBAR: 'ctrl+b',
  SAVE: 'ctrl+s',
  EXPORT_SVG: 'ctrl+shift+s',
  ZOOM_IN: 'ctrl+=',
  ZOOM_OUT: 'ctrl+-',
  ZOOM_RESET: 'ctrl+0',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+shift+z',
};

export const THEME_COLORS = {
  light: {
    background: '#f8fafc',
    foreground: '#0f172a',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f8fafc',
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    error: '#f87171',
    warning: '#fbbf24',
    success: '#34d399',
  },
};
