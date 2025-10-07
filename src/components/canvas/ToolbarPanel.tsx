import React, { useEffect, useRef, useState } from 'react';

interface ToolbarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  targetRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  className?: string;
  widthClass?: string; // optional width utility classes like w-96 or min-w-[400px]
  style?: React.CSSProperties;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  targetRef,
  children,
  className,
  widthClass = 'w-96',
  style,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 70, left: 20 });

  // Close on outside click (excluding targetRef)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const panelEl = panelRef.current;
      const anchorEl = targetRef?.current;

      const clickedInsidePanel = !!panelEl && panelEl.contains(target);
      const clickedAnchor = !!anchorEl && anchorEl.contains(target);

      if (!clickedInsidePanel && !clickedAnchor) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Positioning relative to targetRef with viewport clamping
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const anchor = targetRef?.current;
      const margin = 8;
      const defaultWidth = 384; // Tailwind w-96 default

      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const panelWidth = panelRef.current?.offsetWidth || defaultWidth;
        let left = Math.min(Math.max(rect.left, margin), Math.max(margin, window.innerWidth - panelWidth - margin));
        let top = rect.bottom + margin; // prefer below

        // If panel would overflow bottom significantly, try placing above
        const approxHeight = panelRef.current?.offsetHeight || 400;
        if (top + approxHeight > window.innerHeight - margin && rect.top - approxHeight - margin > margin) {
          top = Math.max(margin, rect.top - approxHeight - margin);
        }
        setCoords({ top, left });
      } else {
        // Fallback position
        setCoords({ top: 70, left: 20 });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, targetRef]);

  if (!isOpen) return null;

  const maxHeightStyle: React.CSSProperties = {
    maxHeight: `calc(100vh - ${coords.top + 16}px)`,
    overflowY: 'auto',
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      className={[
        'fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl',
        'flex flex-col',
        widthClass,
        className || '',
      ].join(' ')}
      style={{ top: coords.top, left: coords.left, ...maxHeightStyle, ...style }}
      onMouseDown={(e) => {
        // Prevent panel interactions from bubbling to canvas
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            {icon}
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close panel"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-4">{children}</div>
    </div>
  );
};

export default ToolbarPanel;
