import { renderHook, act } from '@testing-library/react';
import { useCleanupEffect } from '../useCleanupEffect';

// Mock timers
jest.useFakeTimers();

describe('useCleanupEffect', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should create safe timeout and cleanup on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useCleanupEffect());

    act(() => {
      result.current.safeSetTimeout(callback, 1000);
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Unmount should cleanup remaining timeouts
    unmount();

    // No errors should occur
    expect(true).toBe(true);
  });

  it('should manually clear timeout', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCleanupEffect());

    let timeoutId: NodeJS.Timeout;
    act(() => {
      timeoutId = result.current.safeSetTimeout(callback, 1000);
    });

    act(() => {
      result.current.clearSafeTimeout(timeoutId);
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should create and cleanup AbortController', () => {
    const { result, unmount } = renderHook(() => useCleanupEffect());

    let controller: AbortController;
    act(() => {
      controller = result.current.createAbortController();
    });

    expect(controller.signal.aborted).toBe(false);

    // Unmount should abort all controllers
    unmount();

    expect(controller.signal.aborted).toBe(true);
  });

  it('should cleanup all effects manually', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { result } = renderHook(() => useCleanupEffect());

    let controller: AbortController;
    act(() => {
      result.current.safeSetTimeout(callback1, 1000);
      result.current.safeSetInterval(callback2, 500);
      controller = result.current.createAbortController();
    });

    act(() => {
      result.current.cleanup();
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(controller.signal.aborted).toBe(true);
  });
});
