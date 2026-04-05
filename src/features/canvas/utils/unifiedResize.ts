export const initUnifiedResize = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  let isResizing = false;
  let resizeHandle = '';
  let startX = 0;
  let startY = 0;
  let activeElement: SVGElement | null = null;
  let activeGroup: SVGElement | null = null;
  let initialData: Record<string, unknown> = {};

  const svgElement = container.querySelector('svg');
  if (!svgElement) return;

  const handleGlobalMouseDown = (e: MouseEvent) => {
    const target = e.target as SVGElement;
    if (target.classList.contains('resize-handle')) {
      e.stopPropagation();
      e.preventDefault();

      activeGroup = target.closest('.custom-text-group, .custom-icon-group, .custom-image-group') as SVGElement;
      if (!activeGroup) return;

      activeElement = activeGroup.querySelector('.placed-text, .icon-text, .placed-image') as SVGElement;
      if (!activeElement) return;

      isResizing = true;
      resizeHandle =
        target.getAttribute('data-handle') ||
        (target.classList.contains('resize-nw')
          ? 'nw'
          : target.classList.contains('resize-ne')
            ? 'ne'
            : target.classList.contains('resize-sw')
              ? 'sw'
              : target.classList.contains('resize-se')
                ? 'se'
                : '');

      const rect = svgElement.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;

      if (activeElement.classList.contains('placed-text') || activeElement.classList.contains('icon-text')) {
        initialData = { fontSize: parseFloat(activeElement.getAttribute('font-size') || '16') };
      } else if (activeElement.classList.contains('placed-image')) {
        initialData = {
          width: parseFloat(activeElement.getAttribute('width') || '100'),
          height: parseFloat(activeElement.getAttribute('height') || '100'),
        };
      }
    }
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isResizing || !activeElement || !activeGroup) return;

    const rect = svgElement.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (activeElement.classList.contains('placed-text') || activeElement.classList.contains('icon-text')) {
      let fontSizeChange = 0;
      switch (resizeHandle) {
        case 'se':
          fontSizeChange = (deltaX + deltaY) / 4;
          break;
        case 'sw':
          fontSizeChange = (-deltaX + deltaY) / 4;
          break;
        case 'ne':
          fontSizeChange = (deltaX - deltaY) / 4;
          break;
        case 'nw':
          fontSizeChange = (-deltaX - deltaY) / 4;
          break;
      }

      const isIcon = activeElement.classList.contains('icon-text');
      const minSize = isIcon ? 12 : 8;
      const maxSize = isIcon ? 96 : 72;
      const newFontSize = Math.max(minSize, Math.min(maxSize, Number(initialData.fontSize || 0) + fontSizeChange));

      activeElement.setAttribute('font-size', newFontSize.toString());

      const bbox = (activeElement as any).getBBox();
      const padding = 4;

      const selectionRect = activeGroup.querySelector('.text-selection-border, .icon-selection-border');
      if (selectionRect) {
        selectionRect.setAttribute('x', (bbox.x - padding).toString());
        selectionRect.setAttribute('y', (bbox.y - padding).toString());
        selectionRect.setAttribute('width', (bbox.width + padding * 2).toString());
        selectionRect.setAttribute('height', (bbox.height + padding * 2).toString());
      }

      const handles = activeGroup.querySelectorAll('.resize-handle');
      const handlePositions = [
        { x: bbox.x - padding - 4, y: bbox.y - padding - 4 },
        { x: bbox.x + bbox.width + padding - 4, y: bbox.y - padding - 4 },
        { x: bbox.x - padding - 4, y: bbox.y + bbox.height + padding - 4 },
        { x: bbox.x + bbox.width + padding - 4, y: bbox.y + bbox.height + padding - 4 },
      ];

      handles.forEach((handle, handleIndex) => {
        if (handlePositions[handleIndex]) {
          handle.setAttribute('x', handlePositions[handleIndex].x.toString());
          handle.setAttribute('y', handlePositions[handleIndex].y.toString());
        }
      });
    } else if (activeElement.classList.contains('placed-image')) {
      let newWidth = Number(initialData.width || 0);
      let newHeight = Number(initialData.height || 0);

      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(20, Number(initialData.width || 0) + deltaX);
          newHeight = Math.max(20, Number(initialData.height || 0) + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, Number(initialData.width || 0) - deltaX);
          newHeight = Math.max(20, Number(initialData.height || 0) + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(20, Number(initialData.width || 0) + deltaX);
          newHeight = Math.max(20, Number(initialData.height || 0) - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(20, Number(initialData.width || 0) - deltaX);
          newHeight = Math.max(20, Number(initialData.height || 0) - deltaY);
          break;
      }

      activeElement.setAttribute('width', newWidth.toString());
      activeElement.setAttribute('height', newHeight.toString());

      const bbox = (activeElement as any).getBBox();
      const padding = 4;

      const selectionRect = activeGroup.querySelector('.selection-border');
      if (selectionRect) {
        selectionRect.setAttribute('x', (bbox.x - padding).toString());
        selectionRect.setAttribute('y', (bbox.y - padding).toString());
        selectionRect.setAttribute('width', (bbox.width + padding * 2).toString());
        selectionRect.setAttribute('height', (bbox.height + padding * 2).toString());
      }

      const handles = activeGroup.querySelectorAll('.resize-handle');
      const handlePositions = [
        { x: bbox.x - padding - 4, y: bbox.y - padding - 4 },
        { x: bbox.x + bbox.width + padding - 4, y: bbox.y - padding - 4 },
        { x: bbox.x - padding - 4, y: bbox.y + bbox.height + padding - 4 },
        { x: bbox.x + bbox.width + padding - 4, y: bbox.y + bbox.height + padding - 4 },
      ];

      handles.forEach((handle, handleIndex) => {
        if (handlePositions[handleIndex]) {
          handle.setAttribute('x', handlePositions[handleIndex].x.toString());
          handle.setAttribute('y', handlePositions[handleIndex].y.toString());
        }
      });
    }
  };

  const handleGlobalMouseUp = () => {
    if (isResizing && activeGroup) {
      activeGroup
        .querySelectorAll(
          '.selection-border, .text-selection-border, .icon-selection-border, .svg-shape-selection-border, .resize-handle'
        )
        .forEach((el) => {
          (el as SVGElement).style.display = 'none';
        });

      isResizing = false;
      resizeHandle = '';
      activeElement = null;
      activeGroup = null;
      initialData = {};
    }

    // Do not hide halos if not resizing; keep selection visible after click
  };

  document.addEventListener('mousedown', handleGlobalMouseDown);
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
};
