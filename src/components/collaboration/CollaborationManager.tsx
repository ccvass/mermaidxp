/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import WebSocketService from '../../services/webSocketService';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { logger } from '../../utils/logger';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isActive: boolean;
  lastSeen: number;
}

interface CollaborationState {
  sessionId: string;
  users: Record<string, CollaborationUser>;
  isHost: boolean;
  permissions: 'read' | 'edit' | 'admin';
}

interface CollaborationManagerProps {
  enabled?: boolean;
  sessionId?: string;
  userName?: string;
}

export const CollaborationManager: React.FC<CollaborationManagerProps> = ({
  enabled = false,
  sessionId,
  userName = 'Anonymous User',
}) => {
  const dispatch = useAppDispatch();
  const mermaidCode = useAppSelector((state) => state.diagram.mermaidCode);
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    sessionId: sessionId || '',
    users: {},
    isHost: false,
    permissions: 'edit',
  });
  const webSocketService = WebSocketService.getInstance();
  const [isConnected, _setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);

  // Generate user color
  const generateUserColor = useCallback(() => {
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16', // Lime
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Initialize collaboration session
  const initializeCollaboration = useCallback(async () => {
    if (!enabled || !sessionId) return;

    try {
      // Create current user
      const user: CollaborationUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: userName,
        color: generateUserColor(),
        isActive: true,
        lastSeen: Date.now(),
      };
      setCurrentUser(user);

      // Connect to WebSocket (disabled service; no options)
      await webSocketService.connect();
    } catch (error) {
      logger.error('Failed to initialize collaboration:', 'CollaborationManager', error instanceof Error ? error : undefined);
      dispatch(
        showNotification({
          type: 'error',
          message: 'Could not start collaboration session',
        })
      );
    }
  }, [enabled, sessionId, userName, generateUserColor, dispatch]);

  // Handle collaboration messages
  const handleCollaborationMessage = useCallback((message: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = message as { type: string; payload: any };
    switch (msg.type) {
      case 'collaboration_user_joined':
        handleUserJoined(msg.payload);
        break;
      case 'collaboration_user_left':
        handleUserLeft(msg.payload);
        break;
      case 'collaboration_code_change':
        handleCodeChange(msg.payload);
        break;
      case 'collaboration_cursor_move':
        handleCursorMove(msg.payload);
        break;
      case 'collaboration_selection_change':
        handleSelectionChange(msg.payload);
        break;
      case 'collaboration_session_state':
        handleSessionState(msg.payload);
        break;
      default:
    }
  }, []);
  // reference to avoid unused warning in disabled build
  void handleCollaborationMessage;

  // Handle user joined
  const handleUserJoined = useCallback(
    (payload: { user: CollaborationUser }) => {
      setCollaborationState((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          [payload.user.id]: payload.user,
        },
      }));

      dispatch(
        showNotification({
          type: 'info',
          message: `${payload.user.name} joined the session`,
        })
      );
    },
    [dispatch]
  );

  // Handle user left
  const handleUserLeft = useCallback(
    (payload: { userId: string }) => {
      setCollaborationState((prev) => {
        const newUsers = { ...prev.users };
        const user = newUsers[payload.userId];
        delete newUsers[payload.userId];

        if (user) {
          dispatch(
            showNotification({
              type: 'info',
              message: `${user.name} left the session`,
            })
          );
        }

        return {
          ...prev,
          users: newUsers,
        };
      });
    },
    [dispatch]
  );

  // Handle code changes from other users
  const handleCodeChange = useCallback(
    (payload: {
      userId: string;
      code: string;
      timestamp: number;
      operation: 'insert' | 'delete' | 'replace';
      position?: { start: number; end: number };
    }) => {
      // Only apply if it's from another user
      if (currentUser && payload.userId !== currentUser.id) {
        // Apply operational transformation to resolve conflicts
        const transformedCode = applyOperationalTransform(mermaidCode, payload);

        if (transformedCode !== mermaidCode) {
          dispatch(setMermaidCode(transformedCode));

          // Show subtle notification
          const user = collaborationState.users[payload.userId];
          if (user) {
            dispatch(
              showNotification({
                type: 'info',
                message: `${user.name} made changes`,
              })
            );
          }
        }
      }
    },
    [currentUser, mermaidCode, collaborationState.users, dispatch]
  );

  // Handle cursor movements
  const handleCursorMove = useCallback(
    (payload: { userId: string; cursor: { x: number; y: number } }) => {
      if (currentUser && payload.userId !== currentUser.id) {
        setCollaborationState((prev) => ({
          ...prev,
          users: {
            ...prev.users,
            [payload.userId]: {
              ...prev.users[payload.userId],
              cursor: payload.cursor,
              lastSeen: Date.now(),
            },
          },
        }));
      }
    },
    [currentUser]
  );

  // Handle selection changes
  const handleSelectionChange = useCallback(
    (payload: { userId: string; selection: { start: number; end: number } }) => {
      if (currentUser && payload.userId !== currentUser.id) {
        setCollaborationState((prev) => ({
          ...prev,
          users: {
            ...prev.users,
            [payload.userId]: {
              ...prev.users[payload.userId],
              selection: payload.selection,
              lastSeen: Date.now(),
            },
          },
        }));
      }
    },
    [currentUser]
  );

  // Handle session state updates
  const handleSessionState = useCallback(
    (payload: { sessionId: string; users: Record<string, CollaborationUser>; hostId: string }) => {
      setCollaborationState((prev) => ({
        ...prev,
        users: payload.users,
        isHost: currentUser?.id === payload.hostId,
      }));
    },
    [currentUser]
  );

  // Operational Transform for conflict resolution
  const applyOperationalTransform = useCallback(
    (
      currentCode: string,
      operation: {
        code: string;
        operation: 'insert' | 'delete' | 'replace';
        position?: { start: number; end: number };
      }
    ): string => {
      // Simple operational transform implementation
      // In production, use a more sophisticated OT library like ShareJS

      switch (operation.operation) {
        case 'replace':
          return operation.code;
        case 'insert':
          if (operation.position) {
            const { start } = operation.position;
            return currentCode.slice(0, start) + operation.code + currentCode.slice(start);
          }
          return operation.code;
        case 'delete':
          if (operation.position) {
            const { start, end } = operation.position;
            return currentCode.slice(0, start) + currentCode.slice(end);
          }
          return currentCode;
        default:
          return operation.code;
      }
    },
    []
  );

  // Send code changes to other users
  const broadcastCodeChange = useCallback(
    (_newCode: string) => {
      if (!isConnected || !currentUser) return;

      // Disabled: no-op send in this build
      webSocketService.send();
    },
    [isConnected, currentUser, collaborationState.sessionId]
  );

  // Send cursor position
  const broadcastCursorMove = useCallback(
    (_x: number, _y: number) => {
      if (!isConnected || !currentUser) return;

      // Disabled: no-op send in this build
      webSocketService.send();
    },
    [isConnected, currentUser, collaborationState.sessionId]
  );

  // Initialize collaboration when enabled
  useEffect(() => {
    if (enabled && sessionId) {
      initializeCollaboration();
    }

    return () => {
      if (isConnected && currentUser) {
        // Disabled: no-op send in this build
        webSocketService.send();
        webSocketService.disconnect();
      }
    };
  }, [enabled, sessionId, initializeCollaboration]);

  // Broadcast code changes
  useEffect(() => {
    if (enabled && isConnected) {
      const timeoutId = setTimeout(() => {
        broadcastCodeChange(mermaidCode);
      }, 500); // Debounce code changes

      return () => clearTimeout(timeoutId);
    }
  }, [mermaidCode, enabled, isConnected, broadcastCodeChange]);

  // Cleanup inactive users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveThreshold = 30000; // 30 seconds

      setCollaborationState((prev) => {
        const activeUsers = Object.fromEntries(
          Object.entries(prev.users).filter(([, user]) => now - user.lastSeen < inactiveThreshold)
        );

        return {
          ...prev,
          users: activeUsers,
        };
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []); //  //

  // Expose collaboration functions globally
  useEffect(() => {
    (window as any).collaboration = {
      broadcastCursorMove,
      getActiveUsers: () => Object.values(collaborationState.users),
      getCurrentUser: () => currentUser,
      isConnected,
      sessionId: collaborationState.sessionId,
    };

    return () => {
      delete (window as any).collaboration;
    };
  }, [broadcastCursorMove, collaborationState, currentUser, isConnected]);

  return null; // This component manages collaboration state, no UI
};

export default CollaborationManager;
