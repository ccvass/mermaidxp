import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updatePan } from '../../store/slices/canvasSlice';

interface PanInfo {
  isPanning: boolean;
  startX: number;
  startY: number;
  initialPan: { x: number; y: number };
}

export const usePan = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const dispatch = useAppDispatch();
  const { pan, interactionMode } = useAppSelector((state) => state.canvas);
  const [panInfo, setPanInfo] = useState<PanInfo | null>(null);

  const handlePanStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // IMMEDIATE pan start - no dependencies on other systems
      e.preventDefault();
      e.stopPropagation();

      setPanInfo({
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        initialPan: { ...pan },
      });

      return true;
    },
    [pan]
  );

  const handlePanMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!panInfo?.isPanning) return false;

      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - panInfo.startX;
      const deltaY = e.clientY - panInfo.startY;

      const newPanX = panInfo.initialPan.x + deltaX;
      const newPanY = panInfo.initialPan.y + deltaY;

      // IMMEDIATE pan response - minimal throttling
      const threshold = 1; // Minimal threshold for maximum responsiveness
      const changeX = Math.abs(newPanX - pan.x);
      const changeY = Math.abs(newPanY - pan.y);

      if (changeX > threshold || changeY > threshold) {
        dispatch(
          updatePan({
            dx: newPanX - pan.x,
            dy: newPanY - pan.y,
          })
        );
      }

      return true;
    },
    [panInfo, dispatch, pan]
  );

  const handlePanEnd = useCallback(() => {
    if (!panInfo?.isPanning) return false;

    setPanInfo(null);

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = interactionMode === 'pan' ? 'grab' : 'default';
    }

    return true;
  }, [panInfo, containerRef, interactionMode]);

  // Update cursor based on interaction mode
  const updateCursor = useCallback(() => {
    if (containerRef.current) {
      if (interactionMode === 'pan') {
        containerRef.current.style.cursor = panInfo?.isPanning ? 'grabbing' : 'grab';
      } else {
        containerRef.current.style.cursor = 'default';
      }
    }
  }, [containerRef, interactionMode, panInfo]);

  return {
    panInfo,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    updateCursor,
    isPanning: panInfo?.isPanning || false,
  };
};
