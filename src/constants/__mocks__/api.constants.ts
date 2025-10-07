// Mock API Endpoints
export const SAVE_DIAGRAM_ENDPOINT = '/api/diagrams/save';

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
