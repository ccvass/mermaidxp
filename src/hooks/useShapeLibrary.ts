import { useState, useMemo, useCallback } from 'react';
import { ShapeDefinition, ShapeCategory, ShapeSearchFilters, ShapeLibrary } from '../types/shapes.types';
import { SHAPE_LIBRARIES, DEFAULT_SEARCH_FILTERS, SHAPE_CATEGORIES } from '../constants/shapes.constants.tsx';

export interface UseShapeLibraryReturn {
  // State
  allShapes: ShapeDefinition[];
  filteredShapes: ShapeDefinition[];
  searchFilters: ShapeSearchFilters;
  selectedCategory: ShapeCategory | 'all';
  isLoading: boolean;
  error: string | null;

  // Actions
  setSearchFilters: (filters: ShapeSearchFilters) => void;
  setSelectedCategory: (category: ShapeCategory | 'all') => void;
  updateSearchQuery: (query: string) => void;
  clearFilters: () => void;
  toggleLibrary: (library: ShapeLibrary) => void;

  // Computed
  categoriesWithCounts: Array<{
    key: ShapeCategory;
    name: string;
    icon: string;
    description: string;
    count: number;
  }>;
  enabledLibraries: ShapeLibrary[];
  shapesByCategory: Record<ShapeCategory, ShapeDefinition[]>;
}

export const useShapeLibrary = (): UseShapeLibraryReturn => {
  const [searchFilters, setSearchFilters] = useState<ShapeSearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [selectedCategory, setSelectedCategory] = useState<ShapeCategory | 'all'>('all');
  const [enabledLibraries, setEnabledLibraries] = useState<ShapeLibrary[]>(
    SHAPE_LIBRARIES.filter((lib) => lib.isEnabled).map((lib) => lib.name as ShapeLibrary)
  );
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Get all shapes from enabled libraries
  const allShapes = useMemo(() => {
    return SHAPE_LIBRARIES.filter((library) => library.isEnabled)
      .sort((a, b) => a.loadPriority - b.loadPriority)
      .flatMap((library) => library.shapes);
  }, []);

  // Filter shapes based on search criteria
  const filteredShapes = useMemo(() => {
    let shapes = allShapes;

    // Filter by category
    if (selectedCategory !== 'all') {
      shapes = shapes.filter((shape) => shape.category === selectedCategory);
    }

    // Filter by search query
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      shapes = shapes.filter(
        (shape) =>
          shape.name.toLowerCase().includes(query) ||
          shape.description.toLowerCase().includes(query) ||
          shape.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by library
    if (searchFilters.library) {
      shapes = shapes.filter((shape) => shape.library === searchFilters.library);
    }

    // Filter by tags
    if (searchFilters.tags && searchFilters.tags.length > 0) {
      shapes = shapes.filter((shape) =>
        searchFilters.tags!.some((tag) =>
          shape.tags.some((shapeTag) => shapeTag.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }

    // Filter by properties
    if (searchFilters.isResizable !== undefined) {
      shapes = shapes.filter((shape) => shape.isResizable === searchFilters.isResizable);
    }

    if (searchFilters.isRotatable !== undefined) {
      shapes = shapes.filter((shape) => shape.isRotatable === searchFilters.isRotatable);
    }

    return shapes;
  }, [allShapes, selectedCategory, searchFilters]);

  // Get categories with shape counts
  const categoriesWithCounts = useMemo(() => {
    const counts = allShapes.reduce(
      (acc, shape) => {
        acc[shape.category] = (acc[shape.category] || 0) + 1;
        return acc;
      },
      {} as Record<ShapeCategory, number>
    );

    return Object.entries(SHAPE_CATEGORIES).map(([key, category]: [string, any]) => ({
      key: key as ShapeCategory,
      ...category,
      count: counts[key as ShapeCategory] || 0,
    }));
  }, [allShapes]);

  // Group shapes by category
  const shapesByCategory = useMemo(() => {
    return allShapes.reduce(
      (acc, shape) => {
        if (!acc[shape.category]) {
          acc[shape.category] = [];
        }
        acc[shape.category].push(shape);
        return acc;
      },
      {} as Record<ShapeCategory, ShapeDefinition[]>
    );
  }, [allShapes]);

  // Actions
  const updateSearchQuery = useCallback((query: string) => {
    setSearchFilters((prev) => ({ ...prev, query }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters(DEFAULT_SEARCH_FILTERS);
    setSelectedCategory('all');
  }, []);

  const toggleLibrary = useCallback((library: ShapeLibrary) => {
    setEnabledLibraries((prev) =>
      prev.includes(library) ? prev.filter((lib) => lib !== library) : [...prev, library]
    );
  }, []);

  return {
    // State
    allShapes,
    filteredShapes,
    searchFilters,
    selectedCategory,
    isLoading,
    error,

    // Actions
    setSearchFilters,
    setSelectedCategory,
    updateSearchQuery,
    clearFilters,
    toggleLibrary,

    // Computed
    categoriesWithCounts,
    enabledLibraries,
    shapesByCategory,
  };
};
