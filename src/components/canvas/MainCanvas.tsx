import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { DiagramDisplay } from './DiagramDisplay';
import { SheetsView } from './SheetsView';
import { ToolbarImproved } from './ToolbarImproved';

interface MainCanvasProps {
  ref?: React.Ref<HTMLDivElement>;
}

export const MainCanvas = React.forwardRef<HTMLDivElement, MainCanvasProps>((props, ref) => {
  void props;
  const isPresentationMode = useAppSelector((state) => state.ui.isPresentationMode);
  const sheetsCount = useAppSelector((state) => state.diagram.sheets.length);

  return (
    <div ref={ref} className="flex-1 flex flex-col overflow-hidden">
      {!isPresentationMode && <ToolbarImproved />}
      {sheetsCount > 0 ? <SheetsView /> : <DiagramDisplay />}
    </div>
  );
});

MainCanvas.displayName = 'MainCanvas';
