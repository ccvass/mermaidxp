// Configuración para pruebas automatizadas con Browser MCP
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
  screenshots: {
    enabled: true,
    path: './tests/browser-mcp/screenshots',
    onFailure: true,
    onSuccess: false,
  },
  selectors: {
    // Editor elements
    codeEditor: 's1e44',
    diagramExamples: 's1e72',

    // Toolbar buttons
    menuToggle: 's1e9',
    diagramTab: 's1e13',
    whiteboardTab: 's1e14',
    openButton: 's1e16',
    saveButton: 's1e19',
    apiButton: 's1e22',
    themeToggle: 's1e29',
    refreshButton: 's1e31',

    // Canvas controls
    addShape: 's1e81',
    addImage: 's1e83',
    addText: 's1e85',
    addIcon: 's1e87',
    undoButton: 's1e90',
    redoButton: 's1e92',
    dragMode: 's1e95',
    zoomIn: 's1e98',
    zoomOut: 's1e100',
    resetZoom: 's1e102',
    centerDiagram: 's1e104',

    // Canvas area
    canvasArea: 's1e123',
    diagramImage: 's1e128',
  },
  testData: {
    simpleDiagram: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,

    complexDiagram: `graph TB
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
    D --> G[End]
    E --> G
    F --> G`,

    flowchartDiagram: `flowchart TD
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]`,
  },
};

export const WAIT_TIMES = {
  short: 1000,
  medium: 3000,
  long: 5000,
  render: 8000,
};
