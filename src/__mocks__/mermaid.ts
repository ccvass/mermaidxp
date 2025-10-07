import { MermaidRenderResult } from '../types/diagram.types';

// Mock implementation of Mermaid for Jest
const mockMermaidRender = jest.fn().mockResolvedValue({
  svg: '<svg><g><rect x="10" y="10" width="100" height="50"/><text x="60" y="35">Test Node</text></g></svg>',
  bindFunctions: jest.fn(),
} as MermaidRenderResult);

const mockMermaidInitialize = jest.fn();

const mermaid = {
  initialize: mockMermaidInitialize,
  render: mockMermaidRender,
  parseError: jest.fn(),
  mermaidAPI: {
    initialize: mockMermaidInitialize,
    render: mockMermaidRender,
  },
};

export default mermaid;
export { mockMermaidRender, mockMermaidInitialize };
