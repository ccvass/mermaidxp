export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

export interface SaveDiagramRequest {
  mermaidCode: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface SaveDiagramResponse {
  id: string;
  success: boolean;
  message?: string;
  url?: string;
}

export interface JsPDFInstance {
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => void;
  save: (filename: string) => void;
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf';
  background?: 'white' | 'transparent';
  scale?: number;
  filename?: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'diagram_update' | 'diagram_receive' | 'export_complete' | 'error' | 'heartbeat';
  payload: any;
  timestamp: string;
  id?: string;
}

// Web Service Types
export interface DiagramReceivePayload {
  code: string;
  metadata?: {
    title?: string;
    description?: string;
    source?: string;
    timestamp?: number;
  };
}

export interface DiagramSendPayload {
  code: string;
  metadata?: {
    title?: string;
    description?: string;
    lastModified?: number;
  };
  exportFormats?: ('pdf' | 'png' | 'svg')[];
}

export interface WebServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface ExportResult {
  format: 'pdf' | 'png' | 'svg';
  data: string; // Base64 encoded
  filename: string;
  size: number;
}

// Connection Status
export interface ConnectionStatus {
  connected: boolean;
  url: string;
  lastConnected?: number;
  reconnectAttempts?: number;
}
