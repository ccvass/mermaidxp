/**
 * useWebService Hook - DISABLED
 * Prevents WebSocket service errors
 */

export interface UseWebServiceCallbacks {
  onDiagramReceived?: (diagram: any) => void;
  onDiagramSent?: (result: any) => void;
  onExportCompleted?: (result: any) => void;
  onError?: (error: any) => void;
  onConnection?: (status: boolean) => void;
}

export interface UseWebServiceReturn {
  isConnected: boolean;
  sendDiagram: (diagram: any) => Promise<any>;
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
