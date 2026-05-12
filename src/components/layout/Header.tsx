import React, { type FC } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleTheme, toggleSidebar, showNotification } from '../../store/slices/uiSlice';
import FileOperations from '../header/FileOperations';
import { exportSingleDiagram, exportAllPages } from '../header/ExportController';
import { UserMenu } from '../auth/UserMenu';
import { LoginModal } from '../auth/LoginModal';
import { useAuth } from '../../contexts/AuthContext';
import { MenuIcon, CloseIcon, SunIcon, MoonIcon, DownloadIcon } from '../icons/ToolbarIcons';
import { createShareLink } from '../../services/shareService';

interface HeaderProps {
  title: string;
}

export const Header: FC<HeaderProps> = ({ title }) => {
  const dispatch = useAppDispatch();
  const { theme, isSidebarVisible, isDirty, currentFilename } = useAppSelector((state) => state.ui);
  const sheets = useAppSelector((state) => state.diagram.sheets);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const { user } = useAuth();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const sidebarTitle = isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar';
  const themeTitle = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  const notify = (msg: string, type: 'info' | 'success' | 'error' | 'warning') =>
    dispatch(showNotification({ message: msg, type }));

  const mermaidCode = useAppSelector((state) => state.diagram.mermaidCode);

  const handleShare = async () => {
    if (!mermaidCode.trim()) { notify('No diagram to share', 'warning'); return; }
    try {
      const url = await createShareLink(mermaidCode);
      await navigator.clipboard.writeText(url);
      notify('Share link copied to clipboard!', 'success');
    } catch {
      notify('Failed to create share link', 'error');
    }
  };

  const handleExport = async (format: 'svg' | 'png' | 'png-transparent' | 'pdf') => {
    setShowExportMenu(false);
    await exportSingleDiagram(format, notify);
  };

  const handleExportAllPages = async (format: 'svg' | 'png' | 'pdf') => {
    setShowExportMenu(false);
    await exportAllPages(sheets, format, theme, notify, ({ current, total }) => {
      notify(`Exporting page ${current} of ${total}...`, 'info');
    });
  };

  return (
    <>
      <header
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between"
        role="banner"
      >
        {/* Left: Logo & Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={sidebarTitle}
            aria-label={sidebarTitle}
          >
            {isSidebarVisible ? <CloseIcon /> : <MenuIcon />}
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
            {currentFilename && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">— {currentFilename}</span>
            )}
            {isDirty && (
              <span className="ml-1 text-orange-500" title="Unsaved changes">
                ●
              </span>
            )}
          </h1>
        </div>

        {/* Right: File Ops + Actions */}
        <div className="flex items-center space-x-2">
          <FileOperations />

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Export Diagram"
              aria-label="Export Diagram"
            >
              <DownloadIcon />
              <span className="text-xs ml-1 hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('svg')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      📄 Export as SVG
                    </button>
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      🖼️ Export as PNG
                    </button>
                    <button
                      onClick={() => handleExport('png-transparent')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      🖼️ PNG (transparent)
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      📑 Export as PDF
                    </button>
                    {sheets.length > 1 && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        <div className="px-4 py-1 text-xs text-gray-400">All pages ({sheets.length})</div>
                        <button
                          onClick={() => handleExportAllPages('svg')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          📄 All pages as SVG
                        </button>
                        <button
                          onClick={() => handleExportAllPages('png')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          🖼️ All pages as PNG
                        </button>
                        <button
                          onClick={() => handleExportAllPages('pdf')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          📑 All pages in one PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleShare}
            className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Share diagram (copy link)"
            aria-label="Share diagram"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs ml-1 hidden sm:inline">Share</span>
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

          <button
            onClick={handleToggleTheme}
            className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={themeTitle}
            aria-label={themeTitle}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span className="text-xs ml-1 hidden sm:inline">Theme</span>
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Auth Section */}
          {user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};
