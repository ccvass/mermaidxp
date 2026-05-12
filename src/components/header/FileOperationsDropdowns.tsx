import React from 'react';
import { DiagramTemplate, RecentFile, DIAGRAM_TEMPLATES } from './fileOperations.utils';

interface TemplatesDropdownProps {
  onNewDocument: (template?: DiagramTemplate) => void;
}

export const TemplatesDropdown: React.FC<TemplatesDropdownProps> = ({ onNewDocument }) => (
  <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Choose Template</h3>
    </div>
    <div className="max-h-96 overflow-y-auto">
      <button
        onClick={() => onNewDocument()}
        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
      >
        <div className="font-medium text-gray-900 dark:text-white">Blank Document</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Start with empty diagram</div>
      </button>
      {DIAGRAM_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onNewDocument(template)}
          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
        >
          <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{template.description}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{template.category}</div>
        </button>
      ))}
    </div>
  </div>
);

interface RecentFilesDropdownProps {
  recentFiles: RecentFile[];
  onOpenFile: () => void;
  onLoadRecent: (recent: RecentFile) => void;
}

export const RecentFilesDropdown: React.FC<RecentFilesDropdownProps> = ({
  recentFiles,
  onOpenFile,
  onLoadRecent,
}) => (
  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
    <button
      onClick={onOpenFile}
      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-900 dark:text-white text-sm"
    >
      Browse files…
    </button>
    {recentFiles.length > 0 && (
      <>
        <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent</div>
        {recentFiles.map((rf, i) => (
          <button
            key={`${rf.name}-${i}`}
            onClick={() => onLoadRecent(rf)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            <div className="text-gray-900 dark:text-white truncate">{rf.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(rf.date).toLocaleDateString()}
            </div>
          </button>
        ))}
      </>
    )}
  </div>
);

interface ExportOptionsDropdownProps {
  onSaveAs: (format: 'mmd' | 'md' | 'txt') => void;
  onClose: () => void;
}

export const ExportOptionsDropdown: React.FC<ExportOptionsDropdownProps> = ({ onSaveAs, onClose }) => (
  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
    <button
      onClick={() => { onSaveAs('mmd'); onClose(); }}
      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
    >
      <div className="font-medium text-gray-900 dark:text-white">Mermaid (.mmd)</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">Native Mermaid format</div>
    </button>
    <button
      onClick={() => { onSaveAs('md'); onClose(); }}
      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
    >
      <div className="font-medium text-gray-900 dark:text-white">Markdown (.md)</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">Markdown with code block</div>
    </button>
    <button
      onClick={() => { onSaveAs('txt'); onClose(); }}
      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className="font-medium text-gray-900 dark:text-white">Text (.txt)</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">Plain text format</div>
    </button>
  </div>
);

interface ImportUrlModalProps {
  importUrl: string;
  importLoading: boolean;
  importError: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const ImportUrlModal: React.FC<ImportUrlModalProps> = ({
  importUrl,
  importLoading,
  importError,
  onUrlChange,
  onSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Import from URL</h3>
      <input
        type="url"
        value={importUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="https://example.com/diagram.mmd"
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
        disabled={importLoading}
      />
      {importError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">Failed: {importError}</p>}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          disabled={importLoading}
          className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={importLoading || !importUrl.trim()}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {importLoading && (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          Import
        </button>
      </div>
    </div>
  </div>
);
