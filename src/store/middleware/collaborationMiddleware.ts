import { Middleware } from '@reduxjs/toolkit';
import { setMermaidCode } from '../slices/diagramSlice';
import { setZoom, setPan } from '../slices/canvasSlice';

// Global WebSocket client reference
let wsClient: any = null;

export const setWebSocketClient = (client: any) => {
  wsClient = client;
};

export const collaborationMiddleware: Middleware = () => (next) => (action: any) => {
  const result = next(action);

  // Only broadcast if WebSocket is connected and we have a room
  if (!wsClient || !wsClient.isConnected || !wsClient.currentRoomId) {
    return result;
  }

  // Broadcast diagram code changes
  if (action.type === setMermaidCode.type) {
    wsClient.sendDiagramUpdate('mermaid_code', {
      type: 'mermaid_code',
      code: action.payload,
    });
  }

  // Broadcast canvas state changes
  if (action.type === setZoom.type) {
    wsClient.sendDiagramUpdate('canvas_state', {
      type: 'canvas_state',
      state: { zoom: action.payload },
    });
  }

  if (action.type === setPan.type) {
    wsClient.sendDiagramUpdate('canvas_state', {
      type: 'canvas_state',
      state: { pan: action.payload },
    });
  }

  return result;
};

export default collaborationMiddleware;
