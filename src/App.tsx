import React, { useEffect, Suspense } from 'react';
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

// Import collaboration
// Collaboration disabled

// Import services and utilities
import { APP_TITLE } from './constants/ui.constants';
import { setMermaidCode } from './store/slices/diagramSlice';
import { showNotification } from './store/slices/uiSlice';

// Import existing components that are working
import NotificationContainer from './components/common/NotificationContainer';
// Lazy-loaded components for better performance
import { LazyExportController, LazyUndoRedoManager } from './components/lazy';
// NotificationSystem disabled
import { KeyboardManager } from './components/KeyboardManager';
import { setFeatureEnabled, captureNow } from './store/slices/historyEngineSlice';
// WebServiceIntegration disabled

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  // const { mermaidCode } = useAppSelector((state) => state.diagram);
  const diagramContainerRef = React.useRef<HTMLDivElement>(null);
  const featureEnabled = useAppSelector((state) => state.historyEngine.featureEnabled);

  // Make store available globally for debugging
  React.useEffect(() => {
    (window as any).store = store;
  }, []);

  // Collaboration system disabled

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
      console.log('📸 Initial snapshot captured');
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
      <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
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

        {/* Web Service Integration - DISABLED */}

        {/* Error Recovery for Collaboration - DISABLED */}
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
