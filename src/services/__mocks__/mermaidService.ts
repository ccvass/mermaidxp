/* eslint-disable @typescript-eslint/no-unused-vars */
import { MermaidRenderResult } from '../../types/diagram.types';
import { Theme } from '../../types/ui.types';

// Mock MermaidService class for testing
class MockMermaidService {
  private initialized = false;

  async initialize(_theme: Theme = Theme.Light): Promise<void> {
    this.initialized = true;
    return Promise.resolve();
  }

  async render(_code: string, _theme: Theme = Theme.Light): Promise<MermaidRenderResult> {
    if (!this.initialized) {
      await this.initialize(_theme);
    }

    // Mock successful render
    return {
      svg: '<svg><g><text>Mock Diagram</text></g></svg>',
      error: null,
    };
  }

  async parse(code: string): Promise<boolean> {
    // Simple mock validation - just check if code is not empty
    return code.trim().length > 0;
  }

  async validate(_code: string): Promise<{ isValid: boolean; error?: string }> {
    if (!_code.trim()) {
      return { isValid: false, error: 'Code cannot be empty' };
    }
    return { isValid: true };
  }

  async detectType(code: string): Promise<string> {
    // Simple detection based on first line
    const firstLine = code.trim().split('\n')[0].toLowerCase();
    if (firstLine.includes('graph')) return 'flowchart';
    if (firstLine.includes('sequencediagram')) return 'sequence';
    if (firstLine.includes('classdiagram')) return 'class';
    if (firstLine.includes('statediagram')) return 'state';
    if (firstLine.includes('gantt')) return 'gantt';
    if (firstLine.includes('pie')) return 'pie';
    return 'flowchart'; // default
  }

  setTheme(_theme: Theme): void {
    // Mock theme setting
  }

  getConfig(theme: Theme) {
    return {
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'neutral',
      securityLevel: 'loose',
      logLevel: 'error',
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
      },
      maxTextSize: 50000,
      maxEdges: 500,
      maxVertices: 200,
    };
  }

  reset(): void {
    this.initialized = false;
  }
}

// Export singleton instance
export const mermaidService = new MockMermaidService();

// Also export the class for testing
export { MockMermaidService };
export default mermaidService;
