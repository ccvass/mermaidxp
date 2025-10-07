import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setDiagramMode, setInteractionMode } from '../../store/slices/uiSlice';
import { DiagramMode, InteractionMode } from '../../types/ui.types';
import { useCallback } from 'react';

export const useDiagram = () => {
  const dispatch = useAppDispatch();
  const diagramMode = useAppSelector((state) => state.ui.diagramMode);
  const interactionMode = useAppSelector((state) => state.ui.interactionMode);

  const toggleDiagramMode = useCallback(() => {
    dispatch(setDiagramMode(diagramMode === DiagramMode.Diagram ? DiagramMode.Whiteboard : DiagramMode.Diagram));
  }, [dispatch, diagramMode]);

  const toggleInteractionMode = useCallback(() => {
    dispatch(setInteractionMode(interactionMode === InteractionMode.Drag ? InteractionMode.Pan : InteractionMode.Drag));
  }, [dispatch, interactionMode]);

  return { diagramMode, toggleDiagramMode, interactionMode, toggleInteractionMode };
};
