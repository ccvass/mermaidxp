import { Middleware } from '@reduxjs/toolkit';
import { setMermaidCode } from '../slices/diagramSlice';
import { setZoom, setPan } from '../slices/canvasSlice';

// Global WebSocket client reference
let wsClient: unknown = null;

export const setWebSocketClient = (client: unknown) => {
  wsClient = client;
};

export const collaborationMiddleware: Middleware = () => (next) => (action: unknown) => {
  const result = next(action);

  // Only broadcast if WebSocket is connected and we have a room
  const ws = wsClient as Record<string, unknown> | null;
  if (!ws || !ws.isConnected || !ws.currentRoomId) {
    return result;
  }

  const act = action as { type: string; payload: unknown };
  // Broadcast diagram code changes
  if (act.type === setMermaidCode.type) {
    (ws.sendDiagramUpdate as (t: string, d: unknown) => void)('mermaid_code', {
      type: 'mermaid_code',
      code: act.payload,
    });
  }

  // Broadcast canvas state changes
  if (act.type === setZoom.type) {
    (ws.sendDiagramUpdate as (t: string, d: unknown) => void)('canvas_state', {
      type: 'canvas_state',
      state: { zoom: act.payload },
    });
  }

  if (act.type === setPan.type) {
    (ws.sendDiagramUpdate as (t: string, d: unknown) => void)('canvas_state', {
      type: 'canvas_state',
      state: { pan: act.payload },
    });
  }

  return result;
};

export default collaborationMiddleware;
