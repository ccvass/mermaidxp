// Application starts with empty diagram
export const DEFAULT_MERMAID_CODE = ``;

// Secure configuration for production
const isProduction = import.meta.env.MODE === 'production';

export const MERMAID_CONFIG_LIGHT = {
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: isProduction ? 'strict' : 'loose',
  logLevel: 'error', // Always use error level to reduce console noise
  flowchart: {
    htmlLabels: true,
    useMaxWidth: true,
  },
  maxTextSize: 50000,
  maxEdges: 500,
  maxVertices: 200,
};

export const MERMAID_CONFIG_DARK = {
  startOnLoad: false,
  theme: 'dark',
  securityLevel: isProduction ? 'strict' : 'loose',
  logLevel: 'error', // Always use error level to reduce console noise
  flowchart: {
    htmlLabels: true,
    useMaxWidth: true,
  },
  maxTextSize: 50000,
  maxEdges: 500,
  maxVertices: 200,
};

export const VALIDATION_CONFIG = {
  MAX_CODE_LENGTH: 100000, // Maximum 100KB of code
  MAX_URLS: 10, // Maximum number of URLs allowed in code
  ALLOWED_DIAGRAM_TYPES: [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'journey',
    'gantt',
    'pie',
    'gitgraph',
    'requirement',
    'c4Context',
  ],
  BLOCKED_PATTERNS: [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // HTML events like onclick, onload, etc.
  ],
};

export const DRAGGABLE_ELEMENT_CLASSES = [
  'node',
  'cluster',
  'actor',
  'erNode',
  'section',
  'task',
  'note',
  'requirement',
  'element',
  'commit',
  'state',
  'participant',
  'pieCircle',
  'pieSlice',
  'lane',
  // Flowchart specific classes
  'flowchart-node',
  'flowchart-rect',
  'flowchart-circle',
  'flowchart-diamond',
  'flowchart-ellipse',
  'flowchart-odd',
  'flowchart-rhombus',
  // Generic node classes
  'nodeLabel',
  'nodeText',
  'basic',
  'rect',
  'circle',
  'diamond',
  'odd',
  'rhombus',
  // Class diagram classes
  'class',
  'classBox',
  'classTitle',
  'classText',
  // State diagram classes
  'stateBox',
  'stateText',
  'statediagram-state',
  // Sequence diagram classes
  'actor-box',
  'actor-text',
  'activation',
  // ER diagram classes
  'entity',
  'entityBox',
  'entityLabel',
  // Gantt classes
  'taskText',
  'taskRect',
  'section',
  // Git graph classes
  'commit-id',
  'commit-msg',
  'commit-type',
  // Journey classes
  'journey-section',
  'journey-task',
  // Common Mermaid patterns
  'label-container',
  'label-text',
];
