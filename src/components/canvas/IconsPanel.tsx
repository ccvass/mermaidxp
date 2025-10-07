import React from 'react';
import ToolbarPanel from './ToolbarPanel';
import { applyToolbarDragData } from '../../features/canvas/utils/toolbarDrag';
import { MODAL_DESIGN_TOKENS, buildCategoryPillClasses, buildGridItemClasses, cn } from './modalDesignTokens';

export interface IconDefinition {
  name: string;
  icon: string;
  category: string;
  description: string;
}

const iconCategories = {
  Basic: [
    { name: 'Check', icon: '✅', category: 'Basic', description: 'Checkmark' },
    { name: 'Cross', icon: '❌', category: 'Basic', description: 'Cross mark' },
    { name: 'Warning', icon: '⚠️', category: 'Basic', description: 'Warning sign' },
    { name: 'Info', icon: 'ℹ️', category: 'Basic', description: 'Information' },
    { name: 'Question', icon: '❓', category: 'Basic', description: 'Question mark' },
    { name: 'Exclamation', icon: '❗', category: 'Basic', description: 'Exclamation' },
  ],
  Arrows: [
    { name: 'Up', icon: '⬆️', category: 'Arrows', description: 'Up arrow' },
    { name: 'Down', icon: '⬇️', category: 'Arrows', description: 'Down arrow' },
    { name: 'Left', icon: '⬅️', category: 'Arrows', description: 'Left arrow' },
    { name: 'Right', icon: '➡️', category: 'Arrows', description: 'Right arrow' },
    { name: 'Up-Right', icon: '↗️', category: 'Arrows', description: 'Up-right arrow' },
    { name: 'Down-Right', icon: '↘️', category: 'Arrows', description: 'Down-right arrow' },
  ],
  Tech: [
    { name: 'Computer', icon: '💻', category: 'Tech', description: 'Computer' },
    { name: 'Mobile', icon: '📱', category: 'Tech', description: 'Mobile phone' },
    { name: 'Server', icon: '🖥️', category: 'Tech', description: 'Server' },
    { name: 'Database', icon: '🗄️', category: 'Tech', description: 'Database' },
    { name: 'Cloud', icon: '☁️', category: 'Tech', description: 'Cloud' },
    { name: 'Gear', icon: '⚙️', category: 'Tech', description: 'Settings gear' },
  ],
  Business: [
    { name: 'User', icon: '👤', category: 'Business', description: 'User' },
    { name: 'Users', icon: '👥', category: 'Business', description: 'Multiple users' },
    { name: 'Building', icon: '🏢', category: 'Business', description: 'Office building' },
    { name: 'Chart', icon: '📊', category: 'Business', description: 'Chart' },
    { name: 'Money', icon: '💰', category: 'Business', description: 'Money' },
    { name: 'Target', icon: '🎯', category: 'Business', description: 'Target' },
  ],
  Communication: [
    { name: 'Email', icon: '📧', category: 'Communication', description: 'Email' },
    { name: 'Phone', icon: '📞', category: 'Communication', description: 'Phone' },
    { name: 'Message', icon: '💬', category: 'Communication', description: 'Message' },
    { name: 'Bell', icon: '🔔', category: 'Communication', description: 'Notification' },
    { name: 'Megaphone', icon: '📢', category: 'Communication', description: 'Announcement' },
    { name: 'Speech', icon: '💭', category: 'Communication', description: 'Thought bubble' },
  ],
  Actions: [
    { name: 'Play', icon: '▶️', category: 'Actions', description: 'Play' },
    { name: 'Pause', icon: '⏸️', category: 'Actions', description: 'Pause' },
    { name: 'Stop', icon: '⏹️', category: 'Actions', description: 'Stop' },
    { name: 'Search', icon: '🔍', category: 'Actions', description: 'Search' },
    { name: 'Edit', icon: '✏️', category: 'Actions', description: 'Edit' },
    { name: 'Delete', icon: '🗑️', category: 'Actions', description: 'Delete' },
  ],
};

const allIcons = Object.values(iconCategories).flat();

interface IconsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onIconSelected: (icon: IconDefinition) => void;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

export const IconsPanel: React.FC<IconsPanelProps> = ({ isOpen, onClose, onIconSelected, targetRef }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const isDraggingRef = React.useRef(false);

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

  if (!isOpen) return null;

  const filteredIcons =
    selectedCategory === 'All' ? allIcons : iconCategories[selectedCategory as keyof typeof iconCategories] || [];

  return (
    <ToolbarPanel isOpen={isOpen} onClose={onClose} title="Select Icon" targetRef={targetRef} widthClass="w-96">
      {/* HEADER SECTION - Fixed */}
      <div className="flex-shrink-0">
        {/* Description */}
        <p className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'mb-4')}>
          Choose from {allIcons.length} icons and emojis to enhance your diagrams
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={buildCategoryPillClasses(selectedCategory === 'All')}
          >
            All ({allIcons.length})
          </button>
          {Object.keys(iconCategories).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={buildCategoryPillClasses(selectedCategory === category)}
            >
              {category} ({iconCategories[category as keyof typeof iconCategories].length})
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT SECTION - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
        <div className="grid grid-cols-6 gap-3">
          {filteredIcons.map((iconDef, index) => (
            <button
              key={`${iconDef.category}-${index}`}
              onClick={() => onIconSelected(iconDef)}
              className={cn(buildGridItemClasses(false, isDraggingRef.current), 'flex-col justify-center group')}
              title={`${iconDef.name} - ${iconDef.description}`}
              draggable
              onDragStart={(event) => {
                isDraggingRef.current = true;
                const pointerAnchor = calculatePointerAnchor(event);
                applyToolbarDragData(event.dataTransfer, {
                  type: 'icon',
                  payload: {
                    icon: iconDef.icon,
                    name: iconDef.name,
                  },
                  pointerAnchor,
                });
              }}
              onDragEnd={() => {
                requestAnimationFrame(() => {
                  isDraggingRef.current = false;
                });
              }}
              onClickCapture={(event) => {
                if (isDraggingRef.current) {
                  event.preventDefault();
                  event.stopPropagation();
                  isDraggingRef.current = false;
                }
              }}
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{iconDef.icon}</div>
              <span className={cn(MODAL_DESIGN_TOKENS.typography.itemName, 'text-center')}>{iconDef.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER SECTION - Fixed */}
      <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-2">
          <label className={MODAL_DESIGN_TOKENS.typography.label}>Custom Icon/Emoji:</label>
          <input
            type="text"
            placeholder="Enter any emoji or Unicode character..."
            className={cn(MODAL_DESIGN_TOKENS.input.base, MODAL_DESIGN_TOKENS.input.focus, 'mt-1')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  onIconSelected({
                    name: 'Custom',
                    icon: value,
                    category: 'Custom',
                    description: 'Custom icon',
                  });
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
      </div>
    </ToolbarPanel>
  );
};
