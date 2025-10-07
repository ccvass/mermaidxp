import React from 'react';
import { useHistoryEngine } from '../hooks/useHistoryEngine';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPresentationMode } from '../store/slices/uiSlice';

export const KeyboardManager: React.FC = () => {
  const { enabled, undo, redo } = useHistoryEngine();
  const dispatch = useAppDispatch();
  const isPresentationMode = useAppSelector((state) => state.ui.isPresentationMode);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to exit presentation mode
      if (event.key === 'Escape' && isPresentationMode) {
        event.preventDefault();
        dispatch(setPresentationMode(false));
        return;
      }

      if (!enabled) return;

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      if (isCtrlOrCmd && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      } else if (
        (isCtrlOrCmd && event.key.toLowerCase() === 'y') ||
        (isCtrlOrCmd && event.shiftKey && event.key.toLowerCase() === 'z')
      ) {
        event.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, undo, redo, isPresentationMode, dispatch]);

  return null;
};
