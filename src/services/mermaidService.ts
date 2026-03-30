import { MermaidRenderResult } from '../types/diagram.types';
import { MERMAID_CONFIG_LIGHT, MERMAID_CONFIG_DARK } from '../constants/diagram.constants';
import { Theme } from '../types/ui.types';
import { mermaidLoader } from './lazyMermaidLoader';

class MermaidService {
  private initialized = false;
  private renderCount = 0;
  private lastTheme: Theme | null = null;

  async initialize(theme: Theme = Theme.Light): Promise<void> {
    await mermaidLoader.load();
    if (!window.mermaid) {
      throw new Error('Mermaid library not loaded');
    }
    const config = theme === Theme.Light ? MERMAID_CONFIG_LIGHT : MERMAID_CONFIG_DARK;
    window.mermaid.initialize(config);
    this.initialized = true;
    this.lastTheme = theme;
  }

  async render(code: string, theme: Theme = Theme.Light): Promise<MermaidRenderResult> {
    if (!this.initialized || this.lastTheme !== theme) {
      await this.initialize(theme);
    }

    try {
      // Generate unique ID for this render
      const graphId = `mermaid-graph-${++this.renderCount}`;

      // Clear any previous error state
      if (window.mermaid.parseError) {
        window.mermaid.parseError = undefined;
      }

      // Render the diagram
      const { svg, bindFunctions } = await window.mermaid.render(graphId, code);

      return {
        svg,
        bindFunctions,
        error: null,
      };
    } catch (error) {
      console.error('Mermaid rendering error:', error);

      // Extract error message
      let errorMessage = 'Failed to render diagram';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Clean up any partial renders
      const graphElement = document.getElementById(`d${this.renderCount}`);
      if (graphElement) {
        graphElement.remove();
      }

      return {
        svg: '',
        error: errorMessage,
      };
    }
  }

  validateCode(code: string): { isValid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { isValid: false, error: 'Code cannot be empty' };
    }

    // Check for basic Mermaid syntax
    const validDiagramTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
      'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'requirement',
      'c4Context', 'c4Container', 'c4Component', 'c4Dynamic', 'c4Deployment',
      'mindmap', 'timeline', 'sankey', 'xychart', 'block', 'packet',
      'kanban', 'architecture', 'zenuml', 'quadrantChart',
    ];

    const firstLine = code.trim().split('\n')[0];
    const hasValidType = validDiagramTypes.some((type) => firstLine.toLowerCase().includes(type.toLowerCase()));

    if (!hasValidType) {
      return {
        isValid: false,
        error: 'Invalid diagram type. Must start with a valid Mermaid diagram type.',
      };
    }

    return { isValid: true };
  }

  extractNodesFromCode(code: string): string[] {
    const nodes: string[] = [];

    // Basic regex patterns to extract node IDs
    const patterns = [
      /(\w+)\s*\[/g, // A[text]
      /(\w+)\s*\(/g, // A(text)
      /(\w+)\s*\{/g, // A{text}
      /(\w+)\s*\[\[/g, // A[[text]]
      /(\w+)\s*\(\(/g, // A((text))
      /(\w+)\s*>/g, // A>text]
      /(\w+)\s*\|/g, // A|text|
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const nodeId = match[1];
        if (nodeId && !nodes.includes(nodeId) && !this.isKeyword(nodeId)) {
          nodes.push(nodeId);
        }
      }
    });

    return nodes;
  }

  private isKeyword(word: string): boolean {
    const keywords = [
      'graph',
      'flowchart',
      'subgraph',
      'end',
      'style',
      'class',
      'click',
      'classDef',
      'linkStyle',
      'TB',
      'TD',
      'BT',
      'RL',
      'LR',
      'sequenceDiagram',
      'participant',
      'actor',
      'activate',
      'deactivate',
      'note',
      'over',
      'left',
      'right',
      'loop',
      'alt',
      'else',
      'opt',
      'par',
      'and',
      'rect',
      'classDiagram',
      'class',
      'stateDiagram',
      'state',
      'erDiagram',
      'journey',
      'gantt',
      'pie',
      'gitGraph',
      'requirement',
      'c4Context',
    ];

    return keywords.includes(word.toLowerCase());
  }

  getRenderCount(): number {
    return this.renderCount;
  }

  reset(): void {
    this.initialized = false;
    this.renderCount = 0;
  }
}

export const mermaidService = new MermaidService();
