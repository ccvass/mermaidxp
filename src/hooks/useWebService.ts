/**
 * useWebService Hook - DISABLED
 * Prevents WebSocket service errors
 */

export interface UseWebServiceCallbacks {
  onDiagramReceived?: (diagram: unknown) => void;
  onDiagramSent?: (result: unknown) => void;
  onExportCompleted?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onConnection?: (status: boolean) => void;
}

export interface UseWebServiceReturn {
  isConnected: boolean;
  sendDiagram: (diagram: unknown) => Promise<unknown>;
  receiveDiagram: () => Promise<any>;
  exportDiagram: (format: string) => Promise<any>;
  getConnectionStatus: () => boolean;
}

export const useWebService = (): UseWebServiceReturn => {
  return {
    isConnected: false,
    sendDiagram: () => Promise.resolve(null),
    receiveDiagram: () => Promise.resolve(null),
    exportDiagram: () => Promise.resolve(null),
    getConnectionStatus: () => false,
  };
};

export default useWebService;
