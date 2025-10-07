import React, { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setZoom, setPan } from '../../store/slices/canvasSlice';
import { showNotification } from '../../store/slices/uiSlice';

interface ViewControlsProps {
  className?: string;
}

export const ViewControls: React.FC<ViewControlsProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const zoom = useAppSelector((state) => state.canvas.zoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGridOptions, setShowGridOptions] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);

  // Fullscreen toggle
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          dispatch(
            showNotification({
              message: 'Entered fullscreen mode. Press ESC to exit.',
              type: 'info',
            })
          );
        })
        .catch((err) => {
          dispatch(
            showNotification({
              message: `Failed to enter fullscreen: ${err.message}`,
              type: 'error',
            })
          );
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        dispatch(
          showNotification({
            message: 'Exited fullscreen mode',
            type: 'info',
          })
        );
      });
    }
  }, [dispatch]);

  // Presentation mode (hide UI)
  const handlePresentationMode = useCallback(() => {
    // Hide sidebar and other UI elements
    const sidebar = document.querySelector('[data-sidebar]');
    const header = document.querySelector('header');
    const toolbar = document.querySelector('[data-toolbar]');

    if (sidebar) sidebar.classList.toggle('hidden');
    if (header) header.classList.toggle('hidden');
    if (toolbar) toolbar.classList.toggle('hidden');

    dispatch(
      showNotification({
        message: 'Presentation mode toggled. Click again to restore UI.',
        type: 'info',
      })
    );
  }, [dispatch]);

  // Reset view (zoom and pan)
  const handleResetView = useCallback(() => {
    dispatch(setZoom(1));
    dispatch(setPan({ x: 0, y: 0 }));
    dispatch(
      showNotification({
        message: 'View reset to default',
        type: 'success',
      })
    );
  }, [dispatch]);

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    // Calculate optimal zoom to fit diagram
    const container = document.querySelector('#mermaid-container') as HTMLElement | null;
    const diagram = (container?.querySelector('svg') as SVGElement | null) ?? null;

    if (container && diagram) {
      const containerRect = container.getBoundingClientRect();
      const diagramRect = diagram.getBoundingClientRect();

      const scaleX = containerRect.width / diagramRect.width;
      const scaleY = containerRect.height / diagramRect.height;
      const optimalZoom = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add some padding

      dispatch(setZoom(optimalZoom));
      dispatch(setPan({ x: 0, y: 0 }));
      dispatch(
        showNotification({
          message: 'Diagram fitted to screen',
          type: 'success',
        })
      );
    }
  }, [dispatch]);

  // Grid toggle
  const handleGridToggle = useCallback(() => {
    setGridEnabled(!gridEnabled);

    // Apply grid background to canvas
    const container = document.querySelector('#mermaid-container') as HTMLElement | null;
    if (container) {
      if (!gridEnabled) {
        container.style.backgroundImage = `
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `;
        container.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      } else {
        container.style.backgroundImage = 'none';
      }
    }

    dispatch(
      showNotification({
        message: `Grid ${!gridEnabled ? 'enabled' : 'disabled'}`,
        type: 'success',
      })
    );
  }, [gridEnabled, gridSize, dispatch]);

  // Minimap toggle
  const handleMinimapToggle = useCallback(() => {
    // This would toggle a minimap component
    dispatch(
      showNotification({
        message: 'Minimap feature coming soon!',
        type: 'info',
      })
    );
  }, [dispatch]);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Zoom Controls */}
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => dispatch(setZoom(Math.max(0.1, zoom - 0.1)))}
          className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => dispatch(setZoom(Math.min(3, zoom + 0.1)))}
          className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* View Actions */}
      <button
        onClick={handleResetView}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Reset View (Ctrl+0)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      <button
        onClick={handleFitToScreen}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Fit to Screen"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>

      {/* Grid Controls */}
      <div className="relative">
        <button
          onClick={() => setShowGridOptions(!showGridOptions)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            gridEnabled
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Grid Options"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Grid Options Dropdown */}
        {showGridOptions && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-3">
              <label className="flex items-center mb-3">
                <input type="checkbox" checked={gridEnabled} onChange={handleGridToggle} className="mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">Show Grid</span>
              </label>
              <div className="mb-2">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Grid Size</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{gridSize}px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Mode Controls */}
      <button
        onClick={handleFullscreen}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (F11)'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isFullscreen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          )}
        </svg>
      </button>

      <button
        onClick={handlePresentationMode}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Presentation Mode"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
          />
        </svg>
      </button>

      <button
        onClick={handleMinimapToggle}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Toggle Minimap"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </button>

      {/* Click outside to close dropdowns */}
      {showGridOptions && <div className="fixed inset-0 z-40" onClick={() => setShowGridOptions(false)} />}
    </div>
  );
};

export default ViewControls;
