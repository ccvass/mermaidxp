/**
 * @deprecated This context is deprecated. Use useHistoryEngine hook instead.
 *
 * Migration guide:
 * - Replace: import { useUndoRedo } from '../contexts/UndoRedoContext'
 * - With: import { useHistoryEngine } from '../hooks/useHistoryEngine'
 *
 * The API is identical:
 * const { undo, redo, canUndo, canRedo } = useHistoryEngine();
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setMermaidCode } from '../store/slices/diagramSlice';
import { showNotification } from '../store/slices/uiSlice';

interface HistoryEntry {
  mermaidCode: string;
  timestamp: number;
}

interface UndoRedoContextType {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentIndex: number;
  historyLength: number;
  clearHistory: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | null>(null);

export const UndoRedoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { mermaidCode } = useAppSelector((state) => state.diagram);

  // Estado del historial
  const [history, setHistory] = useState<HistoryEntry[]>(() => [{ mermaidCode, timestamp: Date.now() }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCode = useRef(mermaidCode);
  const isUndoRedoAction = useRef(false);

  // Guardar código en el historial con debounce
  const saveToHistory = useCallback(
    (code: string) => {
      // Skip if this is an undo/redo action
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }

      if (code === lastSavedCode.current) {
        return;
      }

      saveTimer.current = setTimeout(() => {
        setHistory((prev) => {
          const newHistory = prev.slice(0, currentIndex + 1);
          newHistory.push({
            mermaidCode: code,
            timestamp: Date.now(),
          });
          if (newHistory.length > 50) {
            return newHistory.slice(-50);
          }
          return newHistory;
        });
        setCurrentIndex((prev) => prev + 1);
        lastSavedCode.current = code;
      }, 1000);
    },
    [currentIndex]
  );

  // Función de undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const entry = history[newIndex];

      if (entry) {
        isUndoRedoAction.current = true;
        setCurrentIndex(newIndex);
        dispatch(setMermaidCode(entry.mermaidCode));
        lastSavedCode.current = entry.mermaidCode;

        dispatch(
          showNotification({
            message: '↶ Cambio deshecho',
            type: 'success',
          })
        );
      }
    } else {
      dispatch(
        showNotification({
          message: 'No hay cambios para deshacer',
          type: 'info',
        })
      );
    }
  }, [currentIndex, history, dispatch]);

  // Función de redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const entry = history[newIndex];

      if (entry) {
        isUndoRedoAction.current = true;
        setCurrentIndex(newIndex);
        dispatch(setMermaidCode(entry.mermaidCode));
        lastSavedCode.current = entry.mermaidCode;

        dispatch(
          showNotification({
            message: '↷ Cambio rehecho',
            type: 'success',
          })
        );
      }
    } else {
      dispatch(
        showNotification({
          message: 'No hay cambios para rehacer',
          type: 'info',
        })
      );
    }
  }, [currentIndex, history, dispatch]);

  // Guardar cambios del código cuando cambia
  useEffect(() => {
    // Skip the initial render
    if (lastSavedCode.current === undefined) {
      lastSavedCode.current = mermaidCode;
      return;
    }

    saveToHistory(mermaidCode);
  }, [mermaidCode, saveToHistory]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([{ mermaidCode, timestamp: Date.now() }]);
    setCurrentIndex(0);
    lastSavedCode.current = mermaidCode;
    dispatch(
      showNotification({
        message: '🗑️ Historial limpiado',
        type: 'info',
      })
    );
  }, [mermaidCode, dispatch]);

  const value = {
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    currentIndex,
    historyLength: history.length,
    clearHistory,
  };

  return <UndoRedoContext.Provider value={value}>{children}</UndoRedoContext.Provider>;
};

export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
};
