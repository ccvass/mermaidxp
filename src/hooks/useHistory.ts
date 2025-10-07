import { useState, useCallback } from 'react';

interface HistoryState<T> {
  history: T[];
  currentIndex: number;
}

export const useHistory = <T>(initialState: T) => {
  const [state, setState] = useState<HistoryState<T>>({
    history: [initialState],
    currentIndex: 0,
  });

  const { history, currentIndex } = state;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const set = useCallback(
    (newState: T) => {
      setState((prevState) => {
        if (newState === prevState.history[prevState.currentIndex]) {
          return prevState;
        }
        const { history, currentIndex } = prevState;
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newState);
        return {
          history: newHistory,
          currentIndex: newHistory.length - 1,
        };
      });
    },
    [setState]
  );

  const undo = useCallback(() => {
    if (canUndo) {
      setState((prevState) => ({
        ...prevState,
        currentIndex: prevState.currentIndex - 1,
      }));
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setState((prevState) => ({
        ...prevState,
        currentIndex: prevState.currentIndex + 1,
      }));
    }
  }, [canRedo]);

  return {
    state: history[currentIndex],
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentIndex,
  };
};
