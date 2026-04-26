import { vi } from 'vitest';
import { debounce } from '../debounce';

// Mock timers
vi.useFakeTimers();

describe('debounce utility', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  describe('Basic functionality', () => {
    it('should delay function execution', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(99);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass correct arguments to debounced function', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 123, { key: 'value' });
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123, { key: 'value' });
    });

    it('should only execute the last call when called multiple times', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should reset timer on each call', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(50);

      debouncedFn('second');
      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledWith('second');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Immediate execution', () => {
    it('should execute immediately when immediate=true', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, true);

      debouncedFn('immediate');
      expect(mockFn).toHaveBeenCalledWith('immediate');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not execute again during wait period with immediate=true', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, true);

      debouncedFn('first');
      expect(mockFn).toHaveBeenCalledTimes(1);

      debouncedFn('second');
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should allow execution again after wait period with immediate=true', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, true);

      debouncedFn('first');
      expect(mockFn).toHaveBeenCalledWith('first');

      vi.advanceTimersByTime(100);

      debouncedFn('second');
      expect(mockFn).toHaveBeenCalledWith('second');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cancel functionality', () => {
    it('should provide a cancel method', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(typeof debouncedFn.cancel).toBe('function');
    });

    it('should cancel pending execution when cancel is called', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should allow new executions after cancel', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('cancelled');
      debouncedFn.cancel();

      debouncedFn('new call');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('new call');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should be safe to call cancel multiple times', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      debouncedFn.cancel();
      debouncedFn.cancel();
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should be safe to call cancel when no timeout is pending', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(() => debouncedFn.cancel()).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should work with zero delay', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn('zero delay');
      vi.advanceTimersByTime(0);

      expect(mockFn).toHaveBeenCalledWith('zero delay');
    });

    it('should work with very large delays', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 1000000);

      debouncedFn('large delay');
      vi.advanceTimersByTime(999999);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledWith('large delay');
    });

    it('should handle function that throws', () => {
      const throwingFn = vi.fn(() => {
        throw new Error('Test error');
      });
      const debouncedFn = debounce(throwingFn, 100);

      debouncedFn();

      expect(() => {
        vi.advanceTimersByTime(100);
      }).toThrow('Test error');

      expect(throwingFn).toHaveBeenCalled();
    });

    it('should maintain this context when possible', () => {
      const obj = {
        value: 'test',
        method: function (this: { value: string }) {
          return this.value;
        },
      };

      const debouncedMethod = debounce(obj.method.bind(obj), 100);
      // Bind the method to preserve context

      expect(() => {
        debouncedMethod();
        vi.advanceTimersByTime(100);
      }).not.toThrow();
    });
  });

  describe('Type safety', () => {
    it('should preserve function signature for typed functions', () => {
      const typedFn = (a: string, b: number): string => `${a}-${b}`;
      const debouncedTypedFn = debounce(typedFn, 100);

      // These should compile without TypeScript errors
      debouncedTypedFn('test', 123);

      // This would cause a TypeScript error if types weren't preserved:
      // debouncedTypedFn(123, 'test'); // Wrong argument types
      // debouncedTypedFn('test'); // Missing argument

      vi.advanceTimersByTime(100);
    });
  });

  describe('Performance', () => {
    it('should not execute function multiple times with rapid calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Simulate rapid calls
      for (let i = 0; i < 100; i++) {
        debouncedFn(`call-${i}`);
        vi.advanceTimersByTime(10);
      }

      // Should only execute once with the last call
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call-99');
    });

    it('should clear timeouts properly to avoid memory leaks', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      // Each call should clear the previous timeout
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);

      clearTimeoutSpy.mockRestore();
    });
  });
});
