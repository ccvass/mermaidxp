import React, { useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setMermaidCode, setSheets, clearSheets } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { captureNow } from '../../store/slices/historyEngineSlice';
import { deleteElements } from '../../store/slices/canvasElementsSlice';
import { useAuth } from '../../contexts/AuthContext';
import { parseMdToSheets } from '../../utils/mdParser';
import { LoginModal } from '../auth/LoginModal';

interface FileOperationsProps {
  className?: string;
}

interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  preview?: string;
}

const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
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

export const FileOperations: React.FC<FileOperationsProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const mermaidCode = useAppSelector((state) => state.diagram.mermaidCode);
  const canvasElements = useAppSelector((state) => state.canvasElements.elements);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // New Document with template selection
  const handleNewDocument = useCallback(
    (template?: DiagramTemplate) => {
      // Blank document = empty string, template = template code
      const newCode = template ? template.code : '';

      // Clear all canvas elements (icons, text, images, shapes)
      const elementIds = Object.keys(canvasElements);
      if (elementIds.length > 0) {
        dispatch(deleteElements(elementIds));
      }

      dispatch(clearSheets());
      dispatch(setMermaidCode(newCode));
      dispatch(captureNow({ actionType: 'New document created' }));
      dispatch(
        showNotification({
          message: template ? `New ${template.name} created` : 'Blank document created',
          type: 'success',
        })
      );

      setShowTemplates(false);
    },
    [dispatch, canvasElements]
  );

  // Open file from local system
  const handleOpenFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          // Clear all canvas elements when opening a file
          const elementIds = Object.keys(canvasElements);
          if (elementIds.length > 0) {
            dispatch(deleteElements(elementIds));
          }

          // Check if MD file contains mermaid blocks → sheets mode
          const isMd = file.name.endsWith('.md');
          const sheets = isMd ? parseMdToSheets(content) : [];

          if (isMd && sheets.length >= 1) {
            dispatch(setSheets(sheets));
          } else {
            dispatch(clearSheets());
            dispatch(setMermaidCode(content));
          }

          dispatch(captureNow({ actionType: `Opened file: ${file.name}` }));
          dispatch(
            showNotification({
              message: `File "${file.name}" opened successfully`,
              type: 'success',
            })
          );

          // Add to recent files
          const newRecentFiles = [file.name, ...recentFiles.filter((f) => f !== file.name)].slice(0, 5);
          setRecentFiles(newRecentFiles);
          localStorage.setItem('mermaidxp-recent-files', JSON.stringify(newRecentFiles));
        }
      };
      reader.readAsText(file);

      // Reset input
      event.target.value = '';
    },
    [dispatch, recentFiles, canvasElements]
  );

  // Save As functionality
  const handleSaveAs = useCallback(
    (format: 'mmd' | 'md' | 'txt' = 'mmd') => {
      // Require authentication for save
      if (!user) {
        setShowLoginModal(true);
        dispatch(
          showNotification({
            message: 'You must sign in to save diagrams',
            type: 'warning',
          })
        );
        return;
      }

      if (!mermaidCode.trim()) {
        dispatch(
          showNotification({
            message: 'Nothing to save. Please create a diagram first.',
            type: 'info',
          })
        );
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `diagram-${timestamp}.${format}`;

      let content = mermaidCode;
      if (format === 'md') {
        content = `# Mermaid Diagram\n\n\`\`\`mermaid\n${mermaidCode}\n\`\`\``;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(
        showNotification({
          message: `File saved as "${filename}"`,
          type: 'success',
        })
      );
    },
    [mermaidCode, dispatch]
  );

  // Import from URL
  const handleImportFromUrl = useCallback(async () => {
    const url = prompt('Enter URL to import diagram from:');
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const content = await response.text();
      dispatch(setMermaidCode(content));
      dispatch(captureNow({ actionType: `Imported from URL: ${url}` }));
      dispatch(
        showNotification({
          message: 'Diagram imported successfully from URL',
          type: 'success',
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          message: `Failed to import from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        })
      );
    }
  }, [dispatch]);

  // Load recent files from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('mermaidxp-recent-files');
    if (stored) {
      try {
        setRecentFiles(JSON.parse(stored));
      } catch {}
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* File Operations Dropdown */}
      <div className="flex items-center space-x-2">
        {/* New Document */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="New Document (Ctrl+N)"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>

          {/* Templates Dropdown */}
          {showTemplates && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Choose Template</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <button
                  onClick={() => handleNewDocument()}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                >
                  <div className="font-medium text-gray-900 dark:text-white">Blank Document</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Start with empty diagram</div>
                </button>
                {DIAGRAM_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleNewDocument(template)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{template.description}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{template.category}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Open File */}
        <button
          onClick={handleOpenFile}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Open File (Ctrl+O)"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          Open
        </button>

        {/* Save As */}
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Save As (Ctrl+S)"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Save As
          </button>

          {/* Export Options Dropdown */}
          {showExportOptions && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  handleSaveAs('mmd');
                  setShowExportOptions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
              >
                <div className="font-medium text-gray-900 dark:text-white">Mermaid (.mmd)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Native Mermaid format</div>
              </button>
              <button
                onClick={() => {
                  handleSaveAs('md');
                  setShowExportOptions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
              >
                <div className="font-medium text-gray-900 dark:text-white">Markdown (.md)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Markdown with code block</div>
              </button>
              <button
                onClick={() => {
                  handleSaveAs('txt');
                  setShowExportOptions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white">Text (.txt)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Plain text format</div>
              </button>
            </div>
          )}
        </div>

        {/* Import from URL */}
        <button
          onClick={handleImportFromUrl}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Import from URL"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Import
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mmd,.md,.txt,.mermaid"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside to close dropdowns */}
      {(showTemplates || showExportOptions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowTemplates(false);
            setShowExportOptions(false);
          }}
        />
      )}

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default FileOperations;
