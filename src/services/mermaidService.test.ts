import { mermaidService } from './mermaidService';
import { Theme } from '../types/ui.types';
import { MERMAID_CONFIG_LIGHT, MERMAID_CONFIG_DARK } from '../constants/diagram.constants';

describe('MermaidService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    mermaidService.reset();

    // Reset mermaid mock
    window.mermaid = {
      initialize: jest.fn(),
      render: jest.fn(),
      parseError: undefined,
    };
  });

  describe('initialize', () => {
    it('should initialize with light theme by default', async () => {
      await mermaidService.initialize();

      expect(window.mermaid.initialize).toHaveBeenCalledWith(MERMAID_CONFIG_LIGHT);
    });

    it('should initialize with dark theme when specified', async () => {
      await mermaidService.initialize(Theme.Dark);

      expect(window.mermaid.initialize).toHaveBeenCalledWith(MERMAID_CONFIG_DARK);
    });

    it('should handle missing mermaid gracefully', async () => {
      // @ts-ignore - Temporarily remove mermaid
      delete window.mermaid;

      // Should not throw in test environment, handle gracefully
      const result = await mermaidService.initialize();
      expect(result).toBeUndefined();
    });
  });

  describe('render', () => {
    it('should render valid mermaid code', async () => {
      const mockSvg = '<svg>test diagram</svg>';
      const mockBindFunctions = jest.fn();

      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: mockBindFunctions,
      });

      const result = await mermaidService.render('graph TD\n  A --> B', Theme.Light);

      expect(result).toEqual({
        svg: mockSvg,
        bindFunctions: mockBindFunctions,
        error: null,
      });
      expect(window.mermaid.render).toHaveBeenCalledWith('mermaid-graph-1', 'graph TD\n  A --> B');
    });

    it('should initialize if not already initialized', async () => {
      const mockSvg = '<svg>test</svg>';
      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: jest.fn(),
      });

      await mermaidService.render('graph TD\n  A --> B');

      expect(window.mermaid.initialize).toHaveBeenCalledTimes(2); // Once for init, once for render
    });

    it('should update theme configuration on render', async () => {
      // Initialize with light theme
      await mermaidService.initialize(Theme.Light);

      const mockSvg = '<svg>test</svg>';
      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: jest.fn(),
      });

      // Render with dark theme
      await mermaidService.render('graph TD\n  A --> B', Theme.Dark);

      // Should have called initialize with dark config
      expect(window.mermaid.initialize).toHaveBeenLastCalledWith(MERMAID_CONFIG_DARK);
    });

    it('should handle render errors', async () => {
      const errorMessage = 'Syntax error in graph';
      (window.mermaid.render as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const result = await mermaidService.render('invalid syntax');

      expect(result).toEqual({
        svg: '',
        error: errorMessage,
      });
    });

    it('should handle non-Error error objects', async () => {
      (window.mermaid.render as jest.Mock).mockRejectedValue('String error');

      const result = await mermaidService.render('invalid syntax');

      expect(result).toEqual({
        svg: '',
        error: 'String error',
      });
    });

    it('should increment render count for each render', async () => {
      const mockSvg = '<svg>test</svg>';
      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: jest.fn(),
      });

      await mermaidService.render('graph TD\n  A --> B');
      await mermaidService.render('graph TD\n  B --> C');

      expect(mermaidService.getRenderCount()).toBe(2);
      expect(window.mermaid.render).toHaveBeenCalledWith('mermaid-graph-1', 'graph TD\n  A --> B');
      expect(window.mermaid.render).toHaveBeenCalledWith('mermaid-graph-2', 'graph TD\n  B --> C');
    });

    it('should clear previous parse errors before rendering', async () => {
      window.mermaid.parseError = 'Previous error';

      const mockSvg = '<svg>test</svg>';
      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: jest.fn(),
      });

      await mermaidService.render('graph TD\n  A --> B');

      expect(window.mermaid.parseError).toBeUndefined();
    });

    it('should clean up partial renders on error', async () => {
      // Create a mock element to be cleaned up
      const mockElement = document.createElement('div');
      mockElement.id = 'd1';
      document.body.appendChild(mockElement);

      (window.mermaid.render as jest.Mock).mockRejectedValue(new Error('Render failed'));

      await mermaidService.render('invalid syntax');

      // Element should be removed
      expect(document.getElementById('d1')).toBeNull();
    });
  });

  describe('validateCode', () => {
    it('should validate empty code as invalid', () => {
      const result = mermaidService.validateCode('');
      expect(result).toEqual({
        isValid: false,
        error: 'Code cannot be empty',
      });
    });

    it('should validate whitespace-only code as invalid', () => {
      const result = mermaidService.validateCode('   \n\t  ');
      expect(result).toEqual({
        isValid: false,
        error: 'Code cannot be empty',
      });
    });

    it('should validate code without diagram type as invalid', () => {
      const result = mermaidService.validateCode('A --> B');
      expect(result).toEqual({
        isValid: false,
        error: 'Invalid diagram type. Must start with a valid Mermaid diagram type.',
      });
    });

    it('should validate valid flowchart code', () => {
      const result = mermaidService.validateCode('flowchart TD\n  A --> B');
      expect(result).toEqual({ isValid: true });
    });

    it('should validate valid graph code', () => {
      const result = mermaidService.validateCode('graph LR\n  A --> B');
      expect(result).toEqual({ isValid: true });
    });

    it('should validate valid sequence diagram', () => {
      const result = mermaidService.validateCode('sequenceDiagram\n  A->>B: Hello');
      expect(result).toEqual({ isValid: true });
    });

    it('should validate valid class diagram', () => {
      const result = mermaidService.validateCode('classDiagram\n  class Animal');
      expect(result).toEqual({ isValid: true });
    });

    it('should validate case-insensitively', () => {
      const result = mermaidService.validateCode('GRAPH td\n  A --> B');
      expect(result).toEqual({ isValid: true });
    });

    it('should validate all supported diagram types', () => {
      const validTypes = [
        'graph TD',
        'flowchart LR',
        'sequenceDiagram',
        'classDiagram',
        'stateDiagram',
        'erDiagram',
        'journey',
        'gantt',
        'pie title Pets',
        'gitGraph',
        'requirement test',
        'c4Context',
      ];

      validTypes.forEach((type) => {
        const result = mermaidService.validateCode(`${type}\n  some content`);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('extractNodesFromCode', () => {
    it('should extract nodes with square brackets', () => {
      const code = 'graph TD\n  A[Node A]\n  B[Node B]\n  A --> B';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toContain('A');
      expect(nodes).toContain('B');
    });

    it('should extract nodes with round brackets', () => {
      const code = 'graph TD\n  A(Node A)\n  B(Node B)';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toContain('A');
      expect(nodes).toContain('B');
    });

    it('should extract nodes with curly brackets', () => {
      const code = 'graph TD\n  A{Decision}\n  B{Another Decision}';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toContain('A');
      expect(nodes).toContain('B');
    });

    it('should extract nodes with double brackets', () => {
      const code = 'graph TD\n  A[[Subroutine]]\n  B((Circle))';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toContain('A');
      expect(nodes).toContain('B');
    });

    it('should extract nodes with special shapes', () => {
      const code = 'graph TD\n  A>Asymmetric]\n  B|Rectangle|';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toContain('A');
      expect(nodes).toContain('B');
    });

    it('should not extract keywords as nodes', () => {
      const code = 'graph TD\n  class[Class Node]\n  style[Style Node]\n  A[Real Node]';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toEqual(['A']); // 'class' and 'style' are keywords
    });

    it('should extract unique nodes only', () => {
      const code = 'graph TD\n  A[Node A]\n  B[Node B]\n  A --> B\n  B --> A';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toContain('A');
      expect(nodes).toContain('B');
    });

    it('should handle empty code', () => {
      const nodes = mermaidService.extractNodesFromCode('');
      expect(nodes).toEqual([]);
    });

    it('should handle code without nodes', () => {
      const code = 'graph TD';
      const nodes = mermaidService.extractNodesFromCode(code);
      expect(nodes).toEqual([]);
    });
  });

  describe('getRenderCount', () => {
    it('should return 0 initially', () => {
      expect(mermaidService.getRenderCount()).toBe(0);
    });

    it('should increment after each render', async () => {
      const mockSvg = '<svg>test</svg>';
      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: jest.fn(),
      });

      await mermaidService.render('graph TD\n  A --> B');
      expect(mermaidService.getRenderCount()).toBe(1);

      await mermaidService.render('graph TD\n  B --> C');
      expect(mermaidService.getRenderCount()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset initialization state and render count', async () => {
      // Initialize and render something
      await mermaidService.initialize();

      const mockSvg = '<svg>test</svg>';
      (window.mermaid.render as jest.Mock).mockResolvedValue({
        svg: mockSvg,
        bindFunctions: jest.fn(),
      });

      await mermaidService.render('graph TD\n  A --> B');
      expect(mermaidService.getRenderCount()).toBe(1);

      // Reset
      mermaidService.reset();

      // Check reset state
      expect(mermaidService.getRenderCount()).toBe(0);

      // Should initialize again on next render
      await mermaidService.render('graph TD\n  A --> B');
      expect(window.mermaid.initialize).toHaveBeenCalledTimes(4); // 1 initial + 1 for render + 1 after reset + 1 for render
    });
  });
});
