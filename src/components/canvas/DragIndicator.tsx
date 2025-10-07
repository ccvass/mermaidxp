import React from 'react';

interface DragIndicatorProps {
  isActive: boolean;
  elementId?: string;
}

export const DragIndicator: React.FC<DragIndicatorProps> = ({ isActive, elementId }) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        <span className="font-medium">Dragging {elementId ? `"${elementId}"` : 'element'}</span>
        <div className="text-xs opacity-75">Release to drop</div>
      </div>
    </div>
  );
};
