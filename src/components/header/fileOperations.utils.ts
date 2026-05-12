export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  preview?: string;
}

export interface RecentFile {
  name: string;
  content: string;
  date: string;
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    description: 'Simple flowchart template',
    category: 'Flowchart',
    code: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
  },
  {
    id: 'sequence-basic',
    name: 'Basic Sequence',
    description: 'Simple sequence diagram template',
    category: 'Sequence',
    code: `sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Request
    B-->>A: Response`,
  },
  {
    id: 'class-basic',
    name: 'Basic Class Diagram',
    description: 'Simple class diagram template',
    category: 'Class',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`,
  },
  {
    id: 'gitgraph-basic',
    name: 'Basic Git Graph',
    description: 'Simple git workflow template',
    category: 'Git',
    code: `gitgraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop`,
  },
  {
    id: 'mindmap-basic',
    name: 'Basic Mind Map',
    description: 'Simple mind map template',
    category: 'Mind Map',
    code: `mindmap
  root((Project))
    Planning
      Research
      Requirements
      Timeline
    Development
      Frontend
      Backend
      Testing
    Deployment
      Staging
      Production`,
  },
];

export function loadRecentFiles(): RecentFile[] {
  const stored = localStorage.getItem('mermaidxp-recent-files');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (typeof parsed[0] === 'string') {
        // Old format (string[]) — discard since we need content
        localStorage.removeItem('mermaidxp-recent-files');
        return [];
      }
      return parsed;
    }
  } catch {
    // Corrupted data
  }
  return [];
}

export function saveRecentFiles(files: RecentFile[]): void {
  localStorage.setItem('mermaidxp-recent-files', JSON.stringify(files));
}

export function addToRecentFiles(entry: RecentFile, existing: RecentFile[]): RecentFile[] {
  return [entry, ...existing.filter((f) => f.name !== entry.name)].slice(0, 5);
}

export function createDownloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatMermaidAsMarkdown(code: string): string {
  return `# Mermaid Diagram\n\n\`\`\`mermaid\n${code}\n\`\`\``;
}

export function generateFilename(format: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `diagram-${timestamp}.${format}`;
}
