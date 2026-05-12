import React, { useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setMermaidCode, setSheets, clearSheets } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { captureNow } from '../../store/slices/historyEngineSlice';
import { deleteElements } from '../../store/slices/canvasElementsSlice';
import { parseMdToSheets } from '../../utils/mdParser';
import {
  DiagramTemplate,
  RecentFile,
  loadRecentFiles,
  saveRecentFiles,
  addToRecentFiles,
  createDownloadBlob,
  formatMermaidAsMarkdown,
  generateFilename,
} from './fileOperations.utils';
import {
  TemplatesDropdown,
  RecentFilesDropdown,
  ExportOptionsDropdown,
  ImportUrlModal,
} from './FileOperationsDropdowns';

interface FileOperationsProps {
  className?: string;
}

export const FileOperations: React.FC<FileOperationsProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const mermaidCode = useAppSelector((state) => state.diagram.mermaidCode);
  const canvasElements = useAppSelector((state) => state.canvasElements.elements);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showRecentFiles, setShowRecentFiles] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewDocument = useCallback(
    (template?: DiagramTemplate) => {
      const newCode = template ? template.code : '';
      const elementIds = Object.keys(canvasElements);
      if (elementIds.length > 0) dispatch(deleteElements(elementIds));

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

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) return;

        const elementIds = Object.keys(canvasElements);
        if (elementIds.length > 0) dispatch(deleteElements(elementIds));

        const isMd = file.name.endsWith('.md');
        const sheets = isMd ? parseMdToSheets(content) : [];

        if (isMd && sheets.length >= 1) {
          dispatch(setSheets(sheets));
        } else if (isMd && sheets.length === 0) {
          dispatch(showNotification({ message: 'No mermaid diagrams found in this markdown file.', type: 'warning' }));
          return;
        } else {
          dispatch(clearSheets());
          dispatch(setMermaidCode(content));
        }

        dispatch(captureNow({ actionType: `Opened file: ${file.name}` }));
        dispatch(showNotification({ message: `File "${file.name}" opened successfully`, type: 'success' }));

        const entry: RecentFile = { name: file.name, content, date: new Date().toISOString() };
        const newRecentFiles = addToRecentFiles(entry, recentFiles);
        setRecentFiles(newRecentFiles);
        saveRecentFiles(newRecentFiles);
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [dispatch, recentFiles, canvasElements]
  );

  const handleLoadRecent = useCallback(
    (recent: RecentFile) => {
      const elementIds = Object.keys(canvasElements);
      if (elementIds.length > 0) dispatch(deleteElements(elementIds));

      const isMd = recent.name.endsWith('.md');
      const sheets = isMd ? parseMdToSheets(recent.content) : [];

      if (isMd && sheets.length >= 1) {
        dispatch(setSheets(sheets));
      } else if (isMd && sheets.length === 0) {
        dispatch(showNotification({ message: 'No mermaid diagrams found in this file.', type: 'warning' }));
        return;
      } else {
        dispatch(clearSheets());
        dispatch(setMermaidCode(recent.content));
      }

      dispatch(captureNow({ actionType: `Opened recent: ${recent.name}` }));
      dispatch(showNotification({ message: `Loaded "${recent.name}"`, type: 'success' }));
      setShowRecentFiles(false);
    },
    [dispatch, canvasElements]
  );

  const handleSaveAs = useCallback(
    (format: 'mmd' | 'md' | 'txt' = 'mmd') => {
      if (!mermaidCode.trim()) {
        dispatch(showNotification({ message: 'Nothing to save. Please create a diagram first.', type: 'info' }));
        return;
      }
      const filename = generateFilename(format);
      const content = format === 'md' ? formatMermaidAsMarkdown(mermaidCode) : mermaidCode;
      createDownloadBlob(content, filename);
      dispatch(showNotification({ message: `File saved as "${filename}"`, type: 'success' }));
    },
    [mermaidCode, dispatch]
  );

  const handleImportFromUrl = useCallback(() => {
    setImportError('');
    setImportUrl('');
    setShowImportModal(true);
  }, []);

  const handleImportSubmit = useCallback(async () => {
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportError('');
    try {
      const response = await fetch(importUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.text();
      dispatch(setMermaidCode(content));
      dispatch(captureNow({ actionType: `Imported from URL: ${importUrl}` }));
      dispatch(showNotification({ message: 'Diagram imported successfully from URL', type: 'success' }));
      setShowImportModal(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setImportLoading(false);
    }
  }, [dispatch, importUrl]);

  React.useEffect(() => { setRecentFiles(loadRecentFiles()); }, []);

  React.useEffect(() => {
    const onSave = () => handleSaveAs('mmd');
    window.addEventListener('mxp:save', onSave);
    return () => window.removeEventListener('mxp:save', onSave);
  }, [handleSaveAs]);

  return (
    <div className={`relative ${className}`}>
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
          {showTemplates && <TemplatesDropdown onNewDocument={handleNewDocument} />}
        </div>

        {/* Open File */}
        <div className="relative">
          <button
            onClick={() => setShowRecentFiles(!showRecentFiles)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Open File (Ctrl+O)"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Open
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showRecentFiles && (
            <RecentFilesDropdown
              recentFiles={recentFiles}
              onOpenFile={() => { handleOpenFile(); setShowRecentFiles(false); }}
              onLoadRecent={handleLoadRecent}
            />
          )}
        </div>

        {/* Save As */}
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Save As (Ctrl+S)"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Save As
          </button>
          {showExportOptions && (
            <ExportOptionsDropdown onSaveAs={handleSaveAs} onClose={() => setShowExportOptions(false)} />
          )}
        </div>

        {/* Import from URL */}
        <button
          onClick={handleImportFromUrl}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Import from URL"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Import
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".mmd,.md,.txt,.mermaid" onChange={handleFileSelect} className="hidden" />

      {(showTemplates || showExportOptions || showRecentFiles) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowTemplates(false); setShowExportOptions(false); setShowRecentFiles(false); }} />
      )}

      {showImportModal && (
        <ImportUrlModal
          importUrl={importUrl}
          importLoading={importLoading}
          importError={importError}
          onUrlChange={setImportUrl}
          onSubmit={handleImportSubmit}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

export default FileOperations;
