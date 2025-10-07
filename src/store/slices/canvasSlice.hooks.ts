import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setPan,
  updatePan,
  setPlacingElement,
  clearPlacingElement,
  setSelectedNodes,
  addSelectedNode,
  removeSelectedNode,
  clearSelectedNodes,
  setIsDragging,
  setInteractionMode,
  toggleInteractionMode,
  fitToViewport,
  selectCanvas,
  selectZoom,
  selectPan,
  selectPlacingElement,
  selectSelectedNodes,
  selectIsDragging,
  selectInteractionMode,
  selectCanZoomIn,
  selectCanZoomOut,
  selectIsDefaultZoom,
} from './canvasSlice';
import { PlacingElementInfo, InteractionMode } from '../../types/diagram.types';

// Selector hooks
export const useCanvasState = () => useAppSelector(selectCanvas);
export const useZoom = () => useAppSelector(selectZoom);
export const usePan = () => useAppSelector(selectPan);
export const usePlacingElement = () => useAppSelector(selectPlacingElement);
export const useSelectedNodes = () => useAppSelector(selectSelectedNodes);
export const useIsDragging = () => useAppSelector(selectIsDragging);
export const useInteractionMode = () => useAppSelector(selectInteractionMode);
export const useCanZoomIn = () => useAppSelector(selectCanZoomIn);
export const useCanZoomOut = () => useAppSelector(selectCanZoomOut);
export const useIsDefaultZoom = () => useAppSelector(selectIsDefaultZoom);

// Action hooks
export const useCanvasActions = () => {
  const dispatch = useAppDispatch();

  return {
    // Zoom actions
    setZoom: useCallback((zoom: number) => dispatch(setZoom(zoom)), [dispatch]),
    zoomIn: useCallback(() => dispatch(zoomIn()), [dispatch]),
    zoomOut: useCallback(() => dispatch(zoomOut()), [dispatch]),
    resetZoom: useCallback(() => dispatch(resetZoom()), [dispatch]),

    // Pan actions
    setPan: useCallback((pan: { x: number; y: number }) => dispatch(setPan(pan)), [dispatch]),
    updatePan: useCallback((delta: { dx: number; dy: number }) => dispatch(updatePan(delta)), [dispatch]),

    // Placing element actions
    setPlacingElement: useCallback(
      (element: PlacingElementInfo | null) => dispatch(setPlacingElement(element)),
      [dispatch]
    ),
    clearPlacingElement: useCallback(() => dispatch(clearPlacingElement()), [dispatch]),

    // Selection actions
    setSelectedNodes: useCallback((nodes: string[]) => dispatch(setSelectedNodes(nodes)), [dispatch]),
    addSelectedNode: useCallback((nodeId: string) => dispatch(addSelectedNode(nodeId)), [dispatch]),
    removeSelectedNode: useCallback((nodeId: string) => dispatch(removeSelectedNode(nodeId)), [dispatch]),
    clearSelectedNodes: useCallback(() => dispatch(clearSelectedNodes()), [dispatch]),

    // Interaction actions
    setIsDragging: useCallback((isDragging: boolean) => dispatch(setIsDragging(isDragging)), [dispatch]),
    setInteractionMode: useCallback((mode: InteractionMode) => dispatch(setInteractionMode(mode)), [dispatch]),
    toggleInteractionMode: useCallback(() => dispatch(toggleInteractionMode()), [dispatch]),

    // Complex actions
    fitToViewport: useCallback(
      (bounds: {
        diagramBounds: { width: number; height: number };
        viewportBounds: { width: number; height: number };
      }) => dispatch(fitToViewport(bounds)),
      [dispatch]
    ),
  };
};

// Individual zoom action hooks for convenience
export const useZoomActions = () => {
  const dispatch = useAppDispatch();

  return {
    setZoom: useCallback((zoom: number) => dispatch(setZoom(zoom)), [dispatch]),
    zoomIn: useCallback(() => dispatch(zoomIn()), [dispatch]),
    zoomOut: useCallback(() => dispatch(zoomOut()), [dispatch]),
    resetZoom: useCallback(() => dispatch(resetZoom()), [dispatch]),
  };
};
