import React, { useState, useCallback, useMemo } from 'react';
import { ShapeDefinition, ShapeLibrary } from '../../types/shapes.types';
import { useShapeLibrary } from '../../hooks/useShapeLibrary';

interface ShapeSearchAndFilterProps {
  onFiltersChange?: (filteredShapes: ShapeDefinition[]) => void;
  className?: string;
}

export const ShapeSearchAndFilter: React.FC<ShapeSearchAndFilterProps> = ({ onFiltersChange, className = '' }) => {
  const {
    filteredShapes,
    searchFilters,
    selectedCategory,
    categoriesWithCounts,
    enabledLibraries,
    setSearchFilters,
    setSelectedCategory,
    updateSearchQuery,
    clearFilters,
    toggleLibrary,
  } = useShapeLibrary();

  const [isExpanded, setIsExpanded] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    resizable: false,
    rotatable: false,
    recent: false,
  });

  // Notify parent of filter changes
  React.useEffect(() => {
    onFiltersChange?.(filteredShapes);
  }, [filteredShapes, onFiltersChange]);

  // Quick filter handlers
  const handleQuickFilter = useCallback(
    (filter: keyof typeof quickFilters) => {
      const newQuickFilters = { ...quickFilters, [filter]: !quickFilters[filter] };
      setQuickFilters(newQuickFilters);

      // Apply quick filters to search filters
      setSearchFilters({
        ...searchFilters,
        isResizable: newQuickFilters.resizable ? true : undefined,
        isRotatable: newQuickFilters.rotatable ? true : undefined,
      });
    },
    [quickFilters, searchFilters, setSearchFilters]
  );

  // Popular categories (most used)
  const popularCategories = useMemo(() => {
    return categoriesWithCounts.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [categoriesWithCounts]);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchFilters.query}
            onChange={(e) => updateSearchQuery(e.target.value)}
            placeholder="Search shapes by name, description, or tags..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchFilters.query && (
            <button
              onClick={() => updateSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Quick filters:</span>
            <button
              onClick={() => handleQuickFilter('resizable')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                quickFilters.resizable
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📏 Resizable
            </button>
            <button
              onClick={() => handleQuickFilter('rotatable')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                quickFilters.rotatable
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🔄 Rotatable
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredShapes.length} shapes</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Popular Categories (Always Visible) */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Popular Categories</h4>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs px-2 py-1 rounded ${
              selectedCategory === 'all'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
              <span className="ml-2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* All Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">All Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center justify-between p-2 rounded text-sm transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Libraries */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Libraries</h4>
            <div className="grid grid-cols-3 gap-2">
              {['mermaid', 'custom', 'd3', 'lucidchart', 'aws', 'azure', 'gcp', 'kubernetes', 'bpmn'].map((library) => (
                <label key={library} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={enabledLibraries.includes(library as ShapeLibrary)}
                    onChange={() => toggleLibrary(library as ShapeLibrary)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{library}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Properties */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Properties</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchFilters.isResizable === true}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      isResizable: e.target.checked ? true : undefined,
                    })
                  }
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Resizable shapes only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchFilters.isRotatable === true}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      isRotatable: e.target.checked ? true : undefined,
                    })
                  }
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rotatable shapes only</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSearchAndFilter;
