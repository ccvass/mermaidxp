import React from 'react';
import { useSelector } from 'react-redux';
import { useHistoryEngine } from '../hooks/useHistoryEngine';
import { selectHistoryInfo } from '../store/slices/historyEngineSlice';

// This component manages undo/redo globally
export const UndoRedoManager: React.FC = () => {
  const { canUndo, canRedo } = useHistoryEngine();
  const { past, future } = useSelector(selectHistoryInfo);
  const historyLength = past + future + 1;
  const currentIndex = past;

  // Store in window for toolbar access
  React.useEffect(() => {
    (window as any).__undoRedoState = { canUndo, canRedo, historyLength, currentIndex };
  }, [canUndo, canRedo, historyLength, currentIndex]);

  // Debug panel (visible in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        data-testid="undo-redo-status"
        className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-xs z-50 border border-gray-300"
      >
        <div className="font-semibold">Undo/Redo Status</div>
        <div>
          History: {currentIndex + 1}/{historyLength}
        </div>
        <div>Can Undo: {canUndo ? '✅' : '❌'}</div>
        <div>Can Redo: {canRedo ? '✅' : '❌'}</div>
      </div>
    );
  }

  return null;
};

// Unified history engine is used globally; no legacy exports
