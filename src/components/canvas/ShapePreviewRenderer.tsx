import React, { useState } from 'react';
import { ShapeDefinition } from '../../types/shapes.types';

interface ShapePreviewRendererProps {
  shape: ShapeDefinition;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  interactive?: boolean;
  onPreviewClick?: () => void;
}

export const ShapePreviewRenderer: React.FC<ShapePreviewRendererProps> = ({
  shape,
  size = 'medium',
  showLabel = true,
  interactive = false,
  onPreviewClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-xs',
    },
    medium: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12',
      text: 'text-sm',
    },
    large: {
      container: 'w-32 h-32',
      icon: 'w-16 h-16',
      text: 'text-base',
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`flex flex-col items-center ${interactive ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreviewClick}
    >
      {/* Shape Preview Container */}
      <div
        className={`
          ${config.container}
          bg-white dark:bg-gray-800 
          border-2 border-gray-200 dark:border-gray-600
          rounded-lg 
          flex items-center justify-center 
          transition-all duration-200
          ${interactive ? 'hover:border-blue-400 hover:shadow-md' : ''}
          ${isHovered ? 'scale-105' : ''}
        `}
      >
        {/* Shape Icon */}
        <div className={`${config.icon} flex items-center justify-center`}>
          <shape.icon />
        </div>

        {/* Hover Overlay with Details */}
        {isHovered && interactive && (
          <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center z-10">
            <div className="text-white text-center p-2">
              <div className="text-xs font-medium mb-1">{shape.name}</div>
              <div className="text-xs opacity-75 mb-2">{shape.category}</div>
              <div className="text-xs bg-blue-600 px-2 py-1 rounded">Click to add</div>
            </div>
          </div>
        )}
      </div>

      {/* Shape Label */}
      {showLabel && (
        <div className="mt-2 text-center">
          <div className={`${config.text} font-medium text-gray-900 dark:text-white truncate max-w-full`}>
            {shape.name}
          </div>
          {size !== 'small' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">{shape.category}</div>
          )}
        </div>
      )}

      {/* Properties Indicators */}
      {size === 'large' && (
        <div className="mt-2 flex space-x-1">
          {shape.isResizable && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              Resizable
            </span>
          )}
          {shape.isRotatable && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              Rotatable
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Shape Grid Component for displaying multiple shapes
interface ShapeGridProps {
  shapes: ShapeDefinition[];
  onShapeSelect: (shape: ShapeDefinition) => void;
  size?: 'small' | 'medium' | 'large';
  columns?: number;
}

export const ShapeGrid: React.FC<ShapeGridProps> = ({ shapes, onShapeSelect, size = 'medium', columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-4'} gap-4`}>
      {shapes.map((shape) => (
        <ShapePreviewRenderer
          key={shape.id}
          shape={shape}
          size={size}
          interactive={true}
          onPreviewClick={() => onShapeSelect(shape)}
        />
      ))}
    </div>
  );
};

// Shape Category Header Component
interface ShapeCategoryHeaderProps {
  category: string;
  icon: string;
  name: string;
  description: string;
  count: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const ShapeCategoryHeader: React.FC<ShapeCategoryHeaderProps> = ({
  icon,
  name,
  description,
  count,
  isExpanded = true,
  onToggle,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
        onToggle ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
          {count} shapes
        </span>
        {onToggle && <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>}
      </div>
    </div>
  );
};

export default ShapePreviewRenderer;
