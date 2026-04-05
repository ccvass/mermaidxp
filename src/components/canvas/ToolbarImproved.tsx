import React, { useState, useRef, memo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  zoomIn,
  zoomOut,
  resetZoom,
  setPlacingElement,
  toggleInteractionMode,
  fitToViewport,
} from '../../store/slices/canvasSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { SVGShapesPanel } from './SVGShapesPanel';
import { SVGShapeDefinition } from '../../types/svg-shapes.types';
import { ImagePanel, ImageDefinition } from './ImagePanel';
import TextPanel from './TextPanel';
import { IconsPanel } from './IconsPanel';

import {
  ShapesIcon,
  ImageIcon,
  TextIcon,
  IconIcon,
  UndoIcon,
  RedoIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetZoomIcon,
  DragIcon,
  PanIcon,
  FitToScreenIcon,
} from '../icons/ToolbarIcons';
import { togglePresentationMode } from '../../store/slices/uiSlice';

// Enhanced Toolbar Button with better styling
interface ToolbarButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  isActive?: boolean;
  title?: string;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const ToolbarButton = memo(
  React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    ({ onClick, children, label, isActive, title, disabled, variant = 'default', size = 'md' }, ref) => {
      const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
      };

      const variantClasses = {
        default: isActive
          ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
          : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
        primary: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        success: 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
        danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
      };

      return (
        <button
          ref={ref}
          onClick={onClick}
          aria-label={label}
          title={title || label}
          disabled={disabled}
          className={`
          ${sizeClasses[size]}
          ${
            disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-600'
              : variantClasses[variant]
          }
          rounded-lg transition-all duration-200 transform hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          flex items-center justify-center
          border border-gray-200 dark:border-gray-600
          shadow-sm hover:shadow-md
          gap-1.5
        `}
        >
          {children}
          {label && size !== 'sm' && (
            <span className="text-xs font-medium hidden sm:inline">{label}</span>
          )}
        </button>
      );
    }
  )
);

ToolbarButton.displayName = 'ToolbarButton';

// Toolbar Separator
const ToolbarSeparator = () => (
  <div className="h-10 w-px bg-gray-300 dark:bg-gray-500 mx-2" />
);

// Presentation Icon
const PresentationIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
);

// Main Improved Toolbar Component
export const ToolbarImproved: React.FC = () => {
  const dispatch = useAppDispatch();
  const { zoom, interactionMode } = useAppSelector((state) => state.canvas);
  const { undo, redo, canUndo, canRedo } = useHistoryEngine();

  const [isShapesPanelOpen, setIsShapesPanelOpen] = useState(false);
  const [isIconsPanelOpen, setIsIconsPanelOpen] = useState(false);
  const [isImagesPanelOpen, setIsImagesPanelOpen] = useState(false);
  const [isTextPanelOpen, setIsTextPanelOpen] = useState(false);

  const shapesButtonRef = useRef<HTMLButtonElement>(null);
  const iconsButtonRef = useRef<HTMLButtonElement>(null);
  const imagesButtonRef = useRef<HTMLButtonElement>(null);
  const textButtonRef = useRef<HTMLButtonElement>(null);

  // Zoom handlers
  const handleZoomIn = () => {
    dispatch(zoomIn());
    dispatch(showNotification({ message: `Zoom: ${Math.round((zoom + 0.1) * 100)}%`, type: 'info' }));
  };

  const handleZoomOut = () => {
    dispatch(zoomOut());
    dispatch(showNotification({ message: `Zoom: ${Math.round((zoom - 0.1) * 100)}%`, type: 'info' }));
  };

  const handleResetZoom = () => {
    dispatch(resetZoom());
    dispatch(showNotification({ message: 'Zoom reset to 100%', type: 'info' }));
  };

  const handleFitToScreen = () => {
    const container = document.getElementById('mermaid-container');
    const svg = container?.querySelector('svg');
    if (container && svg) {
      const containerRect = container.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      dispatch(
        fitToViewport({
          diagramBounds: { width: svgRect.width, height: svgRect.height },
          viewportBounds: { width: containerRect.width, height: containerRect.height },
        })
      );
      dispatch(showNotification({ message: 'Fit to screen', type: 'info' }));
    }
  };

  // History handlers
  const handleUndo = () => {
    undo();
    dispatch(showNotification({ message: 'Undo', type: 'info' }));
  };

  const handleRedo = () => {
    redo();
    dispatch(showNotification({ message: 'Redo', type: 'info' }));
  };

  // Element placement handlers
  const toggleShapesPanel = () => {
    setIsShapesPanelOpen(!isShapesPanelOpen);
    setIsIconsPanelOpen(false);
    setIsImagesPanelOpen(false);
    setIsTextPanelOpen(false);
  };

  const handleAddElement = (type: 'image' | 'text' | 'icon') => {
    // Close all panels first
    setIsShapesPanelOpen(false);
    setIsIconsPanelOpen(false);
    setIsImagesPanelOpen(false);
    setIsTextPanelOpen(false);

    // Open the appropriate panel
    switch (type) {
      case 'icon':
        setIsIconsPanelOpen(true);
        break;
      case 'image':
        setIsImagesPanelOpen(true);
        break;
      case 'text':
        setIsTextPanelOpen(true);
        break;
    }
  };

  // Interaction mode handler
  const toggleInteractionModeHandler = () => {
    dispatch(toggleInteractionMode());
    const newMode = interactionMode === 'drag' ? 'pan' : 'drag';
    dispatch(
      showNotification({
        message: `${newMode === 'pan' ? 'Pan' : 'Drag'} mode activated`,
        type: 'info',
      })
    );
  };

  // Presentation mode handler
  const handlePresentationMode = () => {
    dispatch(togglePresentationMode());
    dispatch(
      showNotification({
        message: 'Presentation mode toggled. Press ESC to exit.',
        type: 'info',
      })
    );
  };

  // Shape selection handlers
  const handleShapeSelected = (shape: SVGShapeDefinition) => {
    dispatch(setPlacingElement({ type: 'svg-shape', svgShapeDefinition: shape }));
    setIsShapesPanelOpen(false);
    dispatch(
      showNotification({
        message: `Click on the canvas to place ${shape.name}`,
        type: 'info',
      })
    );
  };

  const handleIconSelected = (icon: string) => {
    dispatch(setPlacingElement({ type: 'icon', iconContent: icon }));
    setIsIconsPanelOpen(false);
    dispatch(
      showNotification({
        message: `Click on the canvas to place ${icon}`,
        type: 'info',
      })
    );
  };

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm"
        data-toolbar
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left Section - Shape & Element Tools */}
          <div className="flex items-center gap-1">
            {/* Element Tools */}
            <ToolbarButton
              ref={shapesButtonRef}
              onClick={toggleShapesPanel}
              label="Shapes"
              title="Add SVG shapes"
              isActive={isShapesPanelOpen}
            >
              <ShapesIcon size={18} />
            </ToolbarButton>

            <ToolbarButton
              ref={imagesButtonRef}
              onClick={() => handleAddElement('image')}
              label="Image"
              title="Add image"
              isActive={isImagesPanelOpen}
            >
              <ImageIcon size={18} />
            </ToolbarButton>

            <ToolbarButton
              ref={textButtonRef}
              onClick={() => handleAddElement('text')}
              label="Text"
              title="Add text"
              isActive={isTextPanelOpen}
            >
              <TextIcon size={18} />
            </ToolbarButton>

            <ToolbarButton
              ref={iconsButtonRef}
              onClick={() => handleAddElement('icon')}
              label="Icon"
              title="Add icon/emoji"
              isActive={isIconsPanelOpen}
            >
              <IconIcon size={18} />
            </ToolbarButton>
          </div>

          {/* Center Section - History & Interaction */}
          <div className="flex items-center gap-1">
            <ToolbarSeparator />

            {/* History Controls */}
            <ToolbarButton
              onClick={handleUndo}
              label="Undo"
              title={`Undo (${canUndo ? 'Ctrl+Z' : 'Nothing to undo'})`}
              disabled={!canUndo}
            >
              <UndoIcon size={18} />
            </ToolbarButton>

            <ToolbarButton
              onClick={handleRedo}
              label="Redo"
              title={`Redo (${canRedo ? 'Ctrl+Y' : 'Nothing to redo'})`}
              disabled={!canRedo}
            >
              <RedoIcon size={18} />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Interaction Mode */}
            <ToolbarButton
              onClick={toggleInteractionModeHandler}
              label={interactionMode === 'drag' ? 'Drag Mode' : 'Pan Mode'}
              title={`Current: ${interactionMode === 'drag' ? 'Drag elements' : 'Pan canvas'} (Click to switch)`}
              isActive={interactionMode === 'drag'}
              variant={interactionMode === 'drag' ? 'success' : 'primary'}
            >
              {interactionMode === 'drag' ? <DragIcon size={18} /> : <PanIcon size={18} />}
            </ToolbarButton>
          </div>

          {/* Right Section - View Controls */}
          <div className="flex items-center gap-1">
            <ToolbarSeparator />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
              <ToolbarButton onClick={handleZoomOut} label="Zoom out" title="Zoom out (Ctrl+-)" size="sm">
                <ZoomOutIcon size={16} />
              </ToolbarButton>

              <span className="px-3 min-w-[65px] text-center text-sm font-bold text-gray-700 dark:text-gray-200 tabular-nums">
                {Math.round(zoom * 100)}%
              </span>

              <ToolbarButton onClick={handleZoomIn} label="Zoom in" title="Zoom in (Ctrl++)" size="sm">
                <ZoomInIcon size={16} />
              </ToolbarButton>
            </div>

            <ToolbarButton onClick={handleResetZoom} label="Reset zoom" title="Reset zoom to 100%">
              <ResetZoomIcon size={18} />
            </ToolbarButton>

            <ToolbarButton onClick={handleFitToScreen} label="Fit to screen" title="Fit diagram to screen">
              <FitToScreenIcon size={18} />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Presentation Mode */}
            <ToolbarButton
              onClick={handlePresentationMode}
              label="Presentation Mode"
              title="Toggle presentation mode (Hide UI)"
              variant="primary"
            >
              <PresentationIcon size={18} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Panels */}
      {isShapesPanelOpen && (
        <SVGShapesPanel
          isOpen={isShapesPanelOpen}
          onClose={() => setIsShapesPanelOpen(false)}
          onShapeSelected={handleShapeSelected}
          targetRef={shapesButtonRef}
        />
      )}

      {isIconsPanelOpen && (
        <IconsPanel
          isOpen={isIconsPanelOpen}
          onClose={() => setIsIconsPanelOpen(false)}
          onIconSelected={(iconDef) => handleIconSelected(iconDef.icon)}
          targetRef={iconsButtonRef}
        />
      )}

      {isImagesPanelOpen && (
        <ImagePanel
          isOpen={isImagesPanelOpen}
          onClose={() => setIsImagesPanelOpen(false)}
          onImageSelected={(image: ImageDefinition) => {
            const width = image.width ?? 100;
            const height = image.height ?? 100;
            dispatch(
              setPlacingElement({
                type: 'image',
                imageDefinition: {
                  url: image.url,
                  altText: image.altText,
                  width,
                  height,
                },
              })
            );
            setIsImagesPanelOpen(false);
            dispatch(
              showNotification({
                message: 'Click on the canvas to place image',
                type: 'info',
              })
            );
          }}
          targetRef={imagesButtonRef}
        />
      )}

      {isTextPanelOpen && (
        <TextPanel
          isOpen={isTextPanelOpen}
          onClose={() => setIsTextPanelOpen(false)}
          onTextSelected={(textDef) => {
            dispatch(
              setPlacingElement({
                type: 'text',
                textDefinition: textDef,
              })
            );
            setIsTextPanelOpen(false);
            dispatch(
              showNotification({
                message: 'Click on the canvas to place text',
                type: 'info',
              })
            );
          }}
          targetRef={textButtonRef}
        />
      )}
    </>
  );
};

export default ToolbarImproved;
