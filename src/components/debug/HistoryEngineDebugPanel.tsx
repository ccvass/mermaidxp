import React, { useEffect, useState } from 'react';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { useAppSelector } from '../../store/hooks';

/**
 * DEBUG PANEL - Shows real-time historyEngine state
 * Add this to App.tsx temporarily to debug undo/redo issues
 */
export const HistoryEngineDebugPanel: React.FC = () => {
  const { enabled, canUndo, canRedo, present } = useHistoryEngine();
  const { past, future, featureEnabled, isRestoring } = useAppSelector((s) => s.historyEngine);
  const { elements } = useAppSelector((s) => s.canvasElements);
  const [lastAction, setLastAction] = useState<string>('None');

  // Monitor for action changes
  useEffect(() => {
    const interval = setInterval(() => {
      const state = (window as any).store?.getState();
      if (state?.historyEngine?.present?.meta?.description) {
        setLastAction(state.historyEngine.present.meta.description);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const elementCount = Object.keys(elements).length;

  return (
    <div
      className="fixed top-20 right-4 bg-black/90 text-white p-4 rounded-lg shadow-2xl z-[9999] text-xs font-mono"
      style={{ minWidth: '300px' }}
    >
      <div className="font-bold text-lg mb-2 text-yellow-400">🔍 History Debug Panel</div>

      <div className="space-y-1">
        <div className={`${featureEnabled ? 'text-green-400' : 'text-red-400'} font-bold`}>
          Feature Enabled: {featureEnabled ? '✅ YES' : '❌ NO'}
        </div>

        <div className={`${enabled ? 'text-green-400' : 'text-red-400'}`}>Hook Enabled: {enabled ? '✅' : '❌'}</div>

        <div className={`${isRestoring ? 'text-orange-400' : 'text-gray-400'}`}>
          Restoring: {isRestoring ? '⚠️ YES' : 'NO'}
        </div>

        <div className="border-t border-gray-600 my-2"></div>

        <div className="text-blue-300">Past: {past.length} snapshots</div>

        <div className="text-purple-300">Future: {future.length} snapshots</div>

        <div className="text-gray-300">Present: {present ? '✅' : '❌ NULL'}</div>

        <div className="border-t border-gray-600 my-2"></div>

        <div className={`${canUndo ? 'text-green-400' : 'text-gray-600'}`}>
          Can Undo: {canUndo ? '✅ YES' : '❌ NO'}
        </div>

        <div className={`${canRedo ? 'text-green-400' : 'text-gray-600'}`}>
          Can Redo: {canRedo ? '✅ YES' : '❌ NO'}
        </div>

        <div className="border-t border-gray-600 my-2"></div>

        <div className="text-cyan-300">Canvas Elements: {elementCount}</div>

        <div className="text-yellow-300 truncate" title={lastAction}>
          Last Action: {lastAction}
        </div>

        {present && (
          <div className="text-xs text-gray-400 mt-2">
            <div>Code length: {present.mermaidCode?.length || 0}</div>
            <div>Timestamp: {new Date(present.meta?.timestamp || 0).toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-[10px] text-gray-500">Press F12 to see Redux DevTools</div>
    </div>
  );
};
