import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleTheme as toggleThemeAction } from '../../store/slices/uiSlice';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Theme } from '../../types/ui.types';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('theme', Theme.Light);

  useEffect(() => {
    if (storedTheme && storedTheme !== theme) {
      // Dispatch toggleThemeAction if storedTheme is different from current Redux theme
      // This handles initial load where local storage might have a different theme
      dispatch(toggleThemeAction());
    }
  }, [dispatch, storedTheme, theme]);

  useEffect(() => {
    setStoredTheme(theme === 'dark' ? Theme.Dark : Theme.Light);
  }, [theme, setStoredTheme]);

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return { theme, toggleTheme };
};
