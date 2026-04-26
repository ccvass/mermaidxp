import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { store } from '../store';
import {
  addElement,
  updateElement,
  deleteElement,
  deleteElements,
  moveElement,
  moveElements,
  resizeElement,
  rotateElement,
  selectElement,
  selectElements,
  deselectElement,
  clearSelection,
  toggleElementSelection,
  copyElements,
  pasteElements,
  updateElementStyle,
  updateElementsStyle,
  updateElementContent,
  bringToFront,
  sendToBack,
  selectAllElements,
  selectSelectedElements,
  selectSelectedElementIds,
  // selectElementById,
  selectClipboard,
  CanvasElement,
} from '../store/slices/canvasElementsSlice';
import { captureNow } from '../store/slices/historyEngineSlice';

export const useCanvasElements = () => {
  const dispatch = useAppDispatch();
  const elements = useAppSelector(selectAllElements);
  const selectedElements = useAppSelector(selectSelectedElements);
  const selectedElementIds = useAppSelector(selectSelectedElementIds);
  const clipboard = useAppSelector(selectClipboard);

  // Element CRUD operations
  const createElement = useCallback(
    (elementData: Omit<CanvasElement, 'id' | 'metadata'>) => {
      dispatch(addElement(elementData));
    },
    [dispatch]
  );

  const updateElementById = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      dispatch(updateElement({ id, updates }));
    },
    [dispatch]
  );

  const deleteElementById = useCallback(
    (id: string) => {
      dispatch(deleteElement(id));
    },
    [dispatch]
  );

  const deleteSelectedElements = useCallback(() => {
    if (selectedElementIds.length > 0) {
      dispatch(deleteElements(selectedElementIds));
    }
  }, [dispatch, selectedElementIds]);

  // Position and size operations
  const moveElementTo = useCallback(
    (id: string, position: { x: number; y: number }) => {
      const showGrid = store.getState().canvas.showGrid;
      const snapped = showGrid
        ? { x: Math.round(position.x / 20) * 20, y: Math.round(position.y / 20) * 20 }
        : position;
      dispatch(moveElement({ id, position: snapped }));
    },
    [dispatch]
  );

  const moveSelectedElements = useCallback(
    (delta: { dx: number; dy: number }) => {
      if (selectedElementIds.length > 0) {
        dispatch(moveElements({ ids: selectedElementIds, delta }));
      }
    },
    [dispatch, selectedElementIds]
  );

  const resizeElementTo = useCallback(
    (id: string, size: { width: number; height: number }) => {
      dispatch(resizeElement({ id, size }));
    },
    [dispatch]
  );

  const rotateElementTo = useCallback(
    (id: string, rotation: number) => {
      dispatch(rotateElement({ id, rotation }));
    },
    [dispatch]
  );

  // Selection operations
  const selectElementById = useCallback(
    (id: string) => {
      dispatch(selectElement(id));
    },
    [dispatch]
  );

  const selectMultipleElements = useCallback(
    (ids: string[]) => {
      dispatch(selectElements(ids));
    },
    [dispatch]
  );

  const deselectElementById = useCallback(
    (id: string) => {
      dispatch(deselectElement(id));
    },
    [dispatch]
  );

  const clearElementSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const toggleElementSelectionById = useCallback(
    (id: string) => {
      dispatch(toggleElementSelection(id));
    },
    [dispatch]
  );

  const selectAllElementsAction = useCallback(() => {
    const allIds = Object.keys(elements);
    dispatch(selectElements(allIds));
  }, [dispatch, elements]);

  // Clipboard operations
  const copySelectedElements = useCallback(() => {
    if (selectedElementIds.length > 0) {
      dispatch(copyElements(selectedElementIds));
    }
  }, [dispatch, selectedElementIds]);

  const pasteElementsFromClipboard = useCallback(
    (offset?: { x: number; y: number }) => {
      dispatch(pasteElements({ offset }));
    },
    [dispatch]
  );

  // Style operations
  const updateElementStyleById = useCallback(
    (id: string, style: Partial<CanvasElement['style']>) => {
      dispatch(updateElementStyle({ id, style }));
    },
    [dispatch]
  );

  const updateSelectedElementsStyle = useCallback(
    (style: Partial<CanvasElement['style']>) => {
      if (selectedElementIds.length > 0) {
        dispatch(updateElementsStyle({ ids: selectedElementIds, style }));
      }
    },
    [dispatch, selectedElementIds]
  );

  // Content operations
  const updateElementContentById = useCallback(
    (id: string, content: string) => {
      dispatch(updateElementContent({ id, content }));
    },
    [dispatch]
  );

  // Layer operations
  const bringElementToFront = useCallback(
    (id: string) => {
      dispatch(bringToFront(id));
    },
    [dispatch]
  );

  const sendElementToBack = useCallback(
    (id: string) => {
      dispatch(sendToBack(id));
    },
    [dispatch]
  );

  // History operations
  const captureSnapshot = useCallback(
    (description?: string) => {
      dispatch(captureNow({ actionType: description }));
    },
    [dispatch]
  );

  // Utility functions
  const getElementById = useCallback(
    (id: string) => {
      return elements[id];
    },
    [elements]
  );

  const getElementsInArea = useCallback(
    (area: { x: number; y: number; width: number; height: number }) => {
      return Object.values(elements).filter((element) => {
        const elementRight = element.position.x + element.size.width;
        const elementBottom = element.position.y + element.size.height;
        const areaRight = area.x + area.width;
        const areaBottom = area.y + area.height;

        return !(
          element.position.x > areaRight ||
          elementRight < area.x ||
          element.position.y > areaBottom ||
          elementBottom < area.y
        );
      });
    },
    [elements]
  );

  const getElementsAtPoint = useCallback(
    (point: { x: number; y: number }) => {
      return Object.values(elements).filter((element) => {
        return (
          point.x >= element.position.x &&
          point.x <= element.position.x + element.size.width &&
          point.y >= element.position.y &&
          point.y <= element.position.y + element.size.height
        );
      });
    },
    [elements]
  );

  // Bulk operations
  const duplicateSelectedElements = useCallback(() => {
    copySelectedElements();
    pasteElementsFromClipboard({ x: 20, y: 20 });
  }, [copySelectedElements, pasteElementsFromClipboard]);

  const alignSelectedElements = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedElements.length < 2) return;

      const bounds = selectedElements.reduce(
        (acc, element) => {
          return {
            minX: Math.min(acc.minX, element.position.x),
            maxX: Math.max(acc.maxX, element.position.x + element.size.width),
            minY: Math.min(acc.minY, element.position.y),
            maxY: Math.max(acc.maxY, element.position.y + element.size.height),
          };
        },
        {
          minX: Infinity,
          maxX: -Infinity,
          minY: Infinity,
          maxY: -Infinity,
        }
      );

      selectedElements.forEach((element) => {
        let newPosition = { ...element.position };

        switch (alignment) {
          case 'left':
            newPosition.x = bounds.minX;
            break;
          case 'center':
            newPosition.x = bounds.minX + (bounds.maxX - bounds.minX) / 2 - element.size.width / 2;
            break;
          case 'right':
            newPosition.x = bounds.maxX - element.size.width;
            break;
          case 'top':
            newPosition.y = bounds.minY;
            break;
          case 'middle':
            newPosition.y = bounds.minY + (bounds.maxY - bounds.minY) / 2 - element.size.height / 2;
            break;
          case 'bottom':
            newPosition.y = bounds.maxY - element.size.height;
            break;
        }

        dispatch(moveElement({ id: element.id, position: newPosition }));
      });
    },
    [dispatch, selectedElements]
  );

  return {
    // State
    elements,
    selectedElements,
    selectedElementIds,
    clipboard,
    hasSelection: selectedElementIds.length > 0,
    hasClipboard: clipboard.length > 0,

    // CRUD operations
    createElement,
    updateElementById,
    deleteElementById,
    deleteSelectedElements,

    // Position and size
    moveElementTo,
    moveSelectedElements,
    resizeElementTo,
    rotateElementTo,

    // Selection
    selectElementById,
    selectMultipleElements,
    deselectElementById,
    clearElementSelection,
    toggleElementSelectionById,
    selectAllElements: selectAllElementsAction,

    // Clipboard
    copySelectedElements,
    pasteElementsFromClipboard,
    duplicateSelectedElements,

    // Style
    updateElementStyleById,
    updateSelectedElementsStyle,

    // Content
    updateElementContentById,

    // Layer
    bringElementToFront,
    sendElementToBack,

    // Utility
    getElementById,
    getElementsInArea,
    getElementsAtPoint,
    alignSelectedElements,

    // History
    captureSnapshot,
  };
};
