import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setMermaidCode } from '../store/slices/diagramSlice';

/**
 * Hook that automatically saves code changes to history after a delay
 * This ensures Undo/Redo works even when user types continuously
 */
export const useAutoSaveHistory = (delay: number = 1000) => {
  const dispatch = useDispatch();
  const { mermaidCode, history, historyIndex } = useSelector((state: RootState) => state.diagram);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>('');

  useEffect(() => {
    // Initialize with current code if history is empty or different
    if (history.length <= 1 && mermaidCode && mermaidCode !== lastSavedCodeRef.current) {
      lastSavedCodeRef.current = mermaidCode;
      console.log('🔄 Auto-save: Initialized history with current code');
    }
  }, [history.length, mermaidCode]);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-save if code has actually changed and is different from last saved
    if (mermaidCode && mermaidCode !== lastSavedCodeRef.current) {
      timeoutRef.current = setTimeout(() => {
        // Check if this code is different from the current history entry
        const currentHistoryCode = history[historyIndex];
        if (mermaidCode !== currentHistoryCode) {
          // Force save by dispatching setMermaidCode
          dispatch(setMermaidCode(mermaidCode));
          lastSavedCodeRef.current = mermaidCode;
          console.log('💾 Auto-save: Saved code change to history');
        }
      }, delay);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [mermaidCode, dispatch, delay, history, historyIndex]);

  // Manual save function
  const saveNow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (mermaidCode && mermaidCode !== lastSavedCodeRef.current) {
      dispatch(setMermaidCode(mermaidCode));
      lastSavedCodeRef.current = mermaidCode;
      console.log('💾 Manual save: Saved current code to history');
    }
  };

  return { saveNow };
};
