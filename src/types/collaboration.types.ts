/**
 * Type definitions for collaboration features
 */

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastActivity: Date;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface CollaborationSession {
  id: string;
  roomId: string;
  users: CollaborationUser[];
  createdAt: Date;
  isActive: boolean;
}

export interface CollaborationMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'notification';
}

export interface CollaborationState {
  session: CollaborationSession | null;
  currentUser: CollaborationUser | null;
  users: CollaborationUser[];
  messages: CollaborationMessage[];
  isConnected: boolean;
  isEnabled: boolean;
  connectionError: string | null;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface DiagramChange {
  type: 'update' | 'add' | 'remove';
  elementId?: string;
  data: unknown;
  userId: string;
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'cursor' | 'change' | 'chat' | 'user-joined' | 'user-left' | 'sync';
  payload: CursorPosition | DiagramChange | CollaborationMessage | CollaborationUser | unknown;
  userId: string;
  timestamp: number;
}
