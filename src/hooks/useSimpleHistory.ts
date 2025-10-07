import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setMermaidCode, undo as diagramUndo, redo as diagramRedo } from '../store/slices/diagramSlice';

export const useSimpleHistory = () => {
  const dispatch = useDispatch();
  const { history, historyIndex, mermaidCode } = useSelector((state: RootState) => state.diagram);

  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Undo function
  const undo = useCallback(() => {
    if (canUndo) {
      dispatch(diagramUndo());
    }
  }, [dispatch, canUndo]);

  // Redo function
  const redo = useCallback(() => {
    if (canRedo) {
      dispatch(diagramRedo());
    }
  }, [dispatch, canRedo]);

  // Save current state to history (manual save)
  const saveToHistory = useCallback(() => {
    // This will trigger the history update in diagramSlice when setMermaidCode is called
    dispatch(setMermaidCode(mermaidCode));
  }, [dispatch, mermaidCode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      } else if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveToHistory,
    historyLength: history.length,
    currentIndex: historyIndex,
  };
};
