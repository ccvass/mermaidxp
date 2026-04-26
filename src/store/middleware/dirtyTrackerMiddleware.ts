import type { Middleware } from '@reduxjs/toolkit';
import { setDirty } from '../slices/uiSlice';

// Marks the document as dirty whenever diagram code changes
export const dirtyTrackerMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type?: string }).type;
  if (type === 'diagram/setMermaidCode' || type === 'diagram/appendMermaidCode') {
    if (!store.getState().ui.isDirty) {
      store.dispatch(setDirty(true));
    }
  }
  return result;
};
