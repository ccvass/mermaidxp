export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Configuración de módulos optimizada
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^.+/constants/api\\.constants$': '<rootDir>/src/constants/__mocks__/api.constants.ts',
    '^.+/constants/diagram\\.constants$': '<rootDir>/src/constants/__mocks__/diagram.constants.ts',
    '^.*/services/validationService(\\.ts)?$': '<rootDir>/src/services/__mocks__/validationService.ts',
    '^.*/services/exportService(\\.ts)?$': '<rootDir>/src/services/__mocks__/exportService.ts',
    '^.+/services/mermaidService$': '<rootDir>/src/services/__mocks__/mermaidService.ts',
    '^mermaid$': '<rootDir>/src/__mocks__/mermaid.ts',
    // Mapear módulos problemáticos a mocks
    '^@braintree/sanitize-url$': '<rootDir>/src/__mocks__/@braintree/sanitize-url.ts',
    '^.+/config/firebase$': '<rootDir>/src/config/__mocks__/firebase.ts',
    '^debug$': '<rootDir>/src/__mocks__/debug.ts',
  },

  // Configuración de transformación optimizada
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: true,
      },
    ],
  },

  // Add globals for import.meta support
  globals: {
    'import.meta': {
      env: {
        MODE: 'test',
        VITE_APP_VERSION: '1.0.0',
        VITE_SAVE_DIAGRAM_ENDPOINT: '/api/diagrams/save',
        DEV: false,
        PROD: false,
        SSR: false,
      },
    },
  },

  // Optimizar transformIgnorePatterns para incluir módulos problemáticos
  transformIgnorePatterns: [
    'node_modules/(?!(mermaid|d3|d3-.*|dagre-d3|dagre|cytoscape|@braintree/sanitize-url|dayjs|debug|firebase|@firebase)/)',
  ],

  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Configuración de timeouts optimizada
  testTimeout: 10000,
  slowTestThreshold: 5,

  // Configuración de cache optimizada
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Disable memory leak detection as it's experimental and causing issues
  detectOpenHandles: false,
  detectLeaks: false,

  // Configuración de workers optimizada
  maxWorkers: '50%',

  // Configuración de coverage optimizada
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/test/**',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/DiagramDisplay.backup.tsx',
    '!src/**/DiagramDisplay.clean.tsx',
  ],

  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],

  coverageDirectory: 'coverage',

  // Configuración de archivos de test
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{ts,tsx}', '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '\\.skip\\.',
    'DiagramDisplay\\.backup\\.tsx',
    'DiagramDisplay\\.clean\\.tsx',
  ],

  // Configuración de watch mode optimizada
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/', '\\.git/'],

  // Configuración de mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Configuración de verbose
  verbose: false,
  silent: false,

  // Configuración de bail (parar en primer error)
  bail: 0,

  // Configuración de error handling
  errorOnDeprecated: true,

  // Configuración de módulos adicionales
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Configuración de detección de archivos abiertos - disabled to prevent experimental warnings
  detectOpenHandles: false,
  detectLeaks: false,

  // Configuración de force exit
  forceExit: false,

  // Configuración de logging
  logHeapUsage: false,
};
