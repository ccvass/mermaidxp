import { API_CONFIG, SAVE_DIAGRAM_ENDPOINT, WEB_SERVICE_CONFIG } from '../constants/api.constants';
import { SaveDiagramRequest, SaveDiagramResponse } from '../types/api.types';

class ApiService {
  private abortControllers: Map<string, AbortController> = new Map();

  async saveDiagram(mermaidCode: string, metadata?: SaveDiagramRequest['metadata']): Promise<SaveDiagramResponse> {
    const requestId = 'save-diagram';

    // Cancel any pending save request
    this.cancelRequest(requestId);

    // Create new abort controller
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await this.fetchWithRetry(
        SAVE_DIAGRAM_ENDPOINT,
        {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({
            mermaidCode,
            metadata,
          } as SaveDiagramRequest),
          signal: abortController.signal,
        },
        API_CONFIG.RETRY_ATTEMPTS
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save diagram: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      return result as SaveDiagramResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Save request was cancelled');
      }
      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  async loadDiagram(id: string): Promise<{ mermaidCode: string; metadata?: Record<string, unknown> }> {
    const requestId = `load-diagram-${id}`;

    // Cancel any pending load request for this ID
    this.cancelRequest(requestId);

    // Create new abort controller
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await this.fetchWithRetry(
        `${SAVE_DIAGRAM_ENDPOINT}/${id}`,
        {
          method: 'GET',
          headers: API_CONFIG.HEADERS,
          signal: abortController.signal,
        },
        API_CONFIG.RETRY_ATTEMPTS
      );

      if (!response.ok) {
        throw new Error(`Failed to load diagram: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Load request was cancelled');
      }
      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries: number): Promise<Response> {
    let lastError: Error | null = null;
    const callerSignal = options.signal;

    for (let i = 0; i <= retries; i++) {
      const attemptController = new AbortController();

      // Forward caller's abort to per-attempt controller
      if (callerSignal) {
        if (callerSignal.aborted) {
          attemptController.abort();
        } else {
          callerSignal.addEventListener('abort', () => attemptController.abort(), { once: true });
        }
      }

      const timeoutId = setTimeout(() => attemptController.abort(), API_CONFIG.TIMEOUT);

      try {
        const response = await fetch(url, { ...options, signal: attemptController.signal });
        clearTimeout(timeoutId);

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // Retry on server errors (5xx) or network errors
        if (!response.ok && i < retries) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          await this.delay(API_CONFIG.RETRY_DELAY * Math.pow(2, i));
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Don't retry on caller-initiated abort
        if (callerSignal?.aborted) {
          throw lastError;
        }

        // Retry on network errors and timeouts
        if (i < retries) {
          await this.delay(API_CONFIG.RETRY_DELAY * Math.pow(2, i));
          continue;
        }
      }
    }

    throw lastError || new Error('Failed to fetch after retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  // Helper method to check if the API is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${WEB_SERVICE_CONFIG.BASE_URL}${WEB_SERVICE_CONFIG.ENDPOINTS.HEALTH}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
