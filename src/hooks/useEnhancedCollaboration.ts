/**
 * useEnhancedCollaboration - COMPLETELY DISABLED
 * Prevents all collaboration functionality and errors
 */

export const useEnhancedCollaboration = () => {
  return {
    isConnected: false,
    users: [],
    cursors: [],
    messages: [],
    connect: () => Promise.resolve(),
    disconnect: () => {},
    sendMessage: () => {},
    sendCursor: () => {},
    joinRoom: () => {},
    leaveRoom: () => {},
  };
};

export default useEnhancedCollaboration;
