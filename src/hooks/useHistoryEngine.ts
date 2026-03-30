import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  undo as historyUndo,
  redo as historyRedo,
  beginGroup,
  endGroup,
  captureNow,
  setMaxSize,
} from '../store/slices/historyEngineSlice';

export const useHistoryEngine = () => {
  const dispatch = useAppDispatch();
  const { past, future, featureEnabled, activeGroupId, present } = useAppSelector((s) => s.historyEngine);

  const undo = useCallback(() => {
    dispatch(historyUndo());
  }, [dispatch, past.length]);

  const redo = useCallback(() => {
    dispatch(historyRedo());
  }, [dispatch, future.length]);
  const startGroup = useCallback((label?: string) => dispatch(beginGroup(label)), [dispatch]);
  const endGroupAction = useCallback(() => dispatch(endGroup()), [dispatch]);
  const capture = useCallback((actionType?: string) => dispatch(captureNow({ actionType })), [dispatch]);
  const setLimit = useCallback((n: number) => dispatch(setMaxSize(n)), [dispatch]);

  return {
    enabled: featureEnabled,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    groupId: activeGroupId,
    present,
    undo,
    redo,
    beginGroup: startGroup,
    endGroup: endGroupAction,
    captureNow: capture,
    setMaxSize: setLimit,
  };
};
