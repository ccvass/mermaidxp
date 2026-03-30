// API Endpoints
export const SAVE_DIAGRAM_ENDPOINT = import.meta.env.VITE_SAVE_DIAGRAM_ENDPOINT || '/api/diagrams/save';

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Export formats configuration
export const EXPORT_CONFIG = {
  SVG: {
    extension: '.svg',
    mimeType: 'image/svg+xml',
    quality: 1,
  },
  PNG: {
    extension: '.png',
    mimeType: 'image/png',
    quality: 0.95,
    scale: 2, // 2x resolution for better quality
  },
  PDF: {
    extension: '.pdf',
    mimeType: 'application/pdf',
    orientation: 'landscape',
    format: 'a4',
  },
};

// File upload configuration
export const FILE_CONFIG = {
  ALLOWED_EXTENSIONS: ['.mmd', '.md', '.txt', '.mermaid'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ENCODING: 'utf-8',
};

// Web Service Configuration
export const WEB_SERVICE_CONFIG = {
  BASE_URL: import.meta.env.VITE_WEB_SERVICE_URL || (import.meta.env.DEV ? 'http://localhost:3001' : ''),
  ENDPOINTS: {
    HEALTH: '/health',
    RECEIVE: '/api/diagram/receive',
    SEND: '/api/diagram/send',
    EXPORT: '/api/diagram/export',
    BATCH_EXPORT: '/api/diagram/batch-export',
  },
  REAL_TIME: {
    WEBSOCKET_URL: '', // Disabled to prevent connection loops
    MAX_RECONNECT_ATTEMPTS: 0,
    RECONNECT_INTERVAL: 0,
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
  },
  AUTO_SAVE: {
    ENABLED: true,
    INTERVAL: 30000, // 30 seconds
    MIN_CHANGES: 5, // Minimum characters changed before auto-save
  },
  EXPORT: {
    DEFAULT_QUALITY: 'high',
    DEFAULT_WIDTH: 1920,
    DEFAULT_HEIGHT: 1080,
    DEFAULT_BACKGROUND: 'white',
    SUPPORTED_FORMATS: ['pdf', 'png', 'svg'] as const,
  },
};
