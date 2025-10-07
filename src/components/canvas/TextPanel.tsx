import React, { useRef, useState } from 'react';
import ToolbarPanel from './ToolbarPanel';
import { applyToolbarDragData } from '../../features/canvas/utils/toolbarDrag';
import { MODAL_DESIGN_TOKENS, buildInputClasses, buildButtonClasses, cn } from './modalDesignTokens';

interface TextDefinition {
  content: string;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  backgroundColor: string;
  padding: number;
  borderRadius: number;
}

interface TextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTextSelected: (textData: TextDefinition) => void;
  targetRef?: React.RefObject<HTMLButtonElement | null>;
}

const TextPanel: React.FC<TextPanelProps> = ({ isOpen, onClose, onTextSelected, targetRef }) => {
  const [textContent, setTextContent] = useState('Sample Text');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#000000');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textDecoration, setTextDecoration] = useState<'none' | 'underline'>('none');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [padding, setPadding] = useState(4);
  const [borderRadius, setBorderRadius] = useState(0);
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

  const buildCurrentTextDefinition = (): TextDefinition => ({
    content: textContent,
    fontSize,
    color,
    fontWeight,
    fontStyle,
    textDecoration,
    backgroundColor,
    padding,
    borderRadius,
  });

  const handleTextDragStart = (event: React.DragEvent<HTMLElement>, definition: TextDefinition) => {
    isDraggingRef.current = true;
    const pointerAnchor = calculatePointerAnchor(event);
    applyToolbarDragData(event.dataTransfer, {
      type: 'text',
      payload: definition,
      pointerAnchor,
    });
  };

  const resetDragFlag = () => {
    requestAnimationFrame(() => {
      isDraggingRef.current = false;
    });
  };

  const preventClickAfterDrag = (event: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    resetDragFlag();
  };

  if (!isOpen) {
    return null;
  }

  const handleAddText = () => {
    const textData = buildCurrentTextDefinition();

    onTextSelected(textData);
    onClose();
  };

  const quickTexts = [
    { label: 'Title', content: 'Main Title', fontSize: 24, fontWeight: 'bold' as const },
    { label: 'Subtitle', content: 'Subtitle', fontSize: 18, fontWeight: 'normal' as const },
    { label: 'Label', content: 'Label', fontSize: 14, fontWeight: 'normal' as const },
    {
      label: 'Note',
      content: 'Important Note',
      fontSize: 12,
      fontWeight: 'normal' as const,
      fontStyle: 'italic' as const,
    },
    { label: 'Warning', content: '⚠️ Warning', fontSize: 16, color: '#f59e0b', backgroundColor: '#fef3c7' },
    { label: 'Success', content: '✅ Success', fontSize: 16, color: '#10b981', backgroundColor: '#d1fae5' },
  ];

  return (
    <ToolbarPanel isOpen={isOpen} onClose={onClose} title="Add Text" targetRef={targetRef} widthClass="w-96">
      {/* HEADER SECTION - Fixed */}
      <div className="flex-shrink-0">
        {/* Description */}
        <p className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'mb-4')}>
          Create custom text elements with full styling control
        </p>
      </div>

      {/* CONTENT SECTION - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
        {/* Quick Text Templates */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Quick Templates:</label>
          <div className="grid grid-cols-2 gap-2">
            {quickTexts.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  setTextContent(template.content);
                  setFontSize(template.fontSize);
                  setFontWeight(template.fontWeight ?? 'normal');
                  setFontStyle(template.fontStyle || 'normal');
                  setColor((template as any).color || '#000000');
                  setBackgroundColor((template as any).backgroundColor || 'transparent');
                }}
                className={buildButtonClasses('tertiary')}
                draggable
                onDragStart={(event) =>
                  handleTextDragStart(event, {
                    content: template.content,
                    fontSize: template.fontSize,
                    color: (template as any).color || '#000000',
                    fontWeight: (template as any).fontWeight ?? 'normal',
                    fontStyle: template.fontStyle || 'normal',
                    textDecoration: (template as any).textDecoration || 'none',
                    backgroundColor: (template as any).backgroundColor || 'transparent',
                    padding,
                    borderRadius,
                  })
                }
                onDragEnd={resetDragFlag}
                onClickCapture={preventClickAfterDrag}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Content */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>Text Content:</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter your text..."
            rows={3}
            className={cn(buildInputClasses(), 'resize-none')}
          />
        </div>

        {/* Font Size */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>Font Size: {fontSize}px</label>
          <input
            type="range"
            min="10"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10px</span>
            <span>48px</span>
          </div>
        </div>

        {/* Text Color */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>Text Color:</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={buildInputClasses()}
            />
          </div>
        </div>

        {/* Font Style Controls */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Text Style:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
              className={buildButtonClasses(fontWeight === 'bold' ? 'primary' : 'tertiary')}
            >
              <strong>B</strong> Bold
            </button>
            <button
              onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
              className={buildButtonClasses(fontStyle === 'italic' ? 'primary' : 'tertiary')}
            >
              <em>I</em> Italic
            </button>
            <button
              onClick={() => setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline')}
              className={buildButtonClasses(textDecoration === 'underline' ? 'primary' : 'tertiary')}
            >
              <u>U</u> Underline
            </button>
          </div>
        </div>

        {/* Background Color */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>Background Color:</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="transparent"
              className={buildInputClasses()}
            />
            <button
              onClick={() => setBackgroundColor('transparent')}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Padding */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>Padding: {padding}px</label>
          <input
            type="range"
            min="0"
            max="20"
            value={padding}
            onChange={(e) => setPadding(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Border Radius */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>
            Border Radius: {borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={borderRadius}
            onChange={(e) => setBorderRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Preview */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-1')}>Preview:</label>
          <div
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded border text-center"
            draggable
            onDragStart={(event) => handleTextDragStart(event, buildCurrentTextDefinition())}
            onDragEnd={resetDragFlag}
            onClickCapture={preventClickAfterDrag}
          >
            <span
              style={{
                fontSize: `${fontSize}px`,
                color,
                fontWeight,
                fontStyle,
                textDecoration,
                backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
                padding: `${padding}px`,
                borderRadius: `${borderRadius}px`,
                display: 'inline-block',
              }}
            >
              {textContent || 'Sample Text'}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER SECTION - Fixed */}
      <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className={buildButtonClasses('secondary')}>
            Cancel
          </button>
          <button
            onClick={handleAddText}
            disabled={!textContent.trim()}
            className={cn(buildButtonClasses('primary'), MODAL_DESIGN_TOKENS.input.disabled)}
          >
            Add Text
          </button>
        </div>
      </div>
    </ToolbarPanel>
  );
};

export default TextPanel;
