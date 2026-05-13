import { useState, useEffect, useCallback, type FC } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch } from '../../store/hooks';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { listVersions, deleteVersion, DiagramVersion } from '../../services/versionHistoryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryPanel: FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [versions, setVersions] = useState<DiagramVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<DiagramVersion | null>(null);

  const loadVersions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listVersions(user.uid);
      setVersions(data);
    } catch {
      dispatch(showNotification({ message: 'Failed to load versions', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (isOpen) loadVersions();
  }, [isOpen, loadVersions]);

  const handleRestore = (version: DiagramVersion) => {
    dispatch(setMermaidCode(version.code));
    dispatch(showNotification({ message: `Restored version from ${formatDate(version.createdAt)}`, type: 'success' }));
    onClose();
  };

  const handleDelete = async (version: DiagramVersion) => {
    if (!user) return;
    try {
      await deleteVersion(user.uid, version.id);
      setVersions((prev) => prev.filter((v) => v.id !== version.id));
    } catch {
      dispatch(showNotification({ message: 'Failed to delete version', type: 'error' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Version History</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close version history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {!loading && versions.length === 0 && (
            <p className="text-gray-500 text-sm">No saved versions yet. Versions are created automatically when you save.</p>
          )}
          {versions.map((v) => (
            <div
              key={v.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-750"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{v.title}</span>
                <span className="text-xs text-gray-500">{formatDate(v.createdAt)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2 font-mono truncate">{v.code.slice(0, 60)}...</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreview(preview?.id === v.id ? null : v)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {preview?.id === v.id ? 'Hide' : 'Preview'}
                </button>
                <button
                  onClick={() => handleRestore(v)}
                  className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDelete(v)}
                  className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300"
                >
                  Delete
                </button>
              </div>
              {preview?.id === v.id && (
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-40 text-gray-700 dark:text-gray-300">
                  {v.code}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
