import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { AuthProvider } from './contexts/AuthContext';

// Import migrated components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CodeEditor } from './components/editor/CodeEditor';
import { MainCanvas } from './components/canvas/MainCanvas';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Import services and utilities
import { APP_TITLE } from './constants/ui.constants';
import { setMermaidCode, setSheets, clearSheets } from './store/slices/diagramSlice';
import { showNotification } from './store/slices/uiSlice';
import { deleteElements } from './store/slices/canvasElementsSlice';
import { parseMdToSheets } from './utils/mdParser';

// Import existing components that are working
import NotificationContainer from './components/common/NotificationContainer';
// Lazy-loaded components for better performance
import { LazyExportController, LazyUndoRedoManager } from './components/lazy';
// NotificationSystem disabled
import { KeyboardManager } from './components/KeyboardManager';
import { setFeatureEnabled, captureNow } from './store/slices/historyEngineSlice';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  // const { mermaidCode } = useAppSelector((state) => state.diagram);
  const canvasElements = useAppSelector((state) => state.canvasElements.elements);
  const diagramContainerRef = React.useRef<HTMLDivElement>(null);
  const featureEnabled = useAppSelector((state) => state.historyEngine.featureEnabled);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = React.useRef(0);

  // Process a dropped file (same logic as FileOperations.handleFileSelect)
  const processDroppedFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) return;

        // Clear canvas elements
        const elementIds = Object.keys(canvasElements);
        if (elementIds.length > 0) {
          dispatch(deleteElements(elementIds));
        }

        const isMd = file.name.endsWith('.md');
        const sheets = isMd ? parseMdToSheets(content) : [];

        if (isMd && sheets.length >= 1) {
          dispatch(setSheets(sheets));
        } else if (isMd && sheets.length === 0) {
          dispatch(
            showNotification({
              message: 'No mermaid diagrams found in this markdown file.',
              type: 'warning',
            })
          );
          return;
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
      };
      reader.readAsText(file);
    },
    [dispatch, canvasElements]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['mmd', 'md', 'txt', 'mermaid'].includes(ext || '')) {
        dispatch(
          showNotification({
            message: 'Unsupported file type. Use .mmd, .md, .txt, or .mermaid',
            type: 'warning',
          })
        );
        return;
      }

      processDroppedFile(file);
    },
    [dispatch, processDroppedFile]
  );

  // Make store available globally for debugging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).store = store;
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Enable unified history engine on mount for this build and capture initial snapshot
  useEffect(() => {
    dispatch(setFeatureEnabled(true));

    // Capture initial snapshot after a delay to ensure everything is initialized
    setTimeout(() => {
      dispatch(captureNow({ actionType: 'initial' }));
    }, 500);
  }, [dispatch]);

  // Setup external API for rendering
  useEffect(() => {
    window.renderMermaidFromExternal = (code: string) => {
      dispatch(setMermaidCode(code));
      dispatch(
        showNotification({
          message: 'Diagram updated via external call',
          type: 'success',
        })
      );
    };

    return () => {
      delete window.renderMermaidFromExternal;
    };
  }, [dispatch]);

  // File operations are handled within Header > FileOperations

  const isPresentationMode = useAppSelector((state) => state.ui.isPresentationMode);

  return (
    <ErrorBoundary>
      <div
        className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 relative"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-[9999] bg-blue-500/10 border-4 border-dashed border-blue-500 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-lg text-blue-600 dark:text-blue-400 font-semibold text-lg">
              Drop file to open (.mmd, .md, .txt)
            </div>
          </div>
        )}

        {/* Header - Hidden in presentation mode */}
        {!isPresentationMode && <Header title={APP_TITLE} />}

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Hidden in presentation mode */}
          {!isPresentationMode && (
            <Sidebar>
              <CodeEditor />
            </Sidebar>
          )}

          {/* Main canvas area */}
          <MainCanvas ref={diagramContainerRef} />
        </div>

        {/* Notification systems */}
        <NotificationContainer />
        {/* NotificationSystem disabled */}

        {/* Export controller - Lazy loaded */}
        <Suspense fallback={null}>
          <LazyExportController svgContainerRef={diagramContainerRef} />
        </Suspense>

        {/* Undo/Redo Manager (legacy) - Lazy loaded */}
        {!featureEnabled && (
          <Suspense fallback={null}>
            <LazyUndoRedoManager />
          </Suspense>
        )}

        {/* Keyboard Manager for unified history engine */}
        <KeyboardManager />
      </div>
    </ErrorBoundary>
  );
};

// Main App component with Redux Provider and Auth
const App: React.FC = () => (
  <Provider store={store}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Provider>
);

export default App;
