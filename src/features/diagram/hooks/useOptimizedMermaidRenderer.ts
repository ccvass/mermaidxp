/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { renderDiagram, setRenderResult } from '../../../store/slices/diagramSlice';
import { debounce } from '../../../utils/helpers/debounce';
import { UI_CONFIG } from '../../../constants/ui.constants';
import { MermaidRenderResult } from '../../../types/diagram.types';
import { Theme } from '../../../types/ui.types';

interface UseOptimizedMermaidRendererReturn {
  isRendering: boolean;
  error: string | null;
  renderCount: number;
  lastRenderTime: number;
  forceRender: () => void;
}

export function useOptimizedMermaidRenderer(): UseOptimizedMermaidRendererReturn {
  const dispatch = useAppDispatch();
  const { mermaidCode, isLoading, error } = useAppSelector((state) => state.diagram);
  const { theme } = useAppSelector((state) => state.ui);

  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);

  const renderCountRef = useRef(0);
  const lastCodeRef = useRef<string>('');
  const lastThemeRef = useRef(theme);
  const renderPromiseRef = useRef<Promise<any> | null>(null);

  // Store current values in refs for stable access
  const currentCodeRef = useRef(mermaidCode);
  const currentThemeRef = useRef(theme);
  const currentDispatchRef = useRef(dispatch);

  // Update refs when values change
  useEffect(() => {
    currentCodeRef.current = mermaidCode;
  }, [mermaidCode]);

  useEffect(() => {
    currentThemeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    currentDispatchRef.current = dispatch;
  }, [dispatch]);

  // Memoized render function - STABLE REFERENCE
  const performRender = useCallback(async () => {
    const startTime = performance.now();

    try {
      // Use refs to get current values
      const currentCode = currentCodeRef.current;
      const currentTheme = currentThemeRef.current;
      const currentDispatch = currentDispatchRef.current;

      // Check if we actually need to render
      if (lastCodeRef.current === currentCode && lastThemeRef.current === currentTheme) {
        return;
      }

      // Cancel any pending render
      if (renderPromiseRef.current) {
        // TODO: Implement cancellation logic if needed
      }

      // Update refs
      lastCodeRef.current = currentCode;
      lastThemeRef.current = currentTheme;
      renderCountRef.current++;

      // Dispatch render action
      const promise = currentDispatch(
        renderDiagram({ code: currentCode, theme: currentTheme === 'dark' ? Theme.Dark : Theme.Light })
      );
      renderPromiseRef.current = promise;

      await promise;

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setRenderCount(renderCountRef.current);
      setLastRenderTime(renderTime);
    } catch (error) {
      console.error('Render error:', error);
    } finally {
      renderPromiseRef.current = null;
    }
  }, []); // REMOVED ALL DEPENDENCIES to prevent infinite recreation

  // Debounced render function with increased delay - STABLE REFERENCE
  const debouncedRender = useMemo(() => debounce(performRender, UI_CONFIG.DEBOUNCE_DELAY), []);

  // Effect to trigger renders - REMOVED debouncedRender from dependencies to prevent infinite loop
  useEffect(() => {
    if (mermaidCode && mermaidCode.trim().length > 0) {
      debouncedRender();
    }

    // Cleanup function to cancel pending renders
    return () => {
      debouncedRender.cancel?.();
    };
  }, [mermaidCode, theme]); // REMOVED debouncedRender dependency

  // Force render function (bypasses debounce)
  const forceRender = useCallback(() => {
    performRender();
  }, [performRender]);

  // Performance monitoring
  useEffect(() => {
    if (renderCount > 0 && lastRenderTime > 0) {
      const avgRenderTime = lastRenderTime;

      // Log performance warning if render is slow
      if (avgRenderTime > 500) {
        // slow render detected
      }

      // Report to performance monitoring service if needed
      if (window.performance && window.performance.mark) {
        window.performance.mark('mermaid-render-complete');
        window.performance.measure('mermaid-render', 'mermaid-render-start', 'mermaid-render-complete');
      }
    }
  }, [renderCount, lastRenderTime]);

  return {
    isRendering: isLoading,
    error,
    renderCount,
    lastRenderTime,
    forceRender,
  };
}

/**
 * Hook to get the current render result
 */
export function useMermaidRenderResult(): MermaidRenderResult | null {
  return useAppSelector((state) => state.diagram.renderResult);
}

/**
 * Hook to manually set render result (useful for testing)
 */
export function useSetMermaidRenderResult() {
  const dispatch = useAppDispatch();

  return useCallback(
    (result: MermaidRenderResult | null) => {
      dispatch(setRenderResult(result));
    },
    [dispatch]
  );
}

/**
 * Hook to check if diagram is valid
 */
export function useIsDiagramValid(): boolean {
  const { error, renderResult } = useAppSelector((state) => state.diagram);

  return useMemo(() => {
    return !error && renderResult !== null && !renderResult.error;
  }, [error, renderResult]);
}

/**
 * Hook to get diagram statistics
 */
export function useDiagramStats() {
  const { mermaidCode, history } = useAppSelector((state) => state.diagram);

  return useMemo(() => {
    const lines = mermaidCode.split('\n').length;
    const characters = mermaidCode.length;
    const words = mermaidCode.split(/\s+/).filter(Boolean).length;

    // Simple complexity estimation based on certain keywords
    const complexityKeywords = ['subgraph', 'loop', 'alt', 'opt', 'par', 'critical', 'break'];

    const complexity = complexityKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = mermaidCode.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    return {
      lines,
      characters,
      words,
      complexity,
      historySize: history.length,
    };
  }, [mermaidCode, history]);
}
