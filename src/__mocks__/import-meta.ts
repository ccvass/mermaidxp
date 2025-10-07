// Mock for import.meta in Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        NODE_ENV: 'test',
        PROD: false,
        DEV: false,
        TEST: true,
      },
    },
  },
  writable: true,
  configurable: true,
});

export {};
