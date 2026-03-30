import React, { type FC, type SVGProps } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleTheme, toggleSidebar, showNotification } from '../../store/slices/uiSlice';
import FileOperations from '../header/FileOperations';
import CollaborationPanel from '../collaboration/CollaborationPanel';
import { exportService } from '../../services/exportService';
import { mermaidService } from '../../services/mermaidService';
import { Theme } from '../../types/ui.types';
import { jsPDF } from 'jspdf';
import { UserMenu } from '../auth/UserMenu';
import { LoginModal } from '../auth/LoginModal';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="8" r="3" />
    <path d="M3 20c0-3.3137 3.6863-6 7-6s7 2.6863 7 6" />
    <path d="M12 20c0-2 2.5-4 5-4" />
  </svg>
);

const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const DownloadIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const Header: FC<HeaderProps> = ({ title }) => {
  const dispatch = useAppDispatch();
  const { theme, isSidebarVisible } = useAppSelector((state) => state.ui);
  const sheets = useAppSelector((state) => state.diagram.sheets);
  const [showCollabPanel, setShowCollabPanel] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const { user } = useAuth();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleToggleCollaboration = () => {
    setShowCollabPanel(!showCollabPanel);
  };

  const sidebarTitle = isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar';
  const themeTitle = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  const handleExport = async (format: 'svg' | 'png' | 'pdf') => {
    // Require authentication for export
    if (!user) {
      setShowLoginModal(true);
      dispatch(
        showNotification({
          message: 'You must sign in to export diagrams',
          type: 'warning',
        })
      );
      return;
    }

    try {
      // Find SVG in mermaid container
      const svgElement: SVGElement | null = document.querySelector('#mermaid-container svg') || document.querySelector('.sheets-active-diagram svg');

      if (!svgElement) {
        dispatch(
          showNotification({
            message: 'No diagram found. Please render a diagram first.',
            type: 'error',
          })
        );
        return;
      }

      if (format === 'svg') {
        await exportService.exportSVG(svgElement, 'diagram');
        dispatch(
          showNotification({
            message: 'Diagram exported as SVG',
            type: 'success',
          })
        );
      } else if (format === 'png') {
        await exportService.exportPNG(svgElement, 'diagram', 'white');
        dispatch(
          showNotification({
            message: 'Diagram exported as PNG',
            type: 'success',
          })
        );
      } else if (format === 'pdf') {
        await exportService.exportPDF(svgElement, 'diagram');
        dispatch(
          showNotification({
            message: 'Diagram exported as PDF',
            type: 'success',
          })
        );
      }

      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export diagram';
      dispatch(
        showNotification({
          message: `Export failed: ${errorMessage}`,
          type: 'error',
        })
      );
    }
  };

  const handleExportAllPages = async (format: 'svg' | 'png' | 'pdf') => {
    if (!user) { setShowLoginModal(true); return; }
    try {
      setShowExportMenu(false);
      dispatch(showNotification({ message: `Exporting ${sheets.length} pages...`, type: 'info' }));

      const themeEnum = theme === 'dark' ? Theme.Dark : Theme.Light;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      if (format === 'pdf') {
        let pdf: jsPDF | null = null;

        for (let i = 0; i < sheets.length; i++) {
          const result = await mermaidService.render(sheets[i].code, themeEnum);
          if (!result.svg) continue;

          container.innerHTML = result.svg;
          const svg = container.querySelector('svg');
          if (!svg) continue;

          // Get actual SVG dimensions — must be in visible DOM for getBBox
          container.style.position = 'fixed';
          container.style.left = '0';
          container.style.top = '0';
          container.style.opacity = '0';
          container.style.pointerEvents = 'none';
          container.style.zIndex = '-1';
          const bbox = (svg as unknown as SVGGraphicsElement).getBBox();
          let svgW = bbox.width || 800;
          let svgH = bbox.height || 600;
          // Also check viewBox as fallback
          if (svgW < 50) svgW = svg.viewBox?.baseVal?.width || 800;
          if (svgH < 50) svgH = svg.viewBox?.baseVal?.height || 600;

          // Render SVG to high-res canvas preserving aspect ratio
          svg.setAttribute('width', String(svgW));
          svg.setAttribute('height', String(svgH));
          const svgStr = new XMLSerializer().serializeToString(svg);
          const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
          const img = await new Promise<HTMLImageElement>((res, rej) => {
            const im = new Image();
            im.onload = () => res(im);
            im.onerror = rej;
            im.src = dataUrl;
          });

          const scaleFactor = 4;
          const cW = Math.max(svgW, 400) * scaleFactor;
          const cH = Math.max(svgH, 300) * scaleFactor;
          const canvas = document.createElement('canvas');
          canvas.width = cW;
          canvas.height = cH;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, cW, cH);
          ctx.drawImage(img, 0, 0, cW, cH);

          // Create page sized to diagram to preserve aspect ratio perfectly
          const ptW = (svgW / 96) * 72 + 60;
          const ptH = (svgH / 96) * 72 + 80;
          const pageFormat: [number, number] = [Math.max(ptW, 200), Math.max(ptH, 200)];
          const orientation = ptW >= ptH ? 'landscape' : 'portrait';

          if (!pdf) {
            pdf = new jsPDF({ orientation, unit: 'pt', format: pageFormat });
          } else {
            pdf.addPage(pageFormat, orientation);
          }

          const pdfW = pdf.internal.pageSize.getWidth();
          const pdfH = pdf.internal.pageSize.getHeight();
          const padding = 30;
          const titleH = 25;
          const w = pdfW - 2 * padding;
          const h = w * (cH / cW);
          const x = padding;
          const y = padding + titleH;

          pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', x, y, w, h);

          pdf.setFontSize(12);
          pdf.setTextColor(50, 50, 50);
          pdf.text(sheets[i].title, pdfW / 2, padding + 10, { align: 'center' });
        }

        document.body.removeChild(container);
        if (pdf) {
          pdf.save('diagrams.pdf');
          dispatch(showNotification({ message: `Exported ${sheets.length} pages as PDF`, type: 'success' }));
        }
      } else {
        for (let i = 0; i < sheets.length; i++) {
          const result = await mermaidService.render(sheets[i].code, themeEnum);
          if (result.svg) {
            container.innerHTML = result.svg;
            const svg = container.querySelector('svg');
            if (svg) {
              const name = `${(i + 1).toString().padStart(2, '0')}-${sheets[i].title.replace(/[^a-zA-Z0-9]/g, '_')}`;
              if (format === 'svg') await exportService.exportSVG(svg as unknown as SVGElement, name);
              else await exportService.exportPNG(svg as unknown as SVGElement, name, 'white');
              await new Promise(r => setTimeout(r, 300));
            }
          }
        }
        document.body.removeChild(container);
        dispatch(showNotification({ message: `Exported ${sheets.length} pages`, type: 'success' }));
      }
    } catch (error) {
      dispatch(showNotification({ message: 'Export failed', type: 'error' }));
    }
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>

        {/* Right: File Ops + Actions */}
        <div className="flex items-center space-x-2">
          <FileOperations />

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Export Diagram"
              aria-label="Export Diagram"
            >
              <DownloadIcon />
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

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

          <button
            onClick={handleToggleCollaboration}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              showCollabPanel ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="Live Collaboration (Toggle Panel)"
            aria-label="Live Collaboration"
          >
            <UsersIcon />
          </button>

          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={themeTitle}
            aria-label={themeTitle}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
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

      {showCollabPanel && <CollaborationPanel />}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};
