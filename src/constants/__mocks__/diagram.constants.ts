export const DEFAULT_MERMAID_CODE = `graph TD
    A[Start] --> B{Is it?};
    B -- Yes --> C[OK];
    C --> D[End];
    B -- No --> E[Find Solution];
    E --> F[<img src='https://picsum.photos/80/50?random=1' alt='solution image'/><br/>Solution Found?];
    F -- Yes --> C;
    F -- No --> G[Give Up!];
    G --> D;

    subgraph "Additional Elements"
        N1(Rounded Node)
        N2([Rectangular Node])
        N3[/Parallelogram Node/]
        N4((Circular Node))
    end

    style A fill:#9f9,stroke:#333,stroke-width:2px,color:#000
    style D fill:#f99,stroke:#333,stroke-width:2px,color:#000
    style F text-align:center
`;

// Mock configuration for tests - always use 'loose' security for testing

export const MERMAID_CONFIG_LIGHT = {
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose', // Always loose for tests
  logLevel: 'error',
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
  securityLevel: 'loose', // Always loose for tests
  logLevel: 'error',
  flowchart: {
    htmlLabels: true,
    useMaxWidth: true,
  },
  maxTextSize: 50000,
  maxEdges: 500,
  maxVertices: 200,
};

export const VALIDATION_CONFIG = {
  MAX_CODE_LENGTH: 100000,
  MAX_URLS: 10,
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
  BLOCKED_PATTERNS: [/<script/i, /javascript:/i, /on\w+\s*=/i],
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
  'flowchart-node',
  'flowchart-rect',
  'flowchart-circle',
  'flowchart-diamond',
  'flowchart-ellipse',
  'flowchart-odd',
  'flowchart-rhombus',
  'nodeLabel',
  'nodeText',
  'basic',
  'rect',
  'circle',
  'diamond',
  'odd',
  'rhombus',
  'class',
  'classBox',
  'classTitle',
  'classText',
  'stateBox',
  'stateText',
  'statediagram-state',
  'actor-box',
  'actor-text',
  'activation',
  'entity',
  'entityBox',
  'entityLabel',
  'taskText',
  'taskRect',
  'section',
  'commit-id',
  'commit-msg',
  'commit-type',
  'journey-section',
  'journey-task',
  'label-container',
  'label-text',
];
