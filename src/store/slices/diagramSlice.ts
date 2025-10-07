import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DiagramState, MermaidRenderResult } from '../../types/diagram.types';
import { DEFAULT_MERMAID_CODE } from '../../constants/diagram.constants';
import { mermaidService } from '../../services/mermaidService';
import { Theme } from '../../types/ui.types';

const initialState: DiagramState = {
  mermaidCode: DEFAULT_MERMAID_CODE,
  renderResult: null,
  isLoading: false,
  error: null,
  history: [DEFAULT_MERMAID_CODE],
  historyIndex: 0,
};

// Async thunk for rendering diagram
export const renderDiagram = createAsyncThunk(
  'diagram/render',
  async ({ code, theme }: { code: string; theme: Theme }): Promise<MermaidRenderResult> => {
    const validation = mermaidService.validateCode(code);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return await mermaidService.render(code, theme);
  }
);

const diagramSlice = createSlice({
  name: 'diagram',
  initialState,
  reducers: {
    setMermaidCode: (state, action: PayloadAction<string>) => {
      state.mermaidCode = action.payload;
      // Add to history if it's different from the current state
      if (state.history[state.historyIndex] !== action.payload) {
        // Remove any history after current index
        state.history = state.history.slice(0, state.historyIndex + 1);
        // Add new code to history
        state.history.push(action.payload);
        state.historyIndex = state.history.length - 1;

        // Limit history to 50 items
        if (state.history.length > 50) {
          state.history = state.history.slice(-50);
          state.historyIndex = state.history.length - 1;
        }
      }
    },
    // Set code without mutating the legacy diagram history (used for history engine restores)
    applyMermaidCode: (state, action: PayloadAction<string>) => {
      state.mermaidCode = action.payload;
    },
    appendMermaidCode: (state, action: PayloadAction<string>) => {
      const newCode = `${state.mermaidCode.trim()}\n${action.payload}\n`;
      state.mermaidCode = newCode;
      // Add to history
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(newCode);
      state.historyIndex = state.history.length - 1;
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.mermaidCode = state.history[state.historyIndex];
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.mermaidCode = state.history[state.historyIndex];
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setRenderResult: (state, action: PayloadAction<MermaidRenderResult | null>) => {
      state.renderResult = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(renderDiagram.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(renderDiagram.fulfilled, (state, action) => {
        state.isLoading = false;
        state.renderResult = action.payload;
        state.error = null;
      })
      .addCase(renderDiagram.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to render diagram';
      });
  },
});

export const { setMermaidCode, applyMermaidCode, appendMermaidCode, undo, redo, clearError, setRenderResult } =
  diagramSlice.actions;

export default diagramSlice.reducer;
