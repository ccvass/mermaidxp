/**
 * useCollaboration Hook - DISABLED
 * Prevents WebSocket connection attempts
 */

export const useCollaboration = () => {
  return {
    isConnected: false,
    users: [],
    connect: () => Promise.resolve(),
    disconnect: () => {},
    sendMessage: () => {},
    joinRoom: () => {},
    leaveRoom: () => {},
  };
};

export default useCollaboration;
