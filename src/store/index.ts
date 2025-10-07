import { configureStore } from '@reduxjs/toolkit';
import diagramReducer from './slices/diagramSlice';
import uiReducer from './slices/uiSlice';
import canvasReducer from './slices/canvasSlice';
import exportReducer from './slices/exportSlice';
import historyEngineReducer, { setFeatureEnabled } from './slices/historyEngineSlice';
import canvasElementsReducer from './slices/canvasElementsSlice';
import { historyEngineMiddleware } from './middleware/historyEngineMiddleware';
import { collaborationMiddleware } from './middleware/collaborationMiddleware';

export const store = configureStore({
  reducer: {
    diagram: diagramReducer,
    ui: uiReducer,
    canvas: canvasReducer,
    export: exportReducer,
    historyEngine: historyEngineReducer,
    canvasElements: canvasElementsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['canvas/setPlacingElement', 'canvas/setActiveDragInfo', 'diagram/setRenderResult'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.bindFunctions', 'payload.element'],
        // Ignore these paths in the state
        ignoredPaths: ['canvas.placingElement', 'canvas.activeDragInfo', 'diagram.renderResult.bindFunctions'],
      },
    }).concat(historyEngineMiddleware, collaborationMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable unified history engine for undo/redo
store.dispatch(setFeatureEnabled(true));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
