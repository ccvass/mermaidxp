import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { Header } from '../Header';
import uiReducer from '../../../store/slices/uiSlice';
import diagramReducer from '../../../store/slices/diagramSlice';
import canvasReducer from '../../../store/slices/canvasSlice';
import historyEngineReducer from '../../../store/slices/historyEngineSlice';
import canvasElementsReducer from '../../../store/slices/canvasElementsSlice';

// Mock useAuth to avoid needing AuthProvider
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Mock child components that have complex dependencies
vi.mock('../../header/FileOperations', () => ({
  default: function MockFileOperations() {
    return <div data-testid="file-operations">FileOperations</div>;
  },
}));

vi.mock('../../auth/UserMenu', () => ({
  UserMenu: function MockUserMenu() {
    return <div data-testid="user-menu">UserMenu</div>;
  },
}));

vi.mock('../../auth/LoginModal', () => ({
  LoginModal: function MockLoginModal({ isOpen }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? <div data-testid="login-modal">LoginModal</div> : null;
  },
}));

// Helper to create a test store
const createTestStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      diagram: diagramReducer,
      canvas: canvasReducer,
      historyEngine: historyEngineReducer,
      canvasElements: canvasElementsReducer,
    },
    preloadedState: {
      ui: {
        notification: { message: '', type: 'info', visible: false },
        theme: 'light',
        isSidebarVisible: true,
        diagramMode: 'diagram',
        interactionMode: 'drag',
        ...initialState.ui,
      },
      diagram: {
        mermaidCode: 'graph TD\n  A --> B',
        renderResult: null,
        isLoading: false,
        error: null,
        history: ['graph TD\n  A --> B'],
        historyIndex: 0,
        sheets: [],
        activeSheetIndex: 0,
        ...initialState.diagram,
      },
      canvas: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        placingElement: null,
        selectedNodes: [],
        isDragging: false,
        interactionMode: 'pan',
        ...initialState.canvas,
      },
      historyEngine: {
        past: [],
        present: null,
        future: [],
        maxSize: 100,
        isRestoring: false,
        activeGroupId: null,
        featureEnabled: false,
        ...initialState.historyEngine,
      },
      canvasElements: {
        elements: {},
        selectedElementIds: [],
        clipboard: [],
        nextId: 1,
        ...initialState.canvasElements,
      },
    },
  });
};

// Helper to render Header with store
const renderWithStore = (props: any = {}, storeState: any = {}) => {
  const store = createTestStore(storeState);
  const defaultProps = {
    title: 'Mermaid Viewer',
  };

  const combinedProps = { ...defaultProps, ...props };

  return {
    store,
    ...render(
      <Provider store={store}>
        <Header {...combinedProps} />
      </Provider>
    ),
    ...combinedProps,
  };
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders header with title', () => {
      renderWithStore({ title: 'Test Title' });
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders main controls (sidebar, file ops, export, theme, sign in)', () => {
      renderWithStore();

      // Sidebar toggle
      expect(screen.getByTitle(/sidebar/i)).toBeInTheDocument();
      expect(screen.getByText('Mermaid Viewer')).toBeInTheDocument();

      // FileOperations component
      expect(screen.getByTestId('file-operations')).toBeInTheDocument();

      // Export button
      expect(screen.getByTitle('Export Diagram')).toBeInTheDocument();

      // Theme toggle
      expect(screen.getByTitle(/switch to/i)).toBeInTheDocument();

      // Sign In button (user is null)
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Sidebar Toggle', () => {
    it('shows correct title when sidebar is visible/hidden and toggles', async () => {
      const { store } = renderWithStore({}, { ui: { isSidebarVisible: true } });

      const hideBtn = screen.getByTitle('Hide Sidebar');
      expect(hideBtn).toBeInTheDocument();

      fireEvent.click(hideBtn);
      await waitFor(() => expect(store.getState().ui.isSidebarVisible).toBe(false));

      expect(screen.getByTitle('Show Sidebar')).toBeInTheDocument();
    });
  });

  describe('Export Menu', () => {
    it('opens export dropdown with format options', async () => {
      renderWithStore();

      const exportBtn = screen.getByTitle('Export Diagram');
      fireEvent.click(exportBtn);

      expect(await screen.findByText('📄 Export as SVG')).toBeInTheDocument();
      expect(screen.getByText('🖼️ Export as PNG')).toBeInTheDocument();
      expect(screen.getByText('📑 Export as PDF')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('shows correct title for light/dark and toggles', async () => {
      const { store } = renderWithStore({}, { ui: { theme: 'light' } });

      const lightBtn = screen.getByTitle('Switch to dark theme');
      expect(lightBtn.querySelector('svg')).toBeInTheDocument();
      fireEvent.click(lightBtn);

      await waitFor(() => expect(store.getState().ui.theme).toBe('dark'));
      expect(screen.getByTitle('Switch to light theme')).toBeInTheDocument();
    });
  });

  describe('Auth', () => {
    it('shows Sign In button when user is not authenticated', () => {
      renderWithStore();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('opens login modal when Sign In is clicked', () => {
      renderWithStore();

      expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Sign In'));
      expect(screen.getByTestId('login-modal')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA/roles', () => {
      renderWithStore();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('buttons have labels or titles', () => {
      renderWithStore();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const hasTitle = button.hasAttribute('title');
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTextContent = button.textContent?.trim();
        expect(hasTitle || hasAriaLabel || hasTextContent).toBeTruthy();
      });
    });
  });

  describe('Responsive & Styling', () => {
    it('has responsive classes', () => {
      renderWithStore();
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('px-4', 'py-3');
      expect(screen.getByText('Mermaid Viewer')).toHaveClass('text-xl');
    });

    it('applies dark mode classes', () => {
      renderWithStore({}, { ui: { theme: 'dark' } });
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('State Integration', () => {
    it('reflects current UI state for theme and sidebar', () => {
      renderWithStore({}, { ui: { theme: 'dark', isSidebarVisible: false } });
      expect(screen.getByTitle('Show Sidebar')).toBeInTheDocument();
      expect(screen.getByTitle('Switch to light theme')).toBeInTheDocument();
    });

    it('handles multiple state changes', async () => {
      const { store } = renderWithStore();
      fireEvent.click(screen.getByTitle(/sidebar/i));
      fireEvent.click(screen.getByTitle(/switch to/i));
      await waitFor(() => {
        const state = store.getState();
        expect(state.ui.isSidebarVisible).toBe(false);
        expect(state.ui.theme).toBe('dark');
      });
    });
  });
});
