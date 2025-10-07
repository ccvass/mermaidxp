import { useCallback, useRef } from 'react';

/**
 * Custom hook for safe DOM manipulation that works with React's Virtual DOM
 * Prevents memory leaks and ensures proper cleanup
 */
export const useSafeDOM = () => {
  const elementsRef = useRef<Set<Element>>(new Set());

  // Safe way to clear container content
  const clearContainer = useCallback((container: HTMLElement) => {
    // Use React-friendly approach instead of direct DOM manipulation
    const children = Array.from(container.children);
    children.forEach((child) => {
      if (child.parentNode === container) {
        container.removeChild(child);
      }
    });

    // Clear our tracking
    elementsRef.current.clear();
  }, []);

  // Safe way to append elements with tracking
  const safeAppendChild = useCallback((parent: Element, child: Element) => {
    parent.appendChild(child);
    elementsRef.current.add(child);
  }, []);

  // Safe way to remove elements with tracking
  const safeRemoveChild = useCallback((parent: Element, child: Element) => {
    if (child.parentNode === parent) {
      parent.removeChild(child);
      elementsRef.current.delete(child);
    }
  }, []);

  // Create element with tracking
  const createTrackedElement = useCallback((tagName: string, namespace?: string): Element => {
    const element = namespace ? document.createElementNS(namespace, tagName) : document.createElement(tagName);

    elementsRef.current.add(element);
    return element;
  }, []);

  // Cleanup all tracked elements
  const cleanup = useCallback(() => {
    elementsRef.current.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    elementsRef.current.clear();
  }, []);

  // Safe innerHTML replacement
  const safeSetInnerHTML = useCallback((element: Element, html: string) => {
    // Clear existing tracked children
    const children = Array.from(element.children);
    children.forEach((child) => elementsRef.current.delete(child));

    // Set new content
    element.innerHTML = html;

    // Track new children
    const newChildren = Array.from(element.children);
    newChildren.forEach((child) => elementsRef.current.add(child));
  }, []);

  return {
    clearContainer,
    safeAppendChild,
    safeRemoveChild,
    createTrackedElement,
    safeSetInnerHTML,
    cleanup,
    getTrackedElements: () => Array.from(elementsRef.current),
  };
};
