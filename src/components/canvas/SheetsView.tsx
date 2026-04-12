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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fitScale, setFitScale] = useState(1);

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
          // Reset scale to 1 before measuring
          setFitScale(1);
          containerRef.current.innerHTML = result.svg;
          setError(null);
          const svg = containerRef.current.querySelector('svg') as SVGSVGElement;
          if (svg) {
            svg.style.maxWidth = 'none';
            svg.style.display = 'block';
            // Use natural size from viewBox instead of 100%
            const vb = svg.viewBox?.baseVal;
            if (vb && vb.width > 0 && vb.height > 0) {
              svg.setAttribute('width', String(vb.width));
              svg.setAttribute('height', String(vb.height));
            }
          }
          // Wait for layout, then fit
          requestAnimationFrame(() => {
            if (cancelled) return;
            calcFit();
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Render failed');
      }
    };

    render();
    return () => { cancelled = true; };
  }, [code, theme]);

  const calcFit = () => {
    const svg = containerRef.current?.querySelector('svg') as SVGSVGElement | null;
    const wrapper = wrapperRef.current;
    if (!svg || !wrapper) return;

    // Get natural SVG size from viewBox (most reliable)
    const vb = svg.viewBox?.baseVal;
    const natW = (vb && vb.width > 0) ? vb.width : parseFloat(svg.getAttribute('width') || '0');
    const natH = (vb && vb.height > 0) ? vb.height : parseFloat(svg.getAttribute('height') || '0');
    if (natW <= 0 || natH <= 0) return;

    // Wrapper size from DOM (not affected by inner transforms)
    const wrapperRect = wrapper.getBoundingClientRect();
    const pad = 16;
    const availW = wrapperRect.width - pad * 2;
    const availH = wrapperRect.height - pad * 2;
    if (availW <= 0 || availH <= 0) return;

    setFitScale(Math.min(availW / natW, availH / natH));
  };

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
    <div ref={wrapperRef} className="flex items-center justify-center h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="sheets-active-diagram"
        style={{ transform: `scale(${fitScale})`, transformOrigin: 'center center' }}
      />
    </div>
  );
};

export default SheetsView;
