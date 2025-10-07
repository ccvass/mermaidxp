import React from 'react';
import { useSelector } from 'react-redux';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { selectHistoryInfo } from '../../store/slices/historyEngineSlice';

export const UndoRedoDebug: React.FC = () => {
  const { canUndo, canRedo, undo, redo } = useHistoryEngine();
  const info = useSelector(selectHistoryInfo);
  const currentIndex = info.past;
  const historyLength = info.past + info.future + 1;

  return (
    <div
      data-testid="undo-redo-debug-panel"
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 text-xs z-50"
    >
      <div className="font-semibold mb-2">Undo/Redo Status</div>
      <div className="space-y-1">
        <div>
          History: {currentIndex + 1}/{historyLength}
        </div>
        <div>Can Undo: {canUndo ? '✅' : '❌'}</div>
        <div>Can Redo: {canRedo ? '✅' : '❌'}</div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`px-2 py-1 rounded text-xs ${canUndo ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`px-2 py-1 rounded text-xs ${canRedo ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Redo
        </button>
      </div>
    </div>
  );
};
