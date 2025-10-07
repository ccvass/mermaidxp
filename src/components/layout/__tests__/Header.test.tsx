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
    jest.clearAllMocks();

    // Ensure a clean DOM canvas between tests
    document.querySelectorAll('#mermaid-container').forEach((el) => el.remove());

    // Ensure fullscreen APIs exist and start from non-fullscreen state
    try {
      Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true, writable: true } as any);
    } catch {
      // ignore if not configurable in this environment
    }

    (document.documentElement as any).requestFullscreen = jest.fn().mockImplementation(() => {
      try {
        Object.defineProperty(document, 'fullscreenElement', {
          value: document.documentElement,
          configurable: true,
          writable: true,
        } as any);
      } catch (e) {
        // noop to support environments where it's not configurable
        void e;
      }
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    });

    (document as any).exitFullscreen = jest.fn().mockImplementation(() => {
      try {
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          configurable: true,
          writable: true,
        } as any);
      } catch (e) {
        // noop to support environments where it's not configurable
        void e;
      }
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    });
  });

  describe('Basic Rendering', () => {
    it('renders header with title', () => {
      renderWithStore({ title: 'Test Title' });
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders main controls (file, view, undo/redo, theme, sidebar)', () => {
      renderWithStore();

      // Left: sidebar toggle and title
      expect(screen.getByTitle(/sidebar/i)).toBeInTheDocument();
      expect(screen.getByText('Mermaid Viewer')).toBeInTheDocument();

      // File operations
      expect(screen.getByTitle('New Document (Ctrl+N)')).toBeInTheDocument();
      expect(screen.getByTitle('Open File (Ctrl+O)')).toBeInTheDocument();
      expect(screen.getByTitle('Save As (Ctrl+S)')).toBeInTheDocument();
      expect(screen.getByTitle('Import from URL')).toBeInTheDocument();

      // View controls
      expect(screen.getByTitle('Reset View (Ctrl+0)')).toBeInTheDocument();
      expect(screen.getByTitle('Fit to Screen')).toBeInTheDocument();
      expect(screen.getByTitle('Grid Options')).toBeInTheDocument();
      expect(screen.getByTitle('Enter Fullscreen (F11)')).toBeInTheDocument();
      expect(screen.getByTitle('Presentation Mode')).toBeInTheDocument();
      expect(screen.getByTitle('Toggle Minimap')).toBeInTheDocument();

      // Undo/Redo
      expect(screen.getByTitle('Undo')).toBeInTheDocument();
      expect(screen.getByTitle('Redo')).toBeInTheDocument();

      // Theme toggle
      expect(screen.getByTitle(/switch to/i)).toBeInTheDocument();
    });
  });

  describe('Sidebar Toggle', () => {
    it('shows correct icon when sidebar is visible/hidden and toggles', async () => {
      const { store } = renderWithStore({}, { ui: { isSidebarVisible: true } });

      const hideBtn = screen.getByTitle('Hide Sidebar');
      expect(hideBtn.querySelector('svg')).toBeInTheDocument();

      fireEvent.click(hideBtn);
      await waitFor(() => expect(store.getState().ui.isSidebarVisible).toBe(false));

      const showBtn = screen.getByTitle('Show Sidebar');
      expect(showBtn.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Undo/Redo Buttons', () => {
    it('are disabled when no history is available', () => {
      renderWithStore();
      expect(screen.getByTitle('Undo')).toBeDisabled();
      expect(screen.getByTitle('Redo')).toBeDisabled();
    });
  });

  describe('File Operations', () => {
    it('opens a file and updates diagram code', async () => {
      const { store } = renderWithStore();

      const openButton = screen.getByTitle('Open File (Ctrl+O)');

      const mockFile = new File(['graph TD\n  X --> Y'], 'test.mmd', { type: 'text/plain' });

      const mockFileReader: any = {
        readAsText: jest.fn(function (this: any) {
          // simulate async
          setTimeout(() => {
            if (this.onload) this.onload({ target: { result: 'graph TD\n  X --> Y' } });
          }, 0);
        }),
        onload: null,
      };
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => mockFileReader);

      fireEvent.click(openButton);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
      expect(fileInput).toBeInTheDocument();
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', { value: [mockFile] });
        fireEvent.change(fileInput);
      }

      await waitFor(() => expect(store.getState().diagram.mermaidCode).toContain('X --> Y'));
    });

    it('shows Save As dropdown with export options and triggers download', async () => {
      renderWithStore();

      const saveAsBtn = screen.getByTitle('Save As (Ctrl+S)');

      // Ensure URL.createObjectURL and revokeObjectURL exist in JSDOM
      const originalURL = window.URL;
      const createObjectURL = jest.fn(() => 'blob:mock');
      const revokeObjectURL = jest.fn();
      Object.defineProperty(window, 'URL', {
        value: { ...originalURL, createObjectURL, revokeObjectURL },
        configurable: true,
        writable: true,
      });

      // We don't intercept createElement to avoid breaking DOM. Instead, spy on click after rendering.
      fireEvent.click(saveAsBtn);
      const txtOption = await screen.findByText('Text (.txt)');

      // Spy after dropdown is visible to capture the created anchor later
      const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      fireEvent.click(txtOption);

      await waitFor(() => expect(clickSpy).toHaveBeenCalled());

      // Restore
      clickSpy.mockRestore();
      Object.defineProperty(window, 'URL', { value: originalURL, configurable: true, writable: true });
    });

    it('imports from URL and updates diagram code', async () => {
      const { store } = renderWithStore();

      const importBtn = screen.getByTitle('Import from URL');

      const mockUrl = 'https://example.com/diagram.mmd';
      jest.spyOn(window, 'prompt').mockReturnValue(mockUrl);
      (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => 'graph TD\n  A --> B' });

      fireEvent.click(importBtn);

      await waitFor(() => expect(store.getState().diagram.mermaidCode).toContain('A --> B'));
    });
  });

  describe('View Controls', () => {
    it('resets view (zoom and pan)', async () => {
      const { store } = renderWithStore({}, { canvas: { zoom: 2, pan: { x: 50, y: 50 } } });

      const resetBtn = screen.getByTitle('Reset View (Ctrl+0)');
      fireEvent.click(resetBtn);

      await waitFor(() => {
        const { zoom, pan } = store.getState().canvas;
        expect(zoom).toBe(1);
        expect(pan).toEqual({ x: 0, y: 0 });
      });
    });

    it('fits diagram to screen when container and svg exist', async () => {
      const { store } = renderWithStore();

      // Setup container and diagram with mocked sizes
      const container = document.createElement('div');
      container.id = 'mermaid-container';
      document.body.appendChild(container);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.appendChild(svg);

      // Mock getBoundingClientRect
      (container as any).getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      (svg as any).getBoundingClientRect = () => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      const fitBtn = screen.getByTitle('Fit to Screen');
      fireEvent.click(fitBtn);

      await waitFor(() => {
        const { zoom, pan } = store.getState().canvas;
        expect(zoom).toBe(0.9);
        expect(pan).toEqual({ x: 0, y: 0 });
      });
    });

    it('toggles grid and updates container background', () => {
      renderWithStore();
      const container = document.createElement('div');
      container.id = 'mermaid-container';
      document.body.appendChild(container);

      const gridBtn = screen.getByTitle('Grid Options');
      fireEvent.click(gridBtn);

      const checkbox = screen.getByLabelText('Show Grid') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);

      expect(container.style.backgroundImage).toContain('linear-gradient');
    });

    it('enters and exits fullscreen', async () => {
      renderWithStore();

      const fsBtn = screen.getByTitle('Enter Fullscreen (F11)');
      fireEvent.click(fsBtn);

      await waitFor(() => expect(screen.getByTitle('Exit Fullscreen (ESC)')).toBeInTheDocument());

      const exitBtn = screen.getByTitle('Exit Fullscreen (ESC)');
      fireEvent.click(exitBtn);

      await waitFor(() => expect(screen.getByTitle('Enter Fullscreen (F11)')).toBeInTheDocument());
    });

    it('toggles presentation mode and hides header', () => {
      renderWithStore();
      const header = screen.getByRole('banner');
      const pmBtn = screen.getByTitle('Presentation Mode');

      expect(header).not.toHaveClass('hidden');
      fireEvent.click(pmBtn);
      expect(header).toHaveClass('hidden');
    });
  });

  describe('Theme Toggle', () => {
    it('shows correct icon for light/dark and toggles', async () => {
      const { store } = renderWithStore({}, { ui: { theme: 'light' } });

      const lightBtn = screen.getByTitle('Switch to dark theme');
      expect(lightBtn.querySelector('svg')).toBeInTheDocument();
      fireEvent.click(lightBtn);

      await waitFor(() => expect(store.getState().ui.theme).toBe('dark'));
      const darkBtn = screen.getByTitle('Switch to light theme');
      expect(darkBtn.querySelector('svg')).toBeInTheDocument();
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
      expect(header).toHaveClass('px-4', 'py-2');
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
