/**
 * Modal Design System - Consistent styling across all toolbar modals
 */

export const MODAL_DESIGN_TOKENS = {
  // Spacing
  spacing: {
    panel: 'p-4',
    section: 'mb-4',
    sectionSmall: 'mb-3',
    gridGap: 'gap-3',
    itemPadding: 'p-3',
  },

  // Typography
  typography: {
    headerDescription: 'text-sm text-gray-600 dark:text-gray-400',
    label: 'text-xs font-medium text-gray-700 dark:text-gray-300',
    caption: 'text-xs text-gray-500 dark:text-gray-400',
    itemName: 'text-xs text-gray-600 dark:text-gray-400',
  },

  // Inputs
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    small: 'px-3 py-1.5 text-sm',
  },

  // Buttons
  button: {
    primary:
      'px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm',
    secondary:
      'px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors',
    tertiary:
      'px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 transition-colors',
    icon: 'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors',
  },

  // Category Pills
  categoryPill: {
    base: 'px-3 py-1.5 text-xs rounded-full font-medium transition-colors cursor-pointer',
    idle: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
    active: 'bg-blue-500 dark:bg-blue-600 text-white',
  },

  // Grid Items
  gridItem: {
    base: 'group relative flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer',
    idle: 'border-gray-200 dark:border-gray-700',
    hover:
      'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm',
    active: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
    dragging: 'opacity-50',
  },

  // Search Input
  searchInput: {
    wrapper: 'relative mb-3',
    input:
      'w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4',
  },

  // Preview Box
  preview: {
    container: 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50',
    title: 'text-xs font-medium text-gray-700 dark:text-gray-300 mb-2',
  },

  // File Upload
  fileUpload: {
    button:
      'w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-sm text-gray-600 dark:text-gray-400 cursor-pointer',
  },

  // Empty State
  emptyState: {
    container: 'text-center py-8 text-gray-500 dark:text-gray-400',
    icon: 'text-4xl mb-2',
    title: 'font-medium',
    description: 'text-sm',
  },

  // Divider
  divider: 'border-t border-gray-200 dark:border-gray-700',
};

// Helper function to combine classes
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Reusable component class builders
export const buildInputClasses = (error?: boolean) => {
  return cn(
    MODAL_DESIGN_TOKENS.input.base,
    MODAL_DESIGN_TOKENS.input.focus,
    error && 'border-red-500 focus:ring-red-500'
  );
};

export const buildButtonClasses = (variant: 'primary' | 'secondary' | 'tertiary' | 'icon' = 'primary') => {
  return MODAL_DESIGN_TOKENS.button[variant];
};

export const buildGridItemClasses = (isActive?: boolean, isDragging?: boolean) => {
  return cn(
    MODAL_DESIGN_TOKENS.gridItem.base,
    !isActive && MODAL_DESIGN_TOKENS.gridItem.idle,
    MODAL_DESIGN_TOKENS.gridItem.hover,
    isActive && MODAL_DESIGN_TOKENS.gridItem.active,
    isDragging && MODAL_DESIGN_TOKENS.gridItem.dragging
  );
};

export const buildCategoryPillClasses = (isActive?: boolean) => {
  return cn(
    MODAL_DESIGN_TOKENS.categoryPill.base,
    isActive ? MODAL_DESIGN_TOKENS.categoryPill.active : MODAL_DESIGN_TOKENS.categoryPill.idle
  );
};
