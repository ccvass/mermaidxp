import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleSidebar as toggleSidebarAction } from '../../store/slices/uiSlice';
import { useCallback } from 'react';

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const _isSidebarVisible = useAppSelector((state) => state.ui.isSidebarVisible);

  const toggleSidebar = useCallback(() => {
    dispatch(toggleSidebarAction());
  }, [dispatch]);

  return { isSidebarVisible: _isSidebarVisible, toggleSidebar };
};
