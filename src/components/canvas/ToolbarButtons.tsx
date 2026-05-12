import React, { memo } from 'react';

// Enhanced Toolbar Button with better styling
export interface ToolbarButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  isActive?: boolean;
  title?: string;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ToolbarButton = memo(
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
          rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          flex items-center justify-center
          border border-gray-200 dark:border-gray-600
          shadow-sm hover:shadow-md
          gap-1.5
        `}
        >
          {children}
          {label && size !== 'sm' && <span className="text-xs font-medium hidden sm:inline">{label}</span>}
        </button>
      );
    }
  )
);

ToolbarButton.displayName = 'ToolbarButton';

// Toolbar Separator
export const ToolbarSeparator = () => <div className="h-10 w-px bg-gray-300 dark:bg-gray-500 mx-2" />;

// Presentation Icon
export const PresentationIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
);
