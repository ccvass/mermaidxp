/**
 * WebSocket Service - DISABLED
 * Prevents connection loops and application freezing
 */

export class WebSocketService {
  static instance: WebSocketService | null = null;

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): Promise<void> {
    // Disabled - no connection attempts
    return Promise.resolve();
  }

  disconnect(): void {
    // No-op
  }

  send(): void {
    // No-op
  }

  on(): void {
    // No-op
  }

  off(): void {
    // No-op
  }

  get isConnected(): boolean {
    return false;
  }
}

export default WebSocketService;
