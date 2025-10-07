import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { DiagramDisplay } from './DiagramDisplay';
import { ToolbarImproved } from './ToolbarImproved';

interface MainCanvasProps {
  ref?: React.Ref<HTMLDivElement>;
}

export const MainCanvas = React.forwardRef<HTMLDivElement, MainCanvasProps>((props, ref) => {
  // avoid TS6133: reference props intentionally (no-op)
  void props;
  const isPresentationMode = useAppSelector((state) => state.ui.isPresentationMode);

  return (
    <div ref={ref} className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar - Hidden in presentation mode */}
      {!isPresentationMode && <ToolbarImproved />}

      {/* Main diagram area */}
      <DiagramDisplay />
    </div>
  );
});

MainCanvas.displayName = 'MainCanvas';
