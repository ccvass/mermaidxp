import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Estado completo que queremos trackear para undo/redo
export interface UnifiedHistorySnapshot {
  timestamp: number;
  mermaidCode: string;
  canvasState: {
    zoom: number;
    pan: { x: number; y: number };
    selectedNodes: string[];
    customElements: CustomElementState[];
  };
  actionType: string; // Para debugging
  description?: string; // Descripción opcional de la acción
}

// Estado de elementos custom (text, images, shapes, icons)
export interface CustomElementState {
  id: string;
  type: 'text' | 'image' | 'svg-shape' | 'icon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string; // Para texto o URL de imagen
  style?: Record<string, unknown>; // Estilos adicionales
}

export interface UnifiedHistoryState {
  past: UnifiedHistorySnapshot[];
  present: UnifiedHistorySnapshot;
  future: UnifiedHistorySnapshot[];
  maxHistorySize: number;
  isTrackingEnabled: boolean; // Para pausar el tracking durante operaciones batch
  lastSavedTimestamp: number; // Para evitar guardar cambios muy rápidos
  // Modo de agrupación para tratar múltiples cambios como una sola entrada de historial
  isGrouping: boolean;
  groupHasPushed: boolean; // Indica si ya movimos el presente a "past" durante el grupo
}

const createInitialSnapshot = (): UnifiedHistorySnapshot => ({
  timestamp: Date.now(),
  mermaidCode: 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]',
  canvasState: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNodes: [],
    customElements: [],
  },
  actionType: 'initial',
});

const initialState: UnifiedHistoryState = {
  past: [],
  present: createInitialSnapshot(),
  future: [],
  maxHistorySize: 50,
  isTrackingEnabled: true,
  lastSavedTimestamp: 0,
  isGrouping: false,
  groupHasPushed: false,
};

// Helper para comparar si dos snapshots son diferentes
const areSnapshotsDifferent = (a: UnifiedHistorySnapshot, b: UnifiedHistorySnapshot): boolean => {
  // Comparar código
  if (a.mermaidCode !== b.mermaidCode) return true;

  // Comparar canvas state
  if (a.canvasState.zoom !== b.canvasState.zoom) return true;
  if (a.canvasState.pan.x !== b.canvasState.pan.x || a.canvasState.pan.y !== b.canvasState.pan.y) return true;

  // Comparar selected nodes
  if (JSON.stringify(a.canvasState.selectedNodes) !== JSON.stringify(b.canvasState.selectedNodes)) return true;

  // Comparar custom elements
  if (JSON.stringify(a.canvasState.customElements) !== JSON.stringify(b.canvasState.customElements)) return true;

  return false;
};

const unifiedHistorySlice = createSlice({
  name: 'unifiedHistory',
  initialState,
  reducers: {
    // Guardar un snapshot completo del estado actual
    saveSnapshot: (
      state,
      action: PayloadAction<{
        mermaidCode?: string;
        canvasState?: Partial<UnifiedHistorySnapshot['canvasState']>;
        actionType: string;
        description?: string;
        force?: boolean; // Forzar guardado sin verificar diferencias
        coalesce?: boolean; // Si true, actualiza el snapshot presente sin empujar un nuevo elemento en "past"
      }>
    ) => {
      const { mermaidCode, canvasState, actionType, description, force, coalesce } = action.payload;

      // Si el tracking está deshabilitado y no es forzado, no guardar
      if (!state.isTrackingEnabled && !force) return;

      // Throttling: no guardar si el último guardado fue hace menos de 100ms (excepto si es forzado)
      const now = Date.now();
      if (!force && now - state.lastSavedTimestamp < 100) return;

      // Crear nuevo snapshot
      const newSnapshot: UnifiedHistorySnapshot = {
        timestamp: now,
        mermaidCode: mermaidCode ?? state.present.mermaidCode,
        canvasState: {
          zoom: canvasState?.zoom ?? state.present.canvasState.zoom,
          pan: canvasState?.pan ?? state.present.canvasState.pan,
          selectedNodes: canvasState?.selectedNodes ?? state.present.canvasState.selectedNodes,
          customElements: canvasState?.customElements ?? state.present.canvasState.customElements,
        },
        actionType,
        description,
      };

      // Solo guardar si hay cambios reales o es forzado
      if (!(force || areSnapshotsDifferent(state.present, newSnapshot))) {
        return;
      }

      // Si estamos agrupando múltiples cambios como una sola entrada
      if (state.isGrouping) {
        if (!state.groupHasPushed) {
          // Primera vez en el grupo: mover el presente al pasado
          state.past.push(state.present);
          if (state.past.length > state.maxHistorySize) {
            state.past = state.past.slice(-state.maxHistorySize);
          }
          state.groupHasPushed = true;
          // Al iniciar un cambio que altera la línea temporal, limpiar el futuro
          state.future = [];
        }
        // En modo agrupado, simplemente actualizamos el presente
        state.present = newSnapshot;
        state.lastSavedTimestamp = now;
        return;
      }

      // Si se solicita coalescer, actualizar el presente sin empujar a "past"
      if (coalesce) {
        state.present = newSnapshot;
        state.future = [];
        state.lastSavedTimestamp = now;
        return;
      }

      // Comportamiento por defecto: empujar presente a pasado y establecer nuevo presente
      state.past.push(state.present);
      if (state.past.length > state.maxHistorySize) {
        state.past = state.past.slice(-state.maxHistorySize);
      }
      state.present = newSnapshot;
      state.future = [];
      state.lastSavedTimestamp = now;
    },

    // Deshacer al estado anterior
    undo: (state) => {
      if (state.past.length > 0) {
        // Mover el presente actual al futuro
        state.future.unshift(state.present);

        // Mover el último elemento del pasado al presente
        state.present = state.past.pop()!;

        // Limitar el tamaño del futuro
        if (state.future.length > state.maxHistorySize) {
          state.future = state.future.slice(0, state.maxHistorySize);
        }
      }
    },

    // Rehacer al siguiente estado
    redo: (state) => {
      if (state.future.length > 0) {
        // Mover el presente actual al pasado
        state.past.push(state.present);

        // Mover el primer elemento del futuro al presente
        state.present = state.future.shift()!;

        // Limitar el tamaño del pasado
        if (state.past.length > state.maxHistorySize) {
          state.past = state.past.slice(-state.maxHistorySize);
        }
      }
    },

    // Limpiar todo el historial
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.lastSavedTimestamp = 0;
      state.isGrouping = false;
      state.groupHasPushed = false;
    },

    // Establecer el tamaño máximo del historial
    setMaxHistorySize: (state, action: PayloadAction<number>) => {
      state.maxHistorySize = Math.max(1, Math.min(100, action.payload));

      // Recortar el historial existente si es necesario
      if (state.past.length > state.maxHistorySize) {
        state.past = state.past.slice(-state.maxHistorySize);
      }
      if (state.future.length > state.maxHistorySize) {
        state.future = state.future.slice(0, state.maxHistorySize);
      }
    },

    // Habilitar/deshabilitar el tracking (útil para operaciones batch)
    setTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.isTrackingEnabled = action.payload;
    },

    // Controlar agrupación manual de cambios
    beginGroup: (state) => {
      state.isGrouping = true;
      state.groupHasPushed = false;
    },
    endGroup: (state) => {
      state.isGrouping = false;
      state.groupHasPushed = false;
    },

    // Inicializar el historial con un estado específico
    initializeHistory: (
      state,
      action: PayloadAction<{
        mermaidCode: string;
        canvasState?: Partial<UnifiedHistorySnapshot['canvasState']>;
      }>
    ) => {
      const { mermaidCode, canvasState } = action.payload;
      state.present = {
        timestamp: Date.now(),
        mermaidCode,
        canvasState: {
          zoom: canvasState?.zoom ?? 1,
          pan: canvasState?.pan ?? { x: 0, y: 0 },
          selectedNodes: canvasState?.selectedNodes ?? [],
          customElements: canvasState?.customElements ?? [],
        },
        actionType: 'initialize',
      };
      state.past = [];
      state.future = [];
      state.lastSavedTimestamp = Date.now();
    },

    // Actualizar solo el código Mermaid en el presente (sin crear historial)
    updateCurrentCode: (state, action: PayloadAction<string>) => {
      state.present.mermaidCode = action.payload;
    },

    // Actualizar solo el estado del canvas en el presente (sin crear historial)
    updateCurrentCanvas: (state, action: PayloadAction<Partial<UnifiedHistorySnapshot['canvasState']>>) => {
      state.present.canvasState = {
        ...state.present.canvasState,
        ...action.payload,
      };
    },
  },
});

export const {
  saveSnapshot,
  undo,
  redo,
  clearHistory,
  setMaxHistorySize,
  setTrackingEnabled,
  beginGroup,
  endGroup,
  initializeHistory,
  updateCurrentCode,
  updateCurrentCanvas,
} = unifiedHistorySlice.actions;

// Selectores
export const selectCanUndo = (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.past.length > 0;

export const selectCanRedo = (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.future.length > 0;

export const selectCurrentSnapshot = (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.present;

export const selectHistoryInfo = createSelector(
  [
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.past.length,
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.future.length,
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.present.actionType,
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.present.description,
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.isTrackingEnabled,
  ],
  (pastLength, futureLength, currentAction, currentDescription, isTrackingEnabled) => ({
    canUndo: pastLength > 0,
    canRedo: futureLength > 0,
    pastCount: pastLength,
    futureCount: futureLength,
    currentAction,
    currentDescription,
    isTrackingEnabled,
  })
);

export const selectHistoryStats = createSelector(
  [
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.past.length,
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.future.length,
    (state: { unifiedHistory: UnifiedHistoryState }) => state.unifiedHistory.maxHistorySize,
  ],
  (pastLength, futureLength, maxSize) => ({
    totalHistory: pastLength + 1 + futureLength,
    currentIndex: pastLength,
    maxSize,
  })
);
