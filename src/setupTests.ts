import '@testing-library/jest-dom';
import 'jest-fetch-mock/setupJest';

// Mock window.mermaid
const mockMermaid = {
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  parseError: jest.fn(),
};

Object.defineProperty(window, 'mermaid', {
  value: mockMermaid,
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock DOMParser for SVG validation
global.DOMParser = jest.fn().mockImplementation(() => ({
  parseFromString: jest.fn().mockReturnValue({
    querySelectorAll: jest.fn().mockReturnValue([]),
  }),
}));

// Mock performance.now for performance tests without breaking fake timers
try {
  if ((global as any).performance && typeof (global as any).performance.now === 'function') {
    jest.spyOn((global as any).performance, 'now').mockImplementation(() => Date.now());
  } else {
    Object.defineProperty(global, 'performance', {
      value: { now: jest.fn(() => Date.now()) },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // If overriding fails, ignore to keep tests running
}

// Suppress console errors in tests unless explicitly testing error handling
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Ensure DOMParser is available (jsdom provides it but some tests reset it)
if (typeof globalThis.DOMParser === 'undefined') {
  const { JSDOM } = require('jsdom');
  globalThis.DOMParser = new JSDOM().window.DOMParser;
}
