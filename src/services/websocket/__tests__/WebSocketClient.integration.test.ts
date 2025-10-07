import WebSocketClient from '../WebSocketClient';

// Mock Socket.io client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}));

describe('WebSocketClient Integration', () => {
  let client: WebSocketClient;
  let mockSocket: any;

  beforeEach(() => {
    client = new WebSocketClient();
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
    };

    // Mock io to return our mock socket
    import { io } from 'socket.io-client';
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    client.disconnect();
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should connect to server successfully', async () => {
      const connectPromise = client.connect('http://localhost:3001');

      // Simulate successful connection
      const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')[1];
      connectHandler();

      await expect(connectPromise).resolves.toBeUndefined();
      expect(client.isConnected).toBe(true);
    });

    it('should handle connection errors', async () => {
      const connectPromise = client.connect('http://localhost:3001');

      // Simulate connection error
      const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect_error')[1];
      errorHandler(new Error('Connection failed'));

      await expect(connectPromise).rejects.toThrow('Connection failed');
    });

    it('should disconnect properly', () => {
      client.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Authentication', () => {
    beforeEach(async () => {
      const connectPromise = client.connect();
      const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should authenticate as guest user', async () => {
      const authPromise = client.authenticateAsGuest('TestUser');

      // Simulate successful authentication
      const authHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'authenticated')[1];
      authHandler({ user: { id: 'guest123', name: 'TestUser', role: 'guest' } });

      const user = await authPromise;
      expect(user.name).toBe('TestUser');
      expect(user.role).toBe('guest');
    });

    it('should handle authentication errors', async () => {
      const authPromise = client.authenticateAsGuest('TestUser');

      // Simulate authentication error
      const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'auth_error')[1];
      errorHandler({ message: 'Authentication failed' });

      await expect(authPromise).rejects.toThrow('Authentication failed');
    });
  });

  describe('Room Management', () => {
    beforeEach(async () => {
      // Setup connection and authentication
      const connectPromise = client.connect();
      const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;

      const authPromise = client.authenticateAsGuest('TestUser');
      const authHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'authenticated')[1];
      authHandler({ user: { id: 'guest123', name: 'TestUser', role: 'guest' } });
      await authPromise;
    });

    it('should join room successfully', async () => {
      const roomId = 'test-room-123';
      const joinPromise = client.joinRoom(roomId);

      // Simulate successful room join
      const roomStateHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'room_state')[1];
      roomStateHandler({
        id: roomId,
        users: [{ id: 'guest123', name: 'TestUser', role: 'guest' }],
        mermaidCode: 'graph TD\n    A --> B',
        canvasState: { zoom: 1, pan: { x: 0, y: 0 }, selectedNodes: [] },
      });

      const roomState = await joinPromise;
      expect(roomState.id).toBe(roomId);
      expect(roomState.users).toHaveLength(1);
    });

    it('should handle room join errors', async () => {
      const joinPromise = client.joinRoom('invalid-room');

      // Simulate room join error
      const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'error')[1];
      errorHandler({ message: 'Room not found' });

      await expect(joinPromise).rejects.toThrow('Room not found');
    });
  });

  describe('Real-time Communication', () => {
    beforeEach(async () => {
      // Full setup
      const connectPromise = client.connect();
      const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;

      const authPromise = client.authenticateAsGuest('TestUser');
      const authHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'authenticated')[1];
      authHandler({ user: { id: 'guest123', name: 'TestUser', role: 'guest' } });
      await authPromise;

      const joinPromise = client.joinRoom('test-room');
      const roomStateHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'room_state')[1];
      roomStateHandler({
        id: 'test-room',
        users: [{ id: 'guest123', name: 'TestUser', role: 'guest' }],
        mermaidCode: 'graph TD\n    A --> B',
        canvasState: { zoom: 1, pan: { x: 0, y: 0 }, selectedNodes: [] },
      });
      await joinPromise;
    });

    it('should send diagram updates', () => {
      client.sendDiagramUpdate('mermaid_code', { code: 'graph TD\n    A --> C' });

      expect(mockSocket.emit).toHaveBeenCalledWith('diagram_update', {
        type: 'mermaid_code',
        data: { code: 'graph TD\n    A --> C' },
        timestamp: expect.any(Number),
      });
    });

    it('should send cursor position', () => {
      client.sendCursorPosition(100, 200);

      expect(mockSocket.emit).toHaveBeenCalledWith('cursor_position', { x: 100, y: 200 });
    });

    it('should handle incoming diagram updates', () => {
      const updateCallback = jest.fn();
      client.onDiagramUpdated(updateCallback);

      // Simulate incoming update
      const updateHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'diagram_update')[1];
      const update = {
        userId: 'other-user',
        userName: 'Other User',
        data: { type: 'mermaid_code', code: 'graph TD\n    A --> D' },
        timestamp: Date.now(),
      };
      updateHandler(update);

      expect(updateCallback).toHaveBeenCalledWith(update);
    });
  });

  describe('Event Handling', () => {
    it('should handle user join events', () => {
      const joinCallback = jest.fn();
      client.onUserJoin(joinCallback);

      // Simulate user join
      const userJoinHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'user_joined')[1];
      const user = { id: 'user456', name: 'New User', role: 'editor' };
      userJoinHandler(user);

      expect(joinCallback).toHaveBeenCalledWith(user);
    });

    it('should handle user leave events', () => {
      const leaveCallback = jest.fn();
      client.onUserLeave(leaveCallback);

      // Simulate user leave
      const userLeaveHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'user_left')[1];
      const user = { id: 'user456', name: 'Leaving User', role: 'editor' };
      userLeaveHandler(user);

      expect(leaveCallback).toHaveBeenCalledWith(user);
    });

    it('should handle cursor position updates', () => {
      const cursorCallback = jest.fn();
      client.onCursorMoved(cursorCallback);

      // Simulate cursor update
      const cursorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'cursor_position')[1];
      const cursor = { userId: 'user456', userName: 'Other User', position: { x: 150, y: 250 } };
      cursorHandler(cursor);

      expect(cursorCallback).toHaveBeenCalledWith(cursor);
    });
  });
});
