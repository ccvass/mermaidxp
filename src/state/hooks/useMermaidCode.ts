import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setMermaidCode, appendMermaidCode, undo, redo } from '../../store/slices/diagramSlice';
import { useCallback } from 'react';

export const useMermaidCode = () => {
  const dispatch = useAppDispatch();
  const mermaidCode = useAppSelector((state) => state.diagram.mermaidCode);
  const history = useAppSelector((state) => state.diagram.history);
  const historyIndex = useAppSelector((state) => state.diagram.historyIndex);

  const handleSetMermaidCode = useCallback(
    (code: string) => {
      dispatch(setMermaidCode(code));
    },
    [dispatch]
  );

  const handleAppendMermaidCode = useCallback(
    (code: string) => {
      dispatch(appendMermaidCode(code));
    },
    [dispatch]
  );

  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    mermaidCode,
    setMermaidCode: handleSetMermaidCode,
    appendMermaidCode: handleAppendMermaidCode,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  };
};
