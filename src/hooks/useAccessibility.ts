/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { showNotification } from '../store/slices/uiSlice';

interface AccessibilityOptions {
  enableAnnouncements?: boolean;
  enableKeyboardNavigation?: boolean;
  enableFocusManagement?: boolean;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
}

interface UseAccessibilityReturn {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocus: (elementId: string) => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  registerKeyboardShortcut: (key: string, handler: () => void, description: string) => void;
  unregisterKeyboardShortcut: (key: string) => void;
  getKeyboardShortcuts: () => Array<{ key: string; description: string }>;
}

export const useAccessibility = (options: AccessibilityOptions = {}): UseAccessibilityReturn => {
  const {
    enableAnnouncements = true,
    enableKeyboardNavigation = true,
    enableFocusManagement = true,
    enableHighContrast = true,
    enableReducedMotion = true,
  } = options;

  const dispatch = useAppDispatch();

  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<Map<string, { handler: () => void; description: string }>>(
    new Map()
  );

  const announcementRef = useRef<HTMLDivElement | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create announcement region for screen readers

  useEffect(() => {
    if (!enableAnnouncements) return;

    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'accessibility-announcements';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';

    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [enableAnnouncements]);

  // Detect user preferences
  useEffect(() => {
    if (enableHighContrast) {
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      setIsHighContrast(prefersHighContrast);
    }

    if (enableReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsReducedMotion(prefersReducedMotion);
    }
  }, [enableHighContrast, enableReducedMotion]);

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement;

    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [isHighContrast, isReducedMotion]);

  // Keyboard navigation handler

  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = [];

      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      if (event.metaKey) modifiers.push('meta');

      const shortcutKey = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
      const shortcut = keyboardShortcuts.get(shortcutKey);

      if (shortcut) {
        event.preventDefault();
        shortcut.handler();
        announce(`Shortcut activated: ${shortcut.description}`);
      }

      // Built-in navigation shortcuts
      switch (key) {
        case 'escape': {
          // Close modals, clear focus, etc.
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }
          announce('Cleared focus');
          break;
        }

        case 'f1':
          if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            announce(
              'Available keyboard shortcuts: ' +
                Array.from(keyboardShortcuts.values())
                  .map((s) => s.description)
                  .join(', ')
            );
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNavigation, keyboardShortcuts]);

  // Announce messages to screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!enableAnnouncements || !announcementRef.current) return;

      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;

      // Clear after a delay to allow for new announcements
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    },
    [enableAnnouncements]
  );

  // Set focus to specific element
  const setFocus = useCallback(
    (elementId: string) => {
      if (!enableFocusManagement) return;

      // Clear any existing timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      // Set focus with a small delay to ensure element is ready
      focusTimeoutRef.current = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.focus();
          announce(`Focus set to ${element.getAttribute('aria-label') || element.tagName}`);
        }
      }, 100);
    },
    [enableFocusManagement, announce]
  );

  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    if (!enableHighContrast) return;

    setIsHighContrast((prev) => {
      const newValue = !prev;
      announce(`High contrast mode ${newValue ? 'enabled' : 'disabled'}`);
      dispatch(
        showNotification({
          message: `High contrast mode ${newValue ? 'enabled' : 'disabled'}`,
          type: 'info',
        })
      );
      return newValue;
    });
  }, [enableHighContrast, announce, dispatch]);

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    if (!enableReducedMotion) return;

    setIsReducedMotion((prev) => {
      const newValue = !prev;
      announce(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`);
      dispatch(
        showNotification({
          message: `Reduced motion ${newValue ? 'enabled' : 'disabled'}`,
          type: 'info',
        })
      );
      return newValue;
    });
  }, [enableReducedMotion, announce, dispatch]);

  // Register keyboard shortcut
  const registerKeyboardShortcut = useCallback((key: string, handler: () => void, description: string) => {
    setKeyboardShortcuts((prev) => {
      const newShortcuts = new Map(prev);
      newShortcuts.set(key.toLowerCase(), { handler, description });
      return newShortcuts;
    });
  }, []);

  // Unregister keyboard shortcut
  const unregisterKeyboardShortcut = useCallback((key: string) => {
    setKeyboardShortcuts((prev) => {
      const newShortcuts = new Map(prev);
      newShortcuts.delete(key.toLowerCase());
      return newShortcuts;
    });
  }, []);

  // Get all registered shortcuts
  const getKeyboardShortcuts = useCallback(() => {
    return Array.from(keyboardShortcuts.entries()).map(([key, { description }]) => ({
      key,
      description,
    }));
  }, [keyboardShortcuts]);

  // Register common shortcuts on mount
  useEffect(() => {
    const commonShortcuts = [
      { key: 'ctrl+z', handler: () => dispatch({ type: 'diagram/undo' }), description: 'Undo last action' },
      { key: 'ctrl+y', handler: () => dispatch({ type: 'diagram/redo' }), description: 'Redo last action' },
      {
        key: 'ctrl+s',
        handler: () => dispatch(showNotification({ message: 'Diagram saved', type: 'success' })),
        description: 'Save diagram',
      },
      { key: 'ctrl+shift+c', handler: toggleHighContrast, description: 'Toggle high contrast' },
      { key: 'ctrl+shift+m', handler: toggleReducedMotion, description: 'Toggle reduced motion' },
      { key: 'alt+1', handler: () => setFocus('code-editor'), description: 'Focus code editor' },
      { key: 'alt+2', handler: () => setFocus('diagram-canvas'), description: 'Focus diagram canvas' },
      { key: 'alt+3', handler: () => setFocus('shapes-panel'), description: 'Focus shapes panel' },
    ];

    commonShortcuts.forEach(({ key, handler, description }) => {
      registerKeyboardShortcut(key, handler, description);
    });

    return () => {
      commonShortcuts.forEach(({ key }) => {
        unregisterKeyboardShortcut(key);
      });
    };
  }, [
    registerKeyboardShortcut,
    unregisterKeyboardShortcut,
    toggleHighContrast,
    toggleReducedMotion,
    setFocus,
    dispatch,
  ]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return {
    announce,
    setFocus,
    isHighContrast,
    isReducedMotion,
    toggleHighContrast,
    toggleReducedMotion,
    registerKeyboardShortcut,
    unregisterKeyboardShortcut,
    getKeyboardShortcuts,
  };
};

export default useAccessibility;
