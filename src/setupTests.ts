import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.mermaid
const mockMermaid = {
  initialize: vi.fn(),
  render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  parseError: vi.fn(),
};

Object.defineProperty(window, 'mermaid', {
  value: mockMermaid,
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock DOMParser for SVG validation
global.DOMParser = vi.fn().mockImplementation(() => ({
  parseFromString: vi.fn().mockReturnValue({
    querySelectorAll: vi.fn().mockReturnValue([]),
  }),
}));

// Mock performance.now for performance tests without breaking fake timers
try {
  if ((global as any).performance && typeof (global as any).performance.now === 'function') {
    vi.spyOn((global as any).performance, 'now').mockImplementation(() => Date.now());
  } else {
    Object.defineProperty(global, 'performance', {
      value: { now: vi.fn(() => Date.now()) },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // If overriding fails, ignore to keep tests running
}

// Filter known React/jsdom noise — real errors pass through
// Each pattern is documented with its source to avoid hiding real bugs
const SUPPRESSED_PATTERNS = [
  /Warning: ReactDOM\.render is no longer supported/, // React 18 migration noise
  /Warning: An update to .* inside a test was not wrapped in act/, // async state updates in tests
  /Error: Not implemented: navigation/, // jsdom limitation
  /Error: Could not parse CSS stylesheet/, // jsdom CSS limitation
];

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (SUPPRESSED_PATTERNS.some((p) => p.test(msg))) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
