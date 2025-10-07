import reducer, {
  showNotification,
  hideNotification,
  toggleTheme,
  toggleSidebar,
  setDiagramMode,
  setInteractionMode,
} from './uiSlice';
import { DiagramMode, InteractionMode } from '../../types/ui.types';

describe('uiSlice', () => {
  type NotificationStateTest = { message: string; type: 'success' | 'error' | 'info'; visible: boolean };
  type UiStateTest = {
    notification: NotificationStateTest;
    theme: 'light' | 'dark';
    isSidebarVisible: boolean;
    diagramMode: DiagramMode;
    interactionMode: InteractionMode;
  };

  const initialState: UiStateTest = {
    notification: {
      message: '',
      type: 'info',
      visible: false,
    },
    theme: 'light',
    isSidebarVisible: true,
    diagramMode: DiagramMode.Diagram,
    interactionMode: InteractionMode.Drag,
  };

  describe('notification actions', () => {
    it('should handle showNotification with success type', () => {
      const state = reducer(initialState, showNotification({ message: 'Success message', type: 'success' }));

      expect(state.notification).toEqual({
        message: 'Success message',
        type: 'success',
        visible: true,
      });
    });

    it('should handle showNotification with error type', () => {
      const state = reducer(initialState, showNotification({ message: 'Error message', type: 'error' }));

      expect(state.notification).toEqual({
        message: 'Error message',
        type: 'error',
        visible: true,
      });
    });

    it('should handle showNotification with info type', () => {
      const state = reducer(initialState, showNotification({ message: 'Info message', type: 'info' }));

      expect(state.notification).toEqual({
        message: 'Info message',
        type: 'info',
        visible: true,
      });
    });

    it('should handle hideNotification', () => {
      const stateWithNotification = {
        ...initialState,
        notification: {
          message: 'Test message',
          type: 'success' as const,
          visible: true,
        },
      };

      const state = reducer(stateWithNotification, hideNotification());

      expect(state.notification.visible).toBe(false);
      // Message and type should remain unchanged
      expect(state.notification.message).toBe('Test message');
      expect(state.notification.type).toBe('success');
    });
  });

  describe('theme actions', () => {
    it('should toggle from light to dark theme', () => {
      const state = reducer(initialState, toggleTheme());
      expect(state.theme).toBe('dark');
    });

    it('should toggle from dark to light theme', () => {
      const darkState = { ...initialState, theme: 'dark' as const };
      const state = reducer(darkState, toggleTheme());
      expect(state.theme).toBe('light');
    });
  });

  describe('sidebar actions', () => {
    it('should toggle sidebar from visible to hidden', () => {
      const state = reducer(initialState, toggleSidebar());
      expect(state.isSidebarVisible).toBe(false);
    });

    it('should toggle sidebar from hidden to visible', () => {
      const hiddenState = { ...initialState, isSidebarVisible: false };
      const state = reducer(hiddenState, toggleSidebar());
      expect(state.isSidebarVisible).toBe(true);
    });
  });

  describe('diagram mode actions', () => {
    it('should set diagram mode to Diagram', () => {
      const state = reducer(initialState, setDiagramMode(DiagramMode.Diagram));
      expect(state.diagramMode).toBe(DiagramMode.Diagram);
    });

    it('should set diagram mode to Whiteboard', () => {
      const state = reducer(initialState, setDiagramMode(DiagramMode.Whiteboard));
      expect(state.diagramMode).toBe(DiagramMode.Whiteboard);
    });
  });

  describe('interaction mode actions', () => {
    it('should set interaction mode to Drag', () => {
      const state = reducer(initialState, setInteractionMode(InteractionMode.Drag));
      expect(state.interactionMode).toBe(InteractionMode.Drag);
    });

    it('should set interaction mode to Pan', () => {
      const state = reducer(initialState, setInteractionMode(InteractionMode.Pan));
      expect(state.interactionMode).toBe(InteractionMode.Pan);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple state changes correctly', () => {
      let state = initialState;

      // Show a notification
      state = reducer(state, showNotification({ message: 'Diagram saved', type: 'success' }));

      // Toggle theme
      state = reducer(state, toggleTheme());

      // Hide sidebar
      state = reducer(state, toggleSidebar());

      // Change interaction mode
      state = reducer(state, setInteractionMode(InteractionMode.Pan));

      // Verify final state
      expect(state).toEqual({
        notification: {
          message: 'Diagram saved',
          type: 'success',
          visible: true,
        },
        theme: 'dark',
        isSidebarVisible: false,
        diagramMode: DiagramMode.Diagram,
        interactionMode: InteractionMode.Pan,
      });
    });

    it('should maintain other state properties when updating one', () => {
      const customInitialState = {
        notification: {
          message: 'Test',
          type: 'error' as const,
          visible: true,
        },
        theme: 'dark' as const,
        isSidebarVisible: false,
        diagramMode: DiagramMode.Whiteboard,
        interactionMode: InteractionMode.Pan,
      };

      const state = reducer(customInitialState, toggleTheme());

      // Only theme should change
      expect(state.theme).toBe('light');
      expect(state.notification).toEqual(customInitialState.notification);
      expect(state.isSidebarVisible).toBe(customInitialState.isSidebarVisible);
      expect(state.diagramMode).toBe(customInitialState.diagramMode);
      expect(state.interactionMode).toBe(customInitialState.interactionMode);
    });
  });
});
