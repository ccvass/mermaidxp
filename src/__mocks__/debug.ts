/**
 * Mock para el módulo debug
 * Proporciona una implementación simple para tests
 */

interface DebugFunction {
  (message: string, ...args: any[]): void;
  enabled: boolean;
  namespace: string;
}

function createDebugFunction(namespace: string): DebugFunction {
  const debugFn = (message: string, ...args: any[]) => {
    if (debugFn.enabled) {
      console.log(`[${namespace}]`, message, ...args);
    }
  };

  debugFn.enabled = false;
  debugFn.namespace = namespace;

  return debugFn;
}

function debug(namespace: string): DebugFunction {
  return createDebugFunction(namespace);
}

// Propiedades adicionales del módulo debug
debug.enabled = () => false;
debug.disable = () => {};
debug.enable = () => {};
debug.coerce = (val: any) => val;
debug.formatters = {};

export default debug;
export { debug };
