/**
 * Lazy Mermaid Loader
 * Dynamically loads Mermaid library only when needed
 * Reduces initial bundle size by ~150KB
 */

interface MermaidLoaderStatus {
  loading: boolean;
  loaded: boolean;
  error: Error | null;
}

class LazyMermaidLoader {
  private status: MermaidLoaderStatus = {
    loading: false,
    loaded: false,
    error: null,
  };

  private loadPromise: Promise<void> | null = null;

  /**
   * Check if Mermaid is already available (loaded via CDN in index.html)
   */
  private isMermaidAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.mermaid !== 'undefined';
  }

  /**
   * Load Mermaid library dynamically
   * Returns immediately if already loaded
   */
  async load(): Promise<void> {
    // If already loaded, return immediately
    if (this.status.loaded || this.isMermaidAvailable()) {
      this.status.loaded = true;
      return Promise.resolve();
    }

    // If currently loading, return existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.status.loading = true;
    this.status.error = null;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      // Check if script already exists in DOM
      const existingScript = document.querySelector('script[src*="mermaid"]');
      if (existingScript) {
        // Script exists, wait for it to load
        if (this.isMermaidAvailable()) {
          this.status.loaded = true;
          this.status.loading = false;
          resolve();
        } else {
          existingScript.addEventListener('load', () => {
            this.status.loaded = true;
            this.status.loading = false;
            resolve();
          });
          existingScript.addEventListener('error', () => {
            const error = new Error('Failed to load Mermaid library');
            this.status.error = error;
            this.status.loading = false;
            reject(error);
          });
        }
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.3/dist/mermaid.min.js';
      script.integrity = 'sha384-R63zfMfSwJF4xCR11wXii+QUsbiBIdiDzDbtxia72oGWfkT7WHJfmD/I/eeHPJyT';
      script.crossOrigin = 'anonymous';
      script.async = true;

      script.onload = () => {
        this.status.loaded = true;
        this.status.loading = false;
        resolve();
      };

      script.onerror = () => {
        const error = new Error('Failed to load Mermaid library from CDN');
        console.error('❌ Mermaid loading error:', error);
        this.status.error = error;
        this.status.loading = false;
        reject(error);
      };

      // Append to head
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Get current loading status
   */
  getStatus(): MermaidLoaderStatus {
    return { ...this.status };
  }

  /**
   * Check if Mermaid is ready to use
   */
  isReady(): boolean {
    return this.status.loaded || this.isMermaidAvailable();
  }

  /**
   * Wait for Mermaid to be ready
   * Returns immediately if already loaded
   */
  async waitForReady(): Promise<void> {
    if (this.isReady()) {
      return Promise.resolve();
    }

    if (this.status.loading && this.loadPromise) {
      return this.loadPromise;
    }

    return this.load();
  }

  /**
   * Reset loader state (for testing)
   */
  reset(): void {
    this.status = {
      loading: false,
      loaded: false,
      error: null,
    };
    this.loadPromise = null;
  }
}

// Export singleton instance
export const mermaidLoader = new LazyMermaidLoader();

// Export helper function for easier use
export async function ensureMermaidLoaded(): Promise<void> {
  return mermaidLoader.load();
}
