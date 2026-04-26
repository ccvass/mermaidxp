import { configureStore } from '@reduxjs/toolkit';
import diagramReducer, {
  setMermaidCode,
  appendMermaidCode,
  undo,
  redo,
  clearError,
  setRenderResult,
  renderDiagram,
} from './diagramSlice';
import { DiagramState, MermaidRenderResult } from '../../types/diagram.types';
import { Theme } from '../../types/ui.types';
import { DEFAULT_MERMAID_CODE } from '../../constants/diagram.constants';
import { mermaidService } from '../../services/mermaidService';

// Mock the mermaidService
jest.mock('../../services/mermaidService', () => ({
  mermaidService: {
    validateCode: jest.fn(),
    render: jest.fn(),
  },
}));

describe('diagramSlice', () => {
  const initialState: DiagramState = {
    mermaidCode: DEFAULT_MERMAID_CODE,
    renderResult: null,
    isLoading: false,
    error: null,
    history: [DEFAULT_MERMAID_CODE],
    historyIndex: 0,
  };

  describe('synchronous actions', () => {
    it('should handle setMermaidCode', () => {
      const newCode = 'graph TD\n  A --> B';
      const state = diagramReducer(initialState, setMermaidCode(newCode));

      expect(state.mermaidCode).toBe(newCode);
      expect(state.history).toEqual([DEFAULT_MERMAID_CODE, newCode]);
      expect(state.historyIndex).toBe(1);
    });

    it('should not duplicate history entries when setting the same code', () => {
      const state1 = diagramReducer(initialState, setMermaidCode('test code'));
      const state2 = diagramReducer(state1, setMermaidCode('test code'));

      expect(state2.history.length).toBe(2); // Initial + one new entry
      expect(state2.historyIndex).toBe(1);
    });

    it('should limit history to 50 items', () => {
      let state = initialState;

      // Add 55 different codes
      for (let i = 0; i < 55; i++) {
        state = diagramReducer(state, setMermaidCode(`code ${i}`));
      }

      expect(state.history.length).toBe(50);
      expect(state.history[0]).toBe('code 5'); // Oldest kept item
      expect(state.history[49]).toBe('code 54'); // Newest item
    });

    it('should clear future history when setting new code after undo', () => {
      let state = diagramReducer(initialState, setMermaidCode('code 1'));
      state = diagramReducer(state, setMermaidCode('code 2'));
      state = diagramReducer(state, setMermaidCode('code 3'));
      state = diagramReducer(state, undo()); // Back to 'code 2'
      state = diagramReducer(state, setMermaidCode('code 4'));

      expect(state.history).toEqual([DEFAULT_MERMAID_CODE, 'code 1', 'code 2', 'code 4']);
      expect(state.historyIndex).toBe(3);
    });

    it('should handle appendMermaidCode', () => {
      const appendCode = 'B --> C';
      const state = diagramReducer(initialState, appendMermaidCode(appendCode));

      expect(state.mermaidCode).toBe(`${DEFAULT_MERMAID_CODE.trim()}\n${appendCode}\n`);
      expect(state.history.length).toBe(2);
      expect(state.historyIndex).toBe(1);
    });

    it('should handle undo', () => {
      let state = diagramReducer(initialState, setMermaidCode('code 1'));
      state = diagramReducer(state, setMermaidCode('code 2'));
      state = diagramReducer(state, undo());

      expect(state.mermaidCode).toBe('code 1');
      expect(state.historyIndex).toBe(1);
    });

    it('should not undo past the beginning', () => {
      const state = diagramReducer(initialState, undo());

      expect(state.mermaidCode).toBe(DEFAULT_MERMAID_CODE);
      expect(state.historyIndex).toBe(0);
    });

    it('should handle redo', () => {
      let state = diagramReducer(initialState, setMermaidCode('code 1'));
      state = diagramReducer(state, setMermaidCode('code 2'));
      state = diagramReducer(state, undo());
      state = diagramReducer(state, redo());

      expect(state.mermaidCode).toBe('code 2');
      expect(state.historyIndex).toBe(2);
    });

    it('should not redo past the end', () => {
      let state = diagramReducer(initialState, setMermaidCode('code 1'));
      state = diagramReducer(state, redo());

      expect(state.mermaidCode).toBe('code 1');
      expect(state.historyIndex).toBe(1);
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Test error',
      } as DiagramState;
      const state = diagramReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it('should handle setRenderResult', () => {
      const renderResult: MermaidRenderResult = {
        svg: '<svg>test</svg>',
        bindFunctions: jest.fn(),
        error: null,
      };
      const state = diagramReducer(initialState, setRenderResult(renderResult));

      expect(state.renderResult).toEqual(renderResult);
    });

    it('should handle setRenderResult with null', () => {
      const stateWithResult = {
        ...initialState,
        renderResult: { svg: '<svg>test</svg>', error: null } as MermaidRenderResult,
      } as DiagramState;
      const state = diagramReducer(stateWithResult, setRenderResult(null));

      expect(state.renderResult).toBeNull();
    });
  });

  describe('async actions', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          diagram: diagramReducer,
        },
      });
      jest.clearAllMocks();
    });

    it('should handle renderDiagram.pending', () => {
      const mockValidate = mermaidService.validateCode as jest.MockedFunction<typeof mermaidService.validateCode>;
      mockValidate.mockReturnValue({ isValid: true } as any);

      const mockRender = mermaidService.render as jest.MockedFunction<typeof mermaidService.render>;
      mockRender.mockImplementation(() => new Promise(() => {})); // Never resolves

      store.dispatch(renderDiagram({ code: 'test', theme: Theme.Light }));

      const state = store.getState().diagram;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle renderDiagram.fulfilled', async () => {
      const mockValidate = mermaidService.validateCode as jest.MockedFunction<typeof mermaidService.validateCode>;
      mockValidate.mockReturnValue({ isValid: true } as any);

      const mockResult: MermaidRenderResult = {
        svg: '<svg>test diagram</svg>',
        bindFunctions: jest.fn(),
        error: null,
      };

      const mockRender = mermaidService.render as jest.MockedFunction<typeof mermaidService.render>;
      mockRender.mockResolvedValue(mockResult as any);

      await store.dispatch(renderDiagram({ code: 'test', theme: Theme.Light }));

      const state = store.getState().diagram;
      expect(state.isLoading).toBe(false);
      expect(state.renderResult).toEqual(mockResult);
      expect(state.error).toBeNull();
    });

    it('should handle renderDiagram.rejected with validation error', async () => {
      const mockValidate = mermaidService.validateCode as jest.MockedFunction<typeof mermaidService.validateCode>;
      mockValidate.mockReturnValue({ isValid: false, error: 'Invalid syntax' } as any);

      const mockRender = mermaidService.render as jest.MockedFunction<typeof mermaidService.render>;
      mockRender.mockRejectedValue(new Error('Invalid syntax'));

      await store.dispatch(renderDiagram({ code: 'invalid', theme: Theme.Light }));

      const state = store.getState().diagram;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid syntax');
    });

    it('should handle renderDiagram.rejected with render error', async () => {
      const mockValidate = mermaidService.validateCode as jest.MockedFunction<typeof mermaidService.validateCode>;
      mockValidate.mockReturnValue({ isValid: true } as any);

      const mockRender = mermaidService.render as jest.MockedFunction<typeof mermaidService.render>;
      mockRender.mockRejectedValue(new Error('Render failed'));

      await store.dispatch(renderDiagram({ code: 'test', theme: Theme.Light }));

      const state = store.getState().diagram;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Render failed');
    });

    it('should handle renderDiagram with dark theme', async () => {
      const mockValidate = mermaidService.validateCode as jest.MockedFunction<typeof mermaidService.validateCode>;
      mockValidate.mockReturnValue({ isValid: true } as any);

      const mockResult: MermaidRenderResult = {
        svg: '<svg>dark theme diagram</svg>',
        bindFunctions: jest.fn(),
        error: null,
      };

      const mockRender = mermaidService.render as jest.MockedFunction<typeof mermaidService.render>;
      mockRender.mockResolvedValue(mockResult as any);

      await store.dispatch(renderDiagram({ code: 'test', theme: Theme.Dark }));

      expect(mockRender).toHaveBeenCalledWith('test', Theme.Dark);
    });
  });

  describe('integration scenarios', () => {
    it('should maintain consistent state through multiple operations', () => {
      let state = initialState;

      // Set some code
      state = diagramReducer(state, setMermaidCode('graph TD\n  A --> B'));

      // Append more code
      state = diagramReducer(state, appendMermaidCode('B --> C'));

      // Set different code
      state = diagramReducer(state, setMermaidCode('sequenceDiagram\n  A->>B: Hello'));

      // Undo twice
      state = diagramReducer(state, undo());
      state = diagramReducer(state, undo());

      // Should be back to first code
      expect(state.mermaidCode).toBe('graph TD\n  A --> B');

      // Redo once
      state = diagramReducer(state, redo());

      // Should have the appended version
      expect(state.mermaidCode).toContain('B --> C');
    });
  });
});
