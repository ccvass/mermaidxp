import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DiagramState, MermaidRenderResult } from '../../types/diagram.types';
import { DEFAULT_MERMAID_CODE } from '../../constants/diagram.constants';
import { mermaidService } from '../../services/mermaidService';
import { Theme } from '../../types/ui.types';

export const initialState: DiagramState = {
  mermaidCode: DEFAULT_MERMAID_CODE,
  renderResult: null,
  isLoading: false,
  error: null,
  sheets: [],
  activeSheetIndex: 0,
};

// Async thunk for rendering diagram
export const renderDiagram = createAsyncThunk(
  'diagram/render',
  async ({ code, theme }: { code: string; theme: Theme }, { getState }): Promise<MermaidRenderResult> => {
    const state = getState() as { diagram: DiagramState };
    if (state.diagram.sheets.length > 0) {
      return { svg: '', error: null };
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
    },
    // Set code without triggering history engine capture (used for restores)
    applyMermaidCode: (state, action: PayloadAction<string>) => {
      state.mermaidCode = action.payload;
    },
    appendMermaidCode: (state, action: PayloadAction<string>) => {
      state.mermaidCode = `${state.mermaidCode.trim()}\n${action.payload}\n`;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRenderResult: (state, action: PayloadAction<MermaidRenderResult | null>) => {
      state.renderResult = action.payload;
    },
    setSheets: (state, action: PayloadAction<{ title: string; code: string }[]>) => {
      state.sheets = action.payload;
      state.activeSheetIndex = 0;
      // Don't set mermaidCode here — SheetsView handles its own rendering
    },
    setActiveSheet: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      if (idx >= 0 && idx < state.sheets.length) {
        state.activeSheetIndex = idx;
      }
    },
    clearSheets: (state) => {
      state.sheets = [];
      state.activeSheetIndex = 0;
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

export const {
  setMermaidCode,
  applyMermaidCode,
  appendMermaidCode,
  clearError,
  setRenderResult,
  setSheets,
  setActiveSheet,
  clearSheets,
} = diagramSlice.actions;

export default diagramSlice.reducer;
