import React, { useCallback } from 'react';
import { setPlacingElement } from '../../../store/slices/canvasSlice';
import { setMermaidCode } from '../../../store/slices/diagramSlice';
import { showNotification } from '../../../store/slices/uiSlice';
import { logger } from '../../../utils/logger';
import { promptForText, positionElementAtCoordinates } from './placementUtils';
import { addTextToSVG } from './addTextToSVG';
import { addImageToSVG } from './addImageToSVG';
import { addSVGShapeToCanvas } from './addSVGShapeToCanvas';
import { addIconToSVG } from './addIconToSVG';

export interface UseElementPlacementParams {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  zoom: number;
  mermaidCode: string;
  placingElement: unknown;
  activeDragInfo: unknown;
  dispatch: (action: unknown) => void;
}

export function useElementPlacement({
  containerRef,
  pan,
  zoom,
  mermaidCode,
  placingElement,
  activeDragInfo,
  dispatch,
}: UseElementPlacementParams) {
  const handleElementPlacement = useCallback(
    async (
      element: Record<string, unknown>,
      _screenX: number,
      _screenY: number,
      diagramX: number,
      diagramY: number
    ) => {
      if (!element) return;

      try {
        let newNodeCode = '';
        const nodeId = `node_${Date.now()}`;

        switch (element.type) {
          case 'shape':
            if (element.shapeDefinition) {
              const def = element.shapeDefinition as Record<string, unknown>;
              const shapeName = await promptForText('Shape Text', `Enter text for the ${def.name}:`);
              if (shapeName) {
                newNodeCode = `\n    ${(def.syntax as (id: string, name: string) => string)(nodeId, shapeName)}`;
              }
            } else {
              const shapeName = await promptForText('Shape Text', 'Enter text for the shape:');
              if (shapeName) {
                newNodeCode = `\n    ${nodeId}[${shapeName}]`;
              }
            }
            break;

          case 'image': {
            let imageUrl = '';
            let altText = 'Image';
            let width = 80;
            let height = 80;

            if (element.imageDefinition) {
              const imgDef = element.imageDefinition as Record<string, unknown>;
              imageUrl = String(imgDef.url || '');
              altText = String(imgDef.altText || 'Image');
              width = Number(imgDef.width || 80);
              height = Number(imgDef.height || 80);
            } else {
              imageUrl = (await promptForText('Image URL', 'Enter the image URL:')) || '';
              if (imageUrl) {
                altText = (await promptForText('Alt Text', 'Enter alt text (optional):')) || 'Image';
              }
            }

            if (imageUrl) {
              addImageToSVG(containerRef, imageUrl, altText, diagramX, diagramY, nodeId, width, height);
              dispatch(setPlacingElement(null));
              return;
            }
            break;
          }

          case 'svg-shape': {
            if (element.svgShapeDefinition) {
              const shapeDef = element.svgShapeDefinition as Record<string, unknown>;
              addSVGShapeToCanvas(containerRef, shapeDef, diagramX, diagramY, nodeId);
              dispatch(setPlacingElement(null));
              return;
            } else {
              dispatch(setPlacingElement(null));
              return;
            }
          }

          case 'text': {
            let textContent = '';
            let textStyle = {
              fontSize: 16,
              color: '#000000',
              fontWeight: 'normal' as 'normal' | 'bold',
              fontStyle: 'normal' as 'normal' | 'italic',
              textDecoration: 'none' as 'none' | 'underline',
              backgroundColor: 'transparent',
              padding: 4,
              borderRadius: 0,
            };

            if (element.textDefinition) {
              const textDef = element.textDefinition as Record<string, unknown>;
              textContent = String(textDef.content || '');
              textStyle = {
                fontSize: Number(textDef.fontSize || 16),
                color: String(textDef.color || '#000'),
                fontWeight: (textDef.fontWeight || 'normal') as 'normal' | 'bold',
                fontStyle: (textDef.fontStyle || 'normal') as 'normal' | 'italic',
                textDecoration: (textDef.textDecoration || 'none') as 'none' | 'underline',
                backgroundColor: String(textDef.backgroundColor || 'transparent'),
                padding: Number(textDef.padding || 4),
                borderRadius: Number(textDef.borderRadius || 0),
              };
            } else {
              textContent = (await promptForText('Text Content', 'Enter the text content:')) || '';
            }

            if (textContent) {
              addTextToSVG(containerRef, textContent, textStyle, diagramX, diagramY, nodeId);
              dispatch(setPlacingElement(null));
              return;
            }
            break;
          }

          case 'icon': {
            let iconContent = '';
            if (element.iconContent) {
              iconContent = String(element.iconContent);
            } else {
              iconContent = (await promptForText('Icon/Emoji', 'Enter an emoji or Unicode character:')) || '';
            }

            if (iconContent) {
              addIconToSVG(containerRef, iconContent, diagramX, diagramY, nodeId);
              dispatch(setPlacingElement(null));
              return;
            }
            break;
          }
        }

        if (newNodeCode) {
          let updatedCode = mermaidCode.trim();

          if (!updatedCode) {
            updatedCode = 'flowchart TD';
          } else if (!updatedCode.includes('flowchart') && !updatedCode.includes('graph')) {
            dispatch(
              showNotification({
                message: 'Can only add elements to flowchart/graph diagrams',
                type: 'warning',
              } as any)
            );
            dispatch(setPlacingElement(null));
            return;
          }

          updatedCode += newNodeCode;

          dispatch(setMermaidCode(updatedCode));
          setTimeout(() => {
            positionElementAtCoordinates(containerRef, pan, nodeId, diagramX, diagramY);
          }, 100);

          dispatch(
            showNotification({
              message: `${element.type === 'shape' ? String((element.shapeDefinition as Record<string, unknown>)?.name || 'Shape') : String(element.type)} added successfully`,
              type: 'success' as const,
            })
          );
        }

        dispatch(setPlacingElement(null));
      } catch (error) {
        logger.error('Element placement error:', 'useElementPlacement', error instanceof Error ? error : undefined);
        dispatch(
          showNotification({
            message: `Failed to add ${element && element.type ? element.type : 'element'}`,
            type: 'error',
          } as any)
        );
        dispatch(setPlacingElement(null));
      }
    },
    [containerRef, pan, mermaidCode, dispatch]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!placingElement) {
        return;
      }

      if (!containerRef.current) return;
      if (activeDragInfo) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Use SVG's getScreenCTM to accurately convert screen → SVG coordinates
      let diagramX = (x - pan.x) / zoom;
      let diagramY = (y - pan.y) / zoom;
      try {
        const svg = containerRef.current.querySelector('svg') as SVGSVGElement | null;
        const layer = svg?.querySelector('g[data-custom-elements-layer]') as SVGGElement | null;
        if (svg && layer) {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const ctm = layer.getScreenCTM();
          if (ctm) {
            const svgPt = pt.matrixTransform(ctm.inverse());
            diagramX = svgPt.x;
            diagramY = svgPt.y;
          }
        }
      } catch {
        // fallback to manual math above
      }

      handleElementPlacement(placingElement as Record<string, unknown>, x, y, diagramX, diagramY);
    },
    [placingElement, activeDragInfo, pan, zoom, handleElementPlacement, containerRef]
  );

  return { handleCanvasClick };
}
