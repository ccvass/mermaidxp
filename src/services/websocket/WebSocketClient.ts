/**
 * WebSocket Client - DISABLED
 * Prevents connection loops and popup spam
 */

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
}

export class WebSocketClient {
  constructor() {
    // Disabled - no initialization
  }

  async connect(): Promise<void> {
    // Disabled to prevent loops
    return Promise.resolve();
  }

  disconnect(): void {
    // No-op
  }

  send(): void {
    // No-op - silently ignore
  }

  on(): void {
    // No-op
  }

  off(): void {
    // No-op
  }

  get isConnected(): boolean {
    return false; // Always disconnected
  }
}

export default WebSocketClient;
