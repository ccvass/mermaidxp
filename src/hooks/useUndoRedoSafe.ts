import { useCallback, useRef, useState } from 'react';
import { useCleanupEffect } from './useCleanupEffect';

/**
 * Safe Undo/Redo implementation that doesn't conflict with pan/drag operations
 * Uses Command Pattern for robust state management
 */

interface Command {
  id: string;
  type: 'diagram_change' | 'element_add' | 'element_move' | 'element_delete';
  execute: () => void;
  undo: () => void;
  timestamp: number;
  description: string;
}

interface UndoRedoState {
  history: Command[];
  currentIndex: number;
  maxHistorySize: number;
}

export const useUndoRedoSafe = (maxHistorySize: number = 50) => {
  const [state, setState] = useState<UndoRedoState>({
    history: [],
    currentIndex: -1,
    maxHistorySize,
  });

  const { safeSetTimeout } = useCleanupEffect();
  const isExecutingRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add command to history
  const addCommand = useCallback(
    (command: Command) => {
      if (isExecutingRef.current) return; // Prevent recursive calls

      setState((prevState) => {
        const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);
        newHistory.push(command);

        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }

        return {
          ...prevState,
          history: newHistory,
          currentIndex: newHistory.length - 1,
        };
      });
    },
    [maxHistorySize]
  );

  // Execute undo
  const undo = useCallback(() => {
    if (state.currentIndex < 0 || isExecutingRef.current) return false;

    const command = state.history[state.currentIndex];
    if (!command) return false;

    isExecutingRef.current = true;

    try {
      command.undo();
      setState((prevState) => ({
        ...prevState,
        currentIndex: prevState.currentIndex - 1,
      }));
      return true;
    } catch (error) {
      console.error('Undo operation failed:', error);
      return false;
    } finally {
      // Reset flag after a delay to prevent conflicts
      safeSetTimeout(() => {
        isExecutingRef.current = false;
      }, 100);
    }
  }, [state.currentIndex, state.history, safeSetTimeout]);

  // Execute redo
  const redo = useCallback(() => {
    if (state.currentIndex >= state.history.length - 1 || isExecutingRef.current) return false;

    const command = state.history[state.currentIndex + 1];
    if (!command) return false;

    isExecutingRef.current = true;

    try {
      command.execute();
      setState((prevState) => ({
        ...prevState,
        currentIndex: prevState.currentIndex + 1,
      }));
      return true;
    } catch (error) {
      console.error('Redo operation failed:', error);
      return false;
    } finally {
      // Reset flag after a delay to prevent conflicts
      safeSetTimeout(() => {
        isExecutingRef.current = false;
      }, 100);
    }
  }, [state.currentIndex, state.history, safeSetTimeout]);

  // Clear history
  const clearHistory = useCallback(() => {
    setState({
      history: [],
      currentIndex: -1,
      maxHistorySize,
    });
  }, [maxHistorySize]);

  // Debounced add command (useful for rapid changes)
  const addCommandDebounced = useCallback(
    (command: Command, delay: number = 500) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = safeSetTimeout(() => {
        addCommand(command);
        debounceTimeoutRef.current = null;
      }, delay);
    },
    [addCommand, safeSetTimeout]
  );

  // Create command factory
  const createCommand = useCallback(
    (type: Command['type'], execute: () => void, undo: () => void, description: string): Command => ({
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      execute,
      undo,
      timestamp: Date.now(),
      description,
    }),
    []
  );

  return {
    // State
    canUndo: state.currentIndex >= 0,
    canRedo: state.currentIndex < state.history.length - 1,
    historySize: state.history.length,
    currentIndex: state.currentIndex,

    // Actions
    undo,
    redo,
    addCommand,
    addCommandDebounced,
    clearHistory,
    createCommand,

    // Utilities
    getHistory: () => state.history,
    getCurrentCommand: () => state.history[state.currentIndex] || null,
    isExecuting: () => isExecutingRef.current,
  };
};
