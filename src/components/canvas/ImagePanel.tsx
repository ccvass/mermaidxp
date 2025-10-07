import React, { useEffect, useRef, useState } from 'react';
import ToolbarPanel from './ToolbarPanel';
import { applyToolbarDragData } from '../../features/canvas/utils/toolbarDrag';
import {
  MODAL_DESIGN_TOKENS,
  buildInputClasses,
  buildButtonClasses,
  buildGridItemClasses,
  cn,
} from './modalDesignTokens';

export interface ImageDefinition {
  url: string;
  altText: string;
  width?: number;
  height?: number;
}

interface ImagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (image: ImageDefinition) => void;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ isOpen, onClose, onImageSelected, targetRef }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const [previewUrl, setPreviewUrl] = useState('');
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

  // Reset form when panel opens
  useEffect(() => {
    if (isOpen) {
      setImageUrl('');
      setAltText('');
      setImageSize({ width: 100, height: 100 });
      setPreviewUrl('');
    }
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
        setPreviewUrl(result);
        if (!altText) {
          setAltText(file.name.split('.')[0]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleDragStart = (event: React.DragEvent<HTMLElement>, definition: ImageDefinition) => {
    isDraggingRef.current = true;
    const pointerAnchor = calculatePointerAnchor(event);
    applyToolbarDragData(event.dataTransfer, {
      type: 'image',
      payload: {
        url: definition.url,
        altText: definition.altText,
        width: definition.width,
        height: definition.height,
      },
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

  const handleSubmit = () => {
    if (imageUrl.trim()) {
      onImageSelected({
        url: imageUrl.trim(),
        altText: altText.trim() || 'Image',
        width: imageSize.width,
        height: imageSize.height,
      });
      onClose();
    }
  };

  const predefinedImages = [
    {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRGNDZFNSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QVBJPC90ZXh0Pjwvc3ZnPg==',
      alt: 'API Service',
    },
    {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzA1OTY2OSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REI8L3RleHQ+PC9zdmc+',
      alt: 'Database',
    },
    {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0RDMjYyNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VUk8L3RleHQ+PC9zdmc+',
      alt: 'User Interface',
    },
    {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzdDM0FFRCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QVBQPC90ZXh0Pjwvc3ZnPg==',
      alt: 'Application',
    },
    {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VBNTgwQyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1JWPC90ZXh0Pjwvc3ZnPg==',
      alt: 'Server',
    },
    {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzA4OTFCMiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q0ROPC90ZXh0Pjwvc3ZnPg==',
      alt: 'CDN',
    },
  ];

  if (!isOpen) return null;

  return (
    <ToolbarPanel isOpen={isOpen} onClose={onClose} title="Add Image" targetRef={targetRef} widthClass="w-[420px]">
      {/* HEADER SECTION - Fixed */}
      <div className="flex-shrink-0">
        {/* Description */}
        <p className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'mb-4')}>
          Upload images or use URLs to add visual elements to your diagram
        </p>
      </div>

      {/* CONTENT SECTION - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
        {/* File Upload */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Upload Image File</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className={MODAL_DESIGN_TOKENS.fileUpload.button}>
            📁 Click to upload image file
          </button>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Or Enter Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={buildInputClasses()}
          />
        </div>

        {/* Predefined Images */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Quick Select</label>
          <div className="grid grid-cols-3 gap-2">
            {predefinedImages.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  handleUrlChange(img.url);
                  setAltText(img.alt);
                }}
                className={buildGridItemClasses()}
                title={img.alt}
                draggable
                onDragStart={(event) =>
                  handleDragStart(event, {
                    url: img.url,
                    altText: img.alt,
                    width: imageSize.width,
                    height: imageSize.height,
                  })
                }
                onDragEnd={resetDragFlag}
                onClickCapture={preventClickAfterDrag}
              >
                <img src={img.url} alt={img.alt} className="w-full h-12 object-cover rounded" />
                <div className={cn(MODAL_DESIGN_TOKENS.typography.itemName, 'mt-1 truncate')}>{img.alt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-4">
            <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Preview</label>
            <div
              className={cn(MODAL_DESIGN_TOKENS.preview.container, 'p-2')}
              draggable
              onDragStart={(event) =>
                handleDragStart(event, {
                  url: imageUrl || previewUrl,
                  altText: altText || 'Image',
                  width: imageSize.width,
                  height: imageSize.height,
                })
              }
              onDragEnd={resetDragFlag}
              onClickCapture={preventClickAfterDrag}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-20 object-contain mx-auto rounded"
                onError={() => setPreviewUrl('')}
              />
            </div>
          </div>
        )}

        {/* Alt Text */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>Alt Text (Optional)</label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image..."
            className={buildInputClasses()}
          />
        </div>

        {/* Size Controls - Enhanced */}
        <div className="mb-4">
          <label className={cn(MODAL_DESIGN_TOKENS.typography.label, 'block mb-2')}>📏 Image Size Controls</label>

          {/* Quick Size Presets */}
          <div className="mb-3">
            <label className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'block mb-1')}>Quick Sizes:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Small', size: { width: 50, height: 50 } },
                { label: 'Medium', size: { width: 100, height: 100 } },
                { label: 'Large', size: { width: 150, height: 150 } },
                { label: 'XL', size: { width: 200, height: 200 } },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setImageSize(preset.size)}
                  className={buildButtonClasses(
                    imageSize.width === preset.size.width && imageSize.height === preset.size.height
                      ? 'primary'
                      : 'tertiary'
                  )}
                >
                  {preset.label} ({preset.size.width}px)
                </button>
              ))}
            </div>
          </div>

          {/* Custom Size Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'block mb-1')}>Width (px)</label>
              <input
                type="number"
                value={imageSize.width}
                onChange={(e) => setImageSize((prev) => ({ ...prev, width: parseInt(e.target.value) || 50 }))}
                min="20"
                max="500"
                step="10"
                className={buildInputClasses()}
              />
            </div>
            <div>
              <label className={cn(MODAL_DESIGN_TOKENS.typography.caption, 'block mb-1')}>Height (px)</label>
              <input
                type="number"
                value={imageSize.height}
                onChange={(e) => setImageSize((prev) => ({ ...prev, height: parseInt(e.target.value) || 50 }))}
                min="20"
                max="500"
                step="10"
                className={buildInputClasses()}
              />
            </div>
          </div>

          {/* Aspect Ratio Controls */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <label className={MODAL_DESIGN_TOKENS.typography.caption}>Aspect Ratio:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const ratio = imageSize.width / imageSize.height;
                    setImageSize((prev) => ({ ...prev, height: Math.round(prev.width / ratio) }));
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-700"
                  title="Lock aspect ratio based on current dimensions"
                >
                  🔒 Lock
                </button>
                <button
                  onClick={() => setImageSize((prev) => ({ ...prev, height: prev.width }))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-700"
                  title="Make square (1:1 ratio)"
                >
                  ⬜ Square
                </button>
              </div>
            </div>
          </div>

          {/* Size Preview */}
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Preview Size:</div>
            <div
              className="mx-auto border-2 border-dashed border-gray-400 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500"
              style={{
                width: `${Math.min(imageSize.width, 100)}px`,
                height: `${Math.min(imageSize.height, 100)}px`,
              }}
            >
              {imageSize.width}×{imageSize.height}
            </div>
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
            onClick={handleSubmit}
            disabled={!imageUrl.trim()}
            className={cn(buildButtonClasses('primary'), MODAL_DESIGN_TOKENS.input.disabled)}
          >
            Add Image
          </button>
        </div>
      </div>
    </ToolbarPanel>
  );
};
