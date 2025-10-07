import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing cleanup of side effects
 * Prevents memory leaks and race conditions
 */
export const useCleanupEffect = () => {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  // Cleanup function
  const cleanup = () => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach((interval) => clearInterval(interval));
    intervalsRef.current.clear();

    // Abort all pending requests
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();
  };

  // Safe setTimeout with automatic cleanup
  const safeSetTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      callback();
    }, delay);

    timeoutsRef.current.add(timeout);
    return timeout;
  };

  // Safe setInterval with automatic cleanup
  const safeSetInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const interval = setInterval(callback, delay);
    intervalsRef.current.add(interval);
    return interval;
  };

  // Safe AbortController with automatic cleanup
  const createAbortController = (): AbortController => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  };

  // Manual cleanup functions
  const clearSafeTimeout = (timeout: NodeJS.Timeout) => {
    clearTimeout(timeout);
    timeoutsRef.current.delete(timeout);
  };

  const clearSafeInterval = (interval: NodeJS.Timeout) => {
    clearInterval(interval);
    intervalsRef.current.delete(interval);
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    safeSetTimeout,
    safeSetInterval,
    createAbortController,
    clearSafeTimeout,
    clearSafeInterval,
    cleanup,
  };
};
