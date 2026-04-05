import React, { lazy, Suspense } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { SyncedTextarea } from './SyncedTextarea';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
const DiagramSamples = lazy(() =>
  import('./DiagramSamples').then((m) => ({ default: m.DiagramSamples }))
);

export const CodeEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mermaidCode, isLoading } = useAppSelector((state) => state.diagram);
  const { beginGroup, endGroup, captureNow } = useHistoryEngine();

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = event.target.value;
    dispatch(setMermaidCode(newCode));
    // historyEngine middleware coalesces text changes automatically
  };

  const handleFocus = () => {
    beginGroup();
  };

  const handleBlur = () => {
    endGroup();
    // Flush any pending coalesced text edit into history
    captureNow('text-blur');
  };

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

      {/* Editor */}
      <div className="flex-1 relative">
        <SyncedTextarea
          value={mermaidCode}
          onChange={handleCodeChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="
            absolute inset-0 w-full h-full p-4 
            font-mono text-sm leading-relaxed
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            border-none outline-none resize-none
            placeholder-gray-400 dark:placeholder-gray-500
          "
          placeholder={`Enter your Mermaid diagram code here...

Example:
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`}
          spellCheck={false}
          disabled={isLoading}
        />

        {/* Line numbers overlay (optional enhancement) */}
        <div className="absolute left-0 top-0 p-4 pointer-events-none select-none">
          <div className="font-mono text-sm text-gray-400 dark:text-gray-600 leading-relaxed">
            {mermaidCode.split('\n').map((_: string, index: number) => (
              <div key={index} className="text-right pr-2 min-w-[2rem]">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

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
