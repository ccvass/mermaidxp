import React, { useState, useMemo, useRef } from 'react';
import ToolbarPanel from './ToolbarPanel';
import { SVGShapeDefinition, SVGShapeCategory } from '../../types/svg-shapes.types';
import { SVG_SHAPES_LIBRARY, SVG_SHAPE_CATEGORIES } from '../../constants/svg-shapes.constants';
import { applyToolbarDragData } from '../../features/canvas/utils/toolbarDrag';
import { MODAL_DESIGN_TOKENS, buildCategoryPillClasses, buildGridItemClasses, cn } from './modalDesignTokens';

// Search Icon
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ? className : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const GridIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const ListIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

interface SVGShapesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onShapeSelected: (shape: SVGShapeDefinition) => void;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

// Static mapping for selected category colors (avoids dynamic Tailwind classes)
const selectedColorClasses: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

export const SVGShapesPanel: React.FC<SVGShapesPanelProps> = ({ isOpen, onClose, onShapeSelected, targetRef }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SVGShapeCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  const calculatePointerAnchor = (event: React.DragEvent<HTMLElement>) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
    const width = rect.width || 1;
    const height = rect.height || 1;

    return {
      x: clamp((event.clientX - rect.left) / width),
      y: clamp((event.clientY - rect.top) / height),
    };
  };

  // Filter shapes based on search and category
  const filteredShapes = useMemo(() => {
    let shapes = SVG_SHAPES_LIBRARY;

    if (selectedCategory !== 'all') {
      shapes = shapes.filter((shape) => shape.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      shapes = shapes.filter(
        (shape) =>
          shape.name.toLowerCase().includes(query) ||
          shape.description.toLowerCase().includes(query) ||
          shape.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return shapes;
  }, [searchQuery, selectedCategory]);

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts = SVG_SHAPES_LIBRARY.reduce(
      (acc, shape) => {
        acc[shape.category] = (acc[shape.category] || 0) + 1;
        return acc;
      },
      {} as Record<SVGShapeCategory, number>
    );

    return Object.entries(SVG_SHAPE_CATEGORIES).map(([key, category]) => ({
      key: key as SVGShapeCategory | 'all',
      ...category,
      count: key === 'all' ? SVG_SHAPES_LIBRARY.length : counts[key as SVGShapeCategory] || 0,
    }));
  }, []);

  const handleShapeClick = (shape: SVGShapeDefinition) => {
    if (isDraggingRef.current) {
      // Ignore click triggered after a drag gesture
      isDraggingRef.current = false;
      return;
    }
    onShapeSelected(shape);
    onClose();
  };

  const handleShapeDragStart = (event: React.DragEvent<HTMLElement>, shape: SVGShapeDefinition) => {
    isDraggingRef.current = true;
    const pointerAnchor = calculatePointerAnchor(event);
    applyToolbarDragData(event.dataTransfer, {
      type: 'svg-shape',
      payload: {
        shapeId: shape.id,
      },
      pointerAnchor,
    });
  };

  const handleShapeDragEnd = () => {
    // Delay reset to allow click prevention logic to see drag flag
    requestAnimationFrame(() => {
      isDraggingRef.current = false;
    });
  };

  if (!isOpen) return null;

  return (
    <ToolbarPanel isOpen={isOpen} onClose={onClose} title="SVG Shapes" targetRef={targetRef} widthClass="w-96">
      {/* HEADER SECTION - Fixed */}
      <div className="flex-shrink-0">
        {/* Description */}
        <p className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'mb-3')}>
          Browse and select from {SVG_SHAPES_LIBRARY.length} professional SVG shapes
        </p>

        {/* View toggle + search */}
        <div className="flex items-center justify-between mb-3">
          <div className={MODAL_DESIGN_TOKENS.typography.headerDescription}>Browse and insert shapes</div>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={MODAL_DESIGN_TOKENS.button.icon}
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <ListIcon /> : <GridIcon />}
          </button>
        </div>

        <div className={MODAL_DESIGN_TOKENS.searchInput.wrapper}>
          <SearchIcon className={MODAL_DESIGN_TOKENS.searchInput.icon} />
          <input
            type="text"
            placeholder="Search shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={MODAL_DESIGN_TOKENS.searchInput.input}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {categoriesWithCounts.map((category) => {
            const selected = selectedCategory === category.key;
            const selectedClasses = selectedColorClasses[category.color] || selectedColorClasses.gray;
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={cn(buildCategoryPillClasses(selected), selected && selectedClasses)}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
                <span className="ml-1 text-xs opacity-75">({category.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT SECTION - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
        {filteredShapes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p>No shapes found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-2'}>
            {filteredShapes.map((shape) => (
              <div
                key={shape.id}
                className={cn(
                  viewMode === 'grid'
                    ? buildGridItemClasses(false, isDraggingRef.current)
                    : 'p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer transition-all'
                )}
                onClick={() => handleShapeClick(shape)}
                onMouseEnter={() => setHoveredShape(shape.id)}
                onMouseLeave={() => setHoveredShape(null)}
                draggable
                onDragStart={(event) => handleShapeDragStart(event, shape)}
                onDragEnd={handleShapeDragEnd}
              >
                {/* Shape Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center text-gray-600 dark:text-gray-300',
                    viewMode === 'grid' && 'mb-2'
                  )}
                >
                  <shape.icon />
                </div>

                {/* Shape Info */}
                <div className={viewMode === 'grid' ? 'text-center' : 'flex-1'}>
                  <div
                    className={cn(
                      'font-medium text-gray-900 dark:text-white',
                      viewMode === 'grid' ? 'text-xs' : 'text-sm'
                    )}
                  >
                    {shape.name}
                  </div>
                  {viewMode === 'list' && (
                    <div className={MODAL_DESIGN_TOKENS.typography.caption}>{shape.description}</div>
                  )}
                </div>

                {/* Shape Properties Indicators */}
                <div className={`flex items-center space-x-1 ${viewMode === 'grid' ? 'absolute top-1 right-1' : ''}`}>
                  {shape.isResizable && <div className="w-2 h-2 bg-green-400 rounded-full" title="Resizable" />}
                  {shape.isRotatable && <div className="w-2 h-2 bg-blue-400 rounded-full" title="Rotatable" />}
                </div>

                {/* Hover Preview */}
                {hoveredShape === shape.id && viewMode === 'grid' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                    {shape.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER SECTION - Fixed */}
      <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{filteredShapes.length} SVG shapes available</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Resizable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Rotatable</span>
            </div>
          </div>
        </div>
      </div>
    </ToolbarPanel>
  );
};

export default SVGShapesPanel;
