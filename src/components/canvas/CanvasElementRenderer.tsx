import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useCanvasElements } from '../../hooks/useCanvasElements';
import { createElementSVG, updateElementInSVG } from './canvasElementRenderer.utils';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface CanvasElementRendererProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom?: number;
  pan?: { x: number; y: number };
  renderVersion?: number;
}

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  containerRef,
  zoom: _zoom, // Not used but kept for future features
  pan: _pan, // Not used but kept for future features
  renderVersion,
}) => {
  // Suppress unused warnings
  void _zoom;
  void _pan;

  const { elements, selectedElementIds } = useCanvasElements();
  const isRestoring = useAppSelector((state) => state.historyEngine.isRestoring);
  const renderedElementsRef = useRef<Set<string>>(new Set());

  // Clear rendered elements when restoring from history
  useEffect(() => {
    if (isRestoring) {
      // CRITICAL: Clear the ref BEFORE clearing DOM so the next render knows to recreate everything
      renderedElementsRef.current.clear();

      // Then force remove all elements from DOM
      if (containerRef.current) {
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          const transformGroup = svgElement.querySelector('g[data-custom-elements-layer]');
          if (transformGroup) {
            const rendered = transformGroup.querySelectorAll('[data-element-id]');
            rendered.forEach((el) => el.remove());
          }
        }
      }
    }
  }, [isRestoring, containerRef]);

  // Render elements in the SVG
  useEffect(() => {
    // CRITICAL: Don't render while restoring - let cleanup happen first
    if (isRestoring) return;
    if (!containerRef.current) return;

    // Get or create SVG element
    let svgElement = containerRef.current.querySelector('svg');

    // If no SVG exists (blank canvas), create a basic one
    if (!svgElement) {
      svgElement = document.createElementNS(SVG_NS, 'svg');
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.style.width = '100%';
      svgElement.style.height = '100%';
      svgElement.style.overflow = 'visible';
      containerRef.current.appendChild(svgElement);
    }

    const tryRender = () => {
      // Find the diagram content group (stable container created by DiagramDisplay)
      const diagramContentGroup = svgElement.querySelector('g[data-diagram-content]');

      // Find or create the custom elements container
      let customElementsLayer = svgElement.querySelector('g[data-custom-elements-layer]');
      if (!customElementsLayer) {
        customElementsLayer = document.createElementNS(SVG_NS, 'g');
        customElementsLayer.setAttribute('data-custom-elements-layer', 'true');
        customElementsLayer.setAttribute('class', 'custom-elements-layer');

        if (diagramContentGroup) {
          diagramContentGroup.appendChild(customElementsLayer);
        } else {
          svgElement.appendChild(customElementsLayer);
        }
      }

      const transformGroup = customElementsLayer;

      // Get current element IDs
      const currentElementIds = new Set(Object.keys(elements as object as Record<string, unknown>));
      const renderedIds = renderedElementsRef.current;

      // Remove elements that no longer exist
      renderedIds.forEach((id) => {
        if (!currentElementIds.has(id)) {
          const existingElement = transformGroup.querySelector(`[data-element-id="${id}"]`);
          if (existingElement) {
            existingElement.remove();
          }
          renderedIds.delete(id);
        }
      });

      // Add or update existing elements
      Object.values(elements).forEach((element) => {
        const existingElement = transformGroup.querySelector(`[data-element-id="${element.id}"]`);

        if (existingElement) {
          updateElementInSVG(existingElement as SVGElement, element, selectedElementIds.includes(element.id));
        } else {
          const svgEl = createElementSVG(element, selectedElementIds.includes(element.id));
          if (svgEl) {
            transformGroup.appendChild(svgEl);
            renderedIds.add(element.id);
          }
        }
      });
    };

    tryRender();
  }, [elements, selectedElementIds, containerRef, renderVersion, isRestoring]);

  return null; // This component doesn't render React elements, it manipulates SVG directly
};

export default CanvasElementRenderer;
