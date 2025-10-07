import React from 'react';
import { useSelector } from 'react-redux';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { selectHistoryInfo } from '../../store/slices/historyEngineSlice';

interface UndoRedoButtonsProps {
  className?: string;
  showLabels?: boolean;
}

export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({ className = '', showLabels = true }) => {
  const { canUndo, canRedo, undo, redo } = useHistoryEngine();
  const { past, future } = useSelector(selectHistoryInfo);
  const historyLength = past + future + 1;
  const currentIndex = past;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          canUndo
            ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300'
            : 'text-gray-400 bg-gray-50 cursor-not-allowed border border-gray-200'
        }`}
        title={`Undo (Ctrl+Z) - ${currentIndex}/${historyLength - 1}`}
      >
        <span className="text-lg">↶</span>
        {showLabels && <span className="ml-1">Undo</span>}
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          canRedo
            ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300'
            : 'text-gray-400 bg-gray-50 cursor-not-allowed border border-gray-200'
        }`}
        title={`Redo (Ctrl+Y) - ${currentIndex}/${historyLength - 1}`}
      >
        <span className="text-lg">↷</span>
        {showLabels && <span className="ml-1">Redo</span>}
      </button>

      {/* History indicator */}
      <div className="text-xs text-gray-500 ml-2">
        {currentIndex + 1}/{historyLength}
      </div>
    </div>
  );
};
