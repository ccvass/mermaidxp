import { vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import diagramReducer, {
  setMermaidCode,
  appendMermaidCode,
  clearError,
  setRenderResult,
  renderDiagram,
  initialState,
} from './diagramSlice';
import { MermaidRenderResult } from '../../types/diagram.types';
import { Theme } from '../../types/ui.types';
import { DEFAULT_MERMAID_CODE } from '../../constants/diagram.constants';
import { mermaidService } from '../../services/mermaidService';

vi.mock('../../services/mermaidService', () => ({
  mermaidService: {
    validateCode: vi.fn(),
    render: vi.fn(),
  },
}));

describe('diagramSlice', () => {
  describe('synchronous actions', () => {
    it('should handle setMermaidCode', () => {
      const newCode = 'graph TD\n  A --> B';
      const state = diagramReducer(initialState, setMermaidCode(newCode));
      expect(state.mermaidCode).toBe(newCode);
    });

    it('should handle appendMermaidCode', () => {
      const appendCode = 'B --> C';
      const state = diagramReducer(initialState, appendMermaidCode(appendCode));
      expect(state.mermaidCode).toBe(`${DEFAULT_MERMAID_CODE.trim()}\n${appendCode}\n`);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Test error' };
      const state = diagramReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });

    it('should handle setRenderResult', () => {
      const renderResult: MermaidRenderResult = {
        svg: '<svg>test</svg>',
        bindFunctions: vi.fn(),
        error: null,
      };
      const state = diagramReducer(initialState, setRenderResult(renderResult));
      expect(state.renderResult).toEqual(renderResult);
    });

    it('should handle setRenderResult with null', () => {
      const stateWithResult = {
        ...initialState,
        renderResult: { svg: '<svg>test</svg>', error: null } as MermaidRenderResult,
      };
      const state = diagramReducer(stateWithResult, setRenderResult(null));
      expect(state.renderResult).toBeNull();
    });
  });

  describe('async actions', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({ reducer: { diagram: diagramReducer } });
      vi.clearAllMocks();
    });

    it('should handle renderDiagram.pending', () => {
      const mockRender = mermaidService.render as any;
      mockRender.mockImplementation(() => new Promise(() => {}));
      store.dispatch(renderDiagram({ code: 'test', theme: Theme.Light }));
      const state = store.getState().diagram;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle renderDiagram.fulfilled', async () => {
      const mockResult: MermaidRenderResult = {
        svg: '<svg>test diagram</svg>',
        bindFunctions: vi.fn(),
        error: null,
      };
      const mockRender = mermaidService.render as any;
      mockRender.mockResolvedValue(mockResult);
      await store.dispatch(renderDiagram({ code: 'test', theme: Theme.Light }));
      const state = store.getState().diagram;
      expect(state.isLoading).toBe(false);
      expect(state.renderResult).toEqual(mockResult);
      expect(state.error).toBeNull();
    });

    it('should handle renderDiagram.rejected', async () => {
      const mockRender = mermaidService.render as any;
      mockRender.mockRejectedValue(new Error('Render failed'));
      await store.dispatch(renderDiagram({ code: 'test', theme: Theme.Light }));
      const state = store.getState().diagram;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Render failed');
    });

    it('should handle renderDiagram with dark theme', async () => {
      const mockResult: MermaidRenderResult = {
        svg: '<svg>dark</svg>',
        bindFunctions: vi.fn(),
        error: null,
      };
      const mockRender = mermaidService.render as any;
      mockRender.mockResolvedValue(mockResult);
      await store.dispatch(renderDiagram({ code: 'test', theme: Theme.Dark }));
      expect(mockRender).toHaveBeenCalledWith('test', Theme.Dark);
    });
  });
});
