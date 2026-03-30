import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setActiveSheet } from '../../store/slices/diagramSlice';
import { mermaidService } from '../../services/mermaidService';
import { Theme } from '../../types/ui.types';

export const SheetsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sheets, activeSheetIndex } = useAppSelector((s) => s.diagram);
  const { theme } = useAppSelector((s) => s.ui);
  const total = sheets.length;

  const prev = () => dispatch(setActiveSheet(Math.max(0, activeSheetIndex - 1)));
  const next = () => dispatch(setActiveSheet(Math.min(total - 1, activeSheetIndex + 1)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSheetIndex, total]);

  if (total === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
        <button
          onClick={prev}
          disabled={activeSheetIndex === 0}
          className="px-3 py-1 rounded bg-slate-300 dark:bg-slate-700 disabled:opacity-30 hover:bg-slate-400 dark:hover:bg-slate-600"
        >
          ← Prev
        </button>
        <span className="text-sm font-medium">
          {sheets[activeSheetIndex]?.title} — {activeSheetIndex + 1} / {total}
        </span>
        <button
          onClick={next}
          disabled={activeSheetIndex === total - 1}
          className="px-3 py-1 rounded bg-slate-300 dark:bg-slate-700 disabled:opacity-30 hover:bg-slate-400 dark:hover:bg-slate-600"
        >
          Next →
        </button>
      </div>

      {/* Sheet thumbnails */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
        {sheets.map((sheet, i) => (
          <button
            key={i}
            onClick={() => dispatch(setActiveSheet(i))}
            className={`flex-shrink-0 px-3 py-1 text-xs rounded border ${
              i === activeSheetIndex
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {sheet.title}
          </button>
        ))}
      </div>

      {/* Active sheet render */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        <SheetRenderer code={sheets[activeSheetIndex]?.code || ''} theme={theme} />
      </div>
    </div>
  );
};

const SheetRenderer: React.FC<{ code: string; theme: string }> = ({ code, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        const themeEnum = theme === 'dark' ? Theme.Dark : Theme.Light;
        const result = await mermaidService.render(code, themeEnum);
        if (cancelled) return;
        if (result.error) {
          setError(typeof result.error === 'string' ? result.error : 'Render error');
        } else if (containerRef.current) {
          containerRef.current.innerHTML = result.svg;
          setError(null);
          // Center the SVG
          const svg = containerRef.current.querySelector('svg');
          if (svg) {
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
            svg.style.margin = '0 auto';
            svg.style.display = 'block';
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Render failed');
      }
    };

    render();
    return () => { cancelled = true; };
  }, [code, theme]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-8">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="font-mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center min-h-full p-8"
    />
  );
};

export default SheetsView;
