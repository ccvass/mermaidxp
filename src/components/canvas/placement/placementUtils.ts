import React from 'react';

/** Wraps window.prompt in a Promise */
export const promptForText = (title: string, message: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const result = window.prompt(`${title}\n\n${message}`);
    resolve(result);
  });
};

/** Finds the custom-elements-layer group or falls back to SVG root */
export const getTargetParent = (svg: SVGElement): SVGElement => {
  return (svg.querySelector('g[data-custom-elements-layer]') as SVGElement) || svg;
};

/** Retries up to 10× to find a node by ID and set its transform */
export const positionElementAtCoordinates = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  pan: { x: number; y: number },
  nodeId: string,
  x: number,
  y: number
) => {
  if (!containerRef.current) return;

  const svgElement = containerRef.current.querySelector('svg');
  if (!svgElement) return;

  const findElement = () => {
    let element = svgElement.querySelector(`[id*="${nodeId}"]`);
    if (element) return element as SVGElement;

    const allGroups = svgElement.querySelectorAll('g.node');
    if (allGroups.length > 0) {
      element = allGroups[allGroups.length - 1];
      if (element) return element as SVGElement;
    }

    const allElements = svgElement.querySelectorAll('g');
    if (allElements.length > 0) {
      return allElements[allElements.length - 1] as SVGElement;
    }

    return null;
  };

  let attempts = 0;
  const maxAttempts = 10;

  const tryPosition = () => {
    const element = findElement();

    if (element) {
      const adjustedX = x - pan.x;
      const adjustedY = y - pan.y;
      const newTransform = `translate(${adjustedX}, ${adjustedY})`;
      element.setAttribute('transform', newTransform);

      const childElements = element.querySelectorAll('g, rect, circle, path, text');
      childElements.forEach((child) => {
        if (child !== element) {
          (child as SVGElement).setAttribute('transform', newTransform);
        }
      });

      return true;
    }

    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(tryPosition, 50);
    }

    return false;
  };

  setTimeout(tryPosition, 100);
};
