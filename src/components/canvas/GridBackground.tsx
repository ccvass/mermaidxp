import React from 'react';

interface GridBackgroundProps {
  zoom: number;
  pan: { x: number; y: number };
  gridSize?: number;
  className?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ zoom, pan, gridSize = 20, className = '' }) => {
  // Calculate grid offset based on pan and zoom
  const offsetX = pan.x % gridSize;
  const offsetY = pan.y % gridSize;
  const scaledGridSize = gridSize * zoom;

  // Ensure minimum visibility
  const minGridSize = Math.max(scaledGridSize, 10);
  const gridOpacity = Math.max(0.2, Math.min(0.6, zoom * 0.4)); // More visible

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{
        backgroundColor: 'rgba(248, 250, 252, 0.5)', // Light background to ensure visibility
        backgroundImage: `
          radial-gradient(circle, rgba(59, 130, 246, ${gridOpacity * 0.8}) 1px, transparent 1px),
          linear-gradient(rgba(148, 163, 184, ${gridOpacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, ${gridOpacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${minGridSize * 4}px ${minGridSize * 4}px, ${minGridSize}px ${minGridSize}px, ${minGridSize}px ${minGridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    >
      {/* Debug info - always visible for now */}
      <div className="absolute top-4 left-4 text-xs text-slate-800 dark:text-slate-200 bg-yellow-200/90 dark:bg-yellow-800/90 px-2 py-1 rounded border">
        Grid: {Math.round(scaledGridSize)}px | Zoom: {zoom.toFixed(2)} | Pan: ({pan.x.toFixed(0)}, {pan.y.toFixed(0)})
      </div>
    </div>
  );
};
