import { useState, useCallback } from 'react';
import { ShapeDefinition } from '../../types/shapes.types';

export interface PlacingElementInfo {
  type: 'shape' | 'text' | 'icon' | 'image' | null;
  definition?: unknown;
}

export const useElementPlacement = (onAppendCode: (code: string) => void, onCancelElementPlacement: () => void) => {
  const [placingElementInfo, setPlacingElementInfo] = useState<PlacingElementInfo>({ type: null });

  const generateSafeId = (prefix: string = 'node') =>
    `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

  const handleInitiateElementPlacement = (elementType: PlacingElementInfo['type'], definition?: unknown) => {
    if (placingElementInfo.type === elementType && elementType !== 'shape') {
      setPlacingElementInfo({ type: null });
    } else {
      setPlacingElementInfo({ type: elementType, definition });
    }
  };

  const handlePlaceElement = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placingElementInfo.type) return;

      e.preventDefault();
      e.stopPropagation();
      let mermaidSyntax = '';
      const nodeId = generateSafeId(placingElementInfo.type);

      if (placingElementInfo.type === 'shape' && placingElementInfo.definition) {
        const shapeDef = placingElementInfo.definition as ShapeDefinition;
        const nodeText = prompt(`Enter text for the ${shapeDef.name} node:`, `New ${shapeDef.name}`);
        if (nodeText === null) {
          onCancelElementPlacement();
          return;
        }
        mermaidSyntax = '';
      } else if (placingElementInfo.type === 'image') {
        const imageUrl = prompt('Enter image URL:', 'https://picsum.photos/100/60');
        if (imageUrl === null) {
          onCancelElementPlacement();
          return;
        }
        const altText = prompt('Enter alt text for the image:', 'New Image');
        if (altText === null) {
          onCancelElementPlacement();
          return;
        }
        mermaidSyntax = `${nodeId}[<img src='${imageUrl || ' '}' alt='${altText || ' '}' />]`;
      } else if (placingElementInfo.type === 'text') {
        const nodeText = prompt('Enter text:', 'New Text');
        if (nodeText === null) {
          onCancelElementPlacement();
          return;
        }
        mermaidSyntax = `${nodeId}["${nodeText || ' '}"]`;
      } else if (placingElementInfo.type === 'icon') {
        const iconChar = prompt('Enter a Unicode character or emoji for the icon:', '⚙️');
        if (iconChar === null) {
          onCancelElementPlacement();
          return;
        }
        mermaidSyntax = `${nodeId}["${iconChar || ' '}"]`;
      }

      if (mermaidSyntax) {
        onAppendCode(mermaidSyntax);
      }
      onCancelElementPlacement();
    },
    [placingElementInfo, onAppendCode, onCancelElementPlacement]
  );

  return {
    placingElementInfo,
    handleInitiateElementPlacement,
    handlePlaceElement,
  };
};
