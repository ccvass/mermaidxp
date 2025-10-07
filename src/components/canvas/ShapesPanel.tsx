import React, { useEffect, useRef } from 'react';
import { ShapeDefinition } from '../../types/shapes.types';
import { BASIC_SHAPES } from '../../constants/shapes.constants.tsx';

interface ShapesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onShapeSelected: (shape: ShapeDefinition) => void;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

export const ShapesPanel: React.FC<ShapesPanelProps> = ({ isOpen, onClose, onShapeSelected, targetRef }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, targetRef]);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 min-w-[320px]"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select a Shape</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Click a shape, then click on the canvas to place it</p>
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {BASIC_SHAPES.map((shape) => (
          <button
            key={shape.id}
            onClick={() => onShapeSelected(shape)}
            className="
              flex flex-col items-center justify-center p-3 
              border border-gray-200 dark:border-gray-600 
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
              hover:border-blue-300 dark:hover:border-blue-500
              transition-colors cursor-pointer
              group
            "
            title={`${shape.name} - ${shape.description}`}
          >
            <div className="text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              <shape.icon />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">{shape.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="font-medium mb-1">💡 Quick Tips:</div>
          <div>• Shapes are inserted as SVG elements with text.</div>
          <div>• You can edit text/size after placing on canvas.</div>
          <div>• Press Escape to cancel placement</div>
        </div>
      </div>
    </div>
  );
};
