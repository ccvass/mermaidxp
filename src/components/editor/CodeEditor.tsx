import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { mermaidLanguage } from './mermaidLanguage';

const DiagramSamples = lazy(() => import('./DiagramSamples').then((m) => ({ default: m.DiagramSamples })));

const themeCompartment = new Compartment();
const editableCompartment = new Compartment();

const lightTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'white' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': { backgroundColor: '#f9fafb', borderRight: '1px solid #e5e7eb' },
});

const darkTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: '#1f2937' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': { backgroundColor: '#111827', borderRight: '1px solid #374151' },
});

export const CodeEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mermaidCode, isLoading } = useAppSelector((state) => state.diagram);
  const theme = useAppSelector((state) => state.ui.theme);
  const { beginGroup, endGroup, captureNow } = useHistoryEngine();

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Track whether the last change came from the editor (user typing) to avoid loops
  const isInternalUpdate = useRef(false);

  // Initialize CodeMirror
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = theme === 'dark';

    const state = EditorState.create({
      doc: mermaidCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        highlightSelectionMatches(),
        mermaidLanguage,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        themeCompartment.of(isDark ? [oneDark, darkTheme] : [lightTheme]),
        editableCompartment.of(EditorView.editable.of(!isLoading)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            isInternalUpdate.current = true;
            dispatch(setMermaidCode(update.state.doc.toString()));
          }
          if (update.focusChanged) {
            if (update.view.hasFocus) {
              beginGroup();
            } else {
              endGroup();
              captureNow('text-blur');
            }
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount — theme/loading changes handled by separate effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external mermaidCode changes (undo/redo, samples) into the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== mermaidCode) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: mermaidCode },
      });
    }
  }, [mermaidCode]);

  // Sync theme changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const isDark = theme === 'dark';
    view.dispatch({
      effects: themeCompartment.reconfigure(isDark ? [oneDark, darkTheme] : [lightTheme]),
    });
  }, [theme]);

  // Sync editable state
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: editableCompartment.reconfigure(EditorView.editable.of(!isLoading)),
    });
  }, [isLoading]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mermaid Code Editor</h3>
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
              <span>Rendering...</span>
            </div>
          )}
        </div>
      </div>

      {/* CodeMirror Editor */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />

      {/* Footer with stats */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Lines: {mermaidCode.split('\n').length} | Characters: {mermaidCode.length}
          </span>
          <span>Mermaid Syntax</span>
        </div>
      </div>

      {/* Diagram Samples Gallery */}
      <Suspense fallback={null}>
        <DiagramSamples />
      </Suspense>
    </div>
  );
};
