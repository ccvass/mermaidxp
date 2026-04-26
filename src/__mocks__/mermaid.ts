import { vi } from 'vitest';
import { MermaidRenderResult } from '../types/diagram.types';

// Mock implementation of Mermaid for Vitest
const mockMermaidRender = vi.fn().mockResolvedValue({
  svg: '<svg><g><rect x="10" y="10" width="100" height="50"/><text x="60" y="35">Test Node</text></g></svg>',
  bindFunctions: vi.fn(),
} as MermaidRenderResult);

const mockMermaidInitialize = vi.fn();

const mermaid = {
  initialize: mockMermaidInitialize,
  render: mockMermaidRender,
  parseError: vi.fn(),
  mermaidAPI: {
    initialize: mockMermaidInitialize,
    render: mockMermaidRender,
  },
};

export default mermaid;
export { mockMermaidRender, mockMermaidInitialize };
