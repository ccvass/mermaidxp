import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '..';

export interface HistorySnapshot {
  mermaidCode: string;
  canvas: {
    zoom: number;
    pan: { x: number; y: number };
    selectedNodes: string[];
  };
  canvasElements: {
    elements: Record<string, any>; // CanvasElement from canvasElementsSlice
    selectedElementIds: string[];
  };
  meta: {
    timestamp: number;
    actionType?: string;
    groupId?: string | null;
    hash?: string;
    description?: string; // Human-readable description of the action
  };
}

export interface HistoryEngineState {
  past: HistorySnapshot[];
  present: HistorySnapshot | null;
  future: HistorySnapshot[];
  maxSize: number;
  isRestoring: boolean;
  activeGroupId: string | null;
  featureEnabled: boolean;
}

const initialState: HistoryEngineState = {
  past: [],
  present: null,
  future: [],
  maxSize: 100,
  isRestoring: false,
  activeGroupId: null,
  featureEnabled: false,
};

const slice = createSlice({
  name: 'historyEngine',
  initialState,
  reducers: {
    setFeatureEnabled(state, action: PayloadAction<boolean>) {
      state.featureEnabled = action.payload;
    },
    setMaxSize(state, action: PayloadAction<number>) {
      const size = Math.max(1, Math.min(500, action.payload));
      state.maxSize = size;
      if (state.past.length > size) state.past = state.past.slice(-size);
      if (state.future.length > size) state.future = state.future.slice(0, size);
    },
    beginGroup(state, action: PayloadAction<string | undefined>) {
      state.activeGroupId = action.payload ?? `grp_${Date.now()}`;
    },
    endGroup(state) {
      state.activeGroupId = null;
    },
    setIsRestoring(state, action: PayloadAction<boolean>) {
      state.isRestoring = action.payload;
    },
    commitSnapshot(state, action: PayloadAction<{ snapshot: HistorySnapshot; replacePresent?: boolean }>) {
      const { snapshot, replacePresent } = action.payload;
      if (!state.present) {
        state.present = snapshot;
        state.future = [];
        return;
      }

      // Deduplicate: if identical to present, skip
      const sameHash = !!snapshot.meta.hash && snapshot.meta.hash === state.present.meta.hash;
      const sameCode = snapshot.mermaidCode === state.present.mermaidCode;
      const sameCanvas =
        snapshot.canvas.zoom === state.present.canvas.zoom &&
        snapshot.canvas.pan.x === state.present.canvas.pan.x &&
        snapshot.canvas.pan.y === state.present.canvas.pan.y &&
        JSON.stringify(snapshot.canvas.selectedNodes) === JSON.stringify(state.present.canvas.selectedNodes);
      const sameElements =
        JSON.stringify(snapshot.canvasElements.elements) === JSON.stringify(state.present.canvasElements.elements) &&
        JSON.stringify(snapshot.canvasElements.selectedElementIds) ===
          JSON.stringify(state.present.canvasElements.selectedElementIds);
      if (!replacePresent && (sameHash || (sameCode && sameCanvas && sameElements))) {
        return;
      }

      // Move present to past (unless replacePresent)
      if (!replacePresent) {
        state.past.push(state.present);
        if (state.past.length > state.maxSize) {
          state.past = state.past.slice(-state.maxSize);
        }
      }

      state.present = snapshot;
      state.future = [];
    },
    undo(state) {
      if (state.past.length === 0) {
        return;
      }
      const prev = state.past.pop()!;
      if (state.present) {
        state.future.unshift(state.present);
        if (state.future.length > state.maxSize) {
          state.future = state.future.slice(0, state.maxSize);
        }
      }
      state.present = prev;
    },
    redo(state) {
      if (state.future.length === 0) return;
      const next = state.future.shift()!;
      if (state.present) {
        state.past.push(state.present);
        if (state.past.length > state.maxSize) {
          state.past = state.past.slice(-state.maxSize);
        }
      }
      state.present = next;
    },
    clear(state) {
      state.past = [];
      state.future = [];
      // keep present as is to avoid losing current screen state
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    captureNow(_state, _action: PayloadAction<{ actionType?: string } | undefined>) {
      // no-op; handled by middleware to capture a fresh snapshot (middleware reads optional actionType)
    },
  },
});

export const {
  setFeatureEnabled,
  setMaxSize,
  beginGroup,
  endGroup,
  setIsRestoring,
  commitSnapshot,
  undo,
  redo,
  clear,
  captureNow,
} = slice.actions;

export default slice.reducer;

// Selectors
export const selectHistoryPresent = (state: RootState) => state.historyEngine.present;
export const selectHistoryInfo = createSelector(
  [
    (state: RootState) => state.historyEngine.past.length,
    (state: RootState) => state.historyEngine.future.length,
    (state: RootState) => state.historyEngine.activeGroupId,
  ],
  (pastLength, futureLength, groupId) => ({
    canUndo: pastLength > 0,
    canRedo: futureLength > 0,
    past: pastLength,
    future: futureLength,
    groupId,
  })
);
