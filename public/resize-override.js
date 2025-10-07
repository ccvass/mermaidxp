// UNIFIED RESIZE SYSTEM - STANDALONE OVERRIDE
// This script runs independently and overrides all resize functionality

let isResizing = false;
let resizeHandle = '';
let startX = 0;
let startY = 0;
let activeElement = null;
let activeGroup = null;
let initialData = {};

// Global mousedown handler for resize handles
const handleGlobalMouseDown = (e) => {
  const target = e.target;

  // Check if clicked on a resize handle
  if (target.classList.contains('resize-handle')) {
    e.stopPropagation();
    e.preventDefault();

    // Find the parent group and main element
    activeGroup = target.closest(
      '.custom-text-group, .custom-icon-group, .custom-image-group, .custom-svg-shape-group'
    );
    if (!activeGroup) {
      return;
    }

    activeElement = activeGroup.querySelector('.placed-text, .icon-text, .placed-image, .placed-svg-shape');
    if (!activeElement) {
      return;
    }

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

    const container = document.getElementById('mermaid-container');
    const svgElement = container?.querySelector('svg');
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    // Store initial data for different element types
    if (activeElement.classList.contains('placed-text') || activeElement.classList.contains('icon-text')) {
      const fontSize = parseFloat(activeElement.getAttribute('font-size') || '16');
      initialData = {
        fontSize: fontSize,
        x: parseFloat(activeElement.getAttribute('x') || '0'),
        y: parseFloat(activeElement.getAttribute('y') || '0'),
      };
    } else if (activeElement.classList.contains('placed-image')) {
      initialData = {
        width: parseFloat(activeElement.getAttribute('width') || '100'),
        height: parseFloat(activeElement.getAttribute('height') || '100'),
        x: parseFloat(activeElement.getAttribute('x') || '0'),
        y: parseFloat(activeElement.getAttribute('y') || '0'),
      };
    } else if (activeElement.classList.contains('placed-svg-shape')) {
      // For SVG shapes, we'll calculate bounds dynamically
      initialData = {};
    }
  } else {
    // Clicked somewhere else - clean up handles if clicking on canvas or background
    const isCanvasClick =
      target.tagName === 'svg' ||
      target.id === 'mermaid-container' ||
      target.classList.contains('mermaid-container') ||
      (target.tagName === 'DIV' && target.id === 'diagram-container') ||
      !target.closest('.custom-text-group, .custom-icon-group, .custom-image-group, .custom-svg-shape-group');

    if (isCanvasClick) {
      hideAllHandles();
    }
  }
};

// Global mousemove handler
const handleGlobalMouseMove = (e) => {
  if (!isResizing || !activeElement || !activeGroup) return;

  const container = document.getElementById('mermaid-container');
  const svgElement = container?.querySelector('svg');
  if (!svgElement) return;

  const rect = svgElement.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  // Handle text and icon resize (font-size based)
  if (activeElement.classList.contains('placed-text') || activeElement.classList.contains('icon-text')) {
    const scaleFactor = 0.3;
    // Use uniform scaling - take the larger delta for consistent resize
    const uniformDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    let newFontSize = Math.max(8, initialData.fontSize + uniformDelta * scaleFactor);

    activeElement.setAttribute('font-size', newFontSize.toString());

    // Update handles positions for text/icons
    const textBounds = activeElement.getBBox();
    const padding = 4;

    const handles = activeGroup.querySelectorAll('.resize-handle');
    const handlePositions = [
      { x: textBounds.x - padding - 4, y: textBounds.y - padding - 4 }, // nw
      { x: textBounds.x + textBounds.width + padding - 4, y: textBounds.y - padding - 4 }, // ne
      { x: textBounds.x - padding - 4, y: textBounds.y + textBounds.height + padding - 4 }, // sw
      { x: textBounds.x + textBounds.width + padding - 4, y: textBounds.y + textBounds.height + padding - 4 }, // se
    ];

    handles.forEach((handle, index) => {
      if (handlePositions[index]) {
        handle.setAttribute('x', handlePositions[index].x.toString());
        handle.setAttribute('y', handlePositions[index].y.toString());
      }
    });

    return;
  }

  // Handle image resize (uniform scaling)
  if (activeElement.classList.contains('placed-image')) {
    // Use uniform scaling - maintain aspect ratio
    const uniformDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    const scaleFactor = 1 + uniformDelta / 100;

    let newWidth = Math.max(20, initialData.width * scaleFactor);
    let newHeight = Math.max(20, initialData.height * scaleFactor);

    // Keep centered
    let newX = initialData.x - (newWidth - initialData.width) / 2;
    let newY = initialData.y - (newHeight - initialData.height) / 2;

    activeElement.setAttribute('width', newWidth.toString());
    activeElement.setAttribute('height', newHeight.toString());
    activeElement.setAttribute('x', newX.toString());
    activeElement.setAttribute('y', newY.toString());

    // Update selection border and handles for images
    const padding = 4;

    const selectionRect = activeGroup.querySelector('.image-selection-border');
    if (selectionRect) {
      selectionRect.setAttribute('x', (newX - padding).toString());
      selectionRect.setAttribute('y', (newY - padding).toString());
      selectionRect.setAttribute('width', (newWidth + padding * 2).toString());
      selectionRect.setAttribute('height', (newHeight + padding * 2).toString());
    }

    const handles = activeGroup.querySelectorAll('.resize-handle');
    const handlePositions = [
      { x: newX - padding - 4, y: newY - padding - 4 }, // nw
      { x: newX + newWidth + padding - 4, y: newY - padding - 4 }, // ne
      { x: newX - padding - 4, y: newY + newHeight + padding - 4 }, // sw
      { x: newX + newWidth + padding - 4, y: newY + newHeight + padding - 4 }, // se
    ];

    handles.forEach((handle, index) => {
      if (handlePositions[index]) {
        handle.setAttribute('x', handlePositions[index].x.toString());
        handle.setAttribute('y', handlePositions[index].y.toString());
      }
    });

    return;
  }

  // Handle SVG shapes resize (uniform scaling)
  if (activeElement.classList.contains('placed-svg-shape')) {
    const shapeType = activeElement.tagName.toLowerCase();

    // Get initial bounds only once at start of resize
    if (!initialData.bounds) {
      switch (shapeType) {
        case 'rect':
          initialData.bounds = {
            x: parseFloat(activeElement.getAttribute('x')),
            y: parseFloat(activeElement.getAttribute('y')),
            width: parseFloat(activeElement.getAttribute('width')),
            height: parseFloat(activeElement.getAttribute('height')),
          };
          break;
        case 'circle':
          const cx = parseFloat(activeElement.getAttribute('cx'));
          const cy = parseFloat(activeElement.getAttribute('cy'));
          const r = parseFloat(activeElement.getAttribute('r'));
          initialData.bounds = {
            x: cx - r,
            y: cy - r,
            width: r * 2,
            height: r * 2,
          };
          break;
        case 'ellipse':
          const ecx = parseFloat(activeElement.getAttribute('cx'));
          const ecy = parseFloat(activeElement.getAttribute('cy'));
          const rx = parseFloat(activeElement.getAttribute('rx'));
          const ry = parseFloat(activeElement.getAttribute('ry'));
          initialData.bounds = {
            x: ecx - rx,
            y: ecy - ry,
            width: rx * 2,
            height: ry * 2,
          };
          break;
        case 'polygon':
          const bbox = activeElement.getBBox();
          initialData.bounds = {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
          };
          break;
        default:
          return;
      }
    }

    // Use uniform scaling - maintain aspect ratio
    const uniformDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    const scaleFactor = Math.max(0.2, 1 + uniformDelta / 100); // Minimum 20% of original size

    const newWidth = Math.max(20, initialData.bounds.width * scaleFactor);
    const newHeight = Math.max(20, initialData.bounds.height * scaleFactor);

    // Keep centered
    const newX = initialData.bounds.x - (newWidth - initialData.bounds.width) / 2;
    const newY = initialData.bounds.y - (newHeight - initialData.bounds.height) / 2;

    // Apply new dimensions to specific shape type
    switch (shapeType) {
      case 'rect':
        activeElement.setAttribute('x', newX.toString());
        activeElement.setAttribute('y', newY.toString());
        activeElement.setAttribute('width', newWidth.toString());
        activeElement.setAttribute('height', newHeight.toString());
        break;
      case 'circle':
        const newRadius = Math.min(newWidth, newHeight) / 2;
        activeElement.setAttribute('cx', (newX + newWidth / 2).toString());
        activeElement.setAttribute('cy', (newY + newHeight / 2).toString());
        activeElement.setAttribute('r', newRadius.toString());
        break;
      case 'ellipse':
        activeElement.setAttribute('cx', (newX + newWidth / 2).toString());
        activeElement.setAttribute('cy', (newY + newHeight / 2).toString());
        activeElement.setAttribute('rx', (newWidth / 2).toString());
        activeElement.setAttribute('ry', (newHeight / 2).toString());
        break;
      case 'polygon':
        // For diamond, triangle, hexagon, and star shapes
        const centerX = newX + newWidth / 2;
        const centerY = newY + newHeight / 2;

        const currentPoints = activeElement.getAttribute('points');
        const pointCount = currentPoints ? currentPoints.split(' ').length : 0;

        if (pointCount === 4) {
          // Diamond shape: top, right, bottom, left
          const points = `${centerX},${newY} ${newX + newWidth},${centerY} ${centerX},${newY + newHeight} ${newX},${centerY}`;
          activeElement.setAttribute('points', points);
        } else if (pointCount === 3) {
          // Triangle shape: top, bottom-right, bottom-left
          const points = `${centerX},${newY} ${newX + newWidth},${newY + newHeight} ${newX},${newY + newHeight}`;
          activeElement.setAttribute('points', points);
        } else if (pointCount === 6) {
          // Hexagon shape
          const hexW = newWidth / 2;
          const hexH = newHeight / 2;
          const points = `${centerX - hexW * 0.5},${newY} ${centerX + hexW * 0.5},${newY} ${centerX + hexW},${centerY} ${centerX + hexW * 0.5},${newY + newHeight} ${centerX - hexW * 0.5},${newY + newHeight} ${centerX - hexW},${centerY}`;
          activeElement.setAttribute('points', points);
        } else if (pointCount === 10) {
          // Star shape
          const starPoints = [];
          const outerRadius = Math.min(newWidth, newHeight) / 2;
          const innerRadius = outerRadius * 0.4;
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);
            starPoints.push(`${px},${py}`);
          }
          activeElement.setAttribute('points', starPoints.join(' '));
        } else {
          // Generic polygon - try to scale proportionally
          const originalPoints = currentPoints.split(' ').map((point) => {
            const [x, y] = point.split(',').map(Number);
            return { x, y };
          });

          if (originalPoints.length > 0) {
            // Find original bounds
            const originalBounds = initialData.bounds;
            const scaleX = newWidth / originalBounds.width;
            const scaleY = newHeight / originalBounds.height;

            const scaledPoints = originalPoints.map((point) => {
              const relativeX = (point.x - originalBounds.x) * scaleX;
              const relativeY = (point.y - originalBounds.y) * scaleY;
              return `${newX + relativeX},${newY + relativeY}`;
            });

            activeElement.setAttribute('points', scaledPoints.join(' '));
          }
        }
        break;
    }

    // Update selection border and handles with unified coordinates
    const padding = 4;

    const selectionRect = activeGroup.querySelector('.svg-shape-selection-border');
    if (selectionRect) {
      selectionRect.setAttribute('x', (newX - padding).toString());
      selectionRect.setAttribute('y', (newY - padding).toString());
      selectionRect.setAttribute('width', (newWidth + padding * 2).toString());
      selectionRect.setAttribute('height', (newHeight + padding * 2).toString());
    }

    // Update handle positions with unified coordinates
    const handles = activeGroup.querySelectorAll('.resize-handle');
    const handlePositions = [
      { x: newX - padding - 4, y: newY - padding - 4 }, // nw
      { x: newX + newWidth + padding - 4, y: newY - padding - 4 }, // ne
      { x: newX - padding - 4, y: newY + newHeight + padding - 4 }, // sw
      { x: newX + newWidth + padding - 4, y: newY + newHeight + padding - 4 }, // se
    ];

    handles.forEach((handle, index) => {
      if (handlePositions[index]) {
        handle.setAttribute('x', handlePositions[index].x.toString());
        handle.setAttribute('y', handlePositions[index].y.toString());
      }
    });
  }
};

// Global mouseup handler
const handleGlobalMouseUp = (e) => {
  if (isResizing) {
    // Clean up any residual handles from other elements
    cleanupResidualHandles();

    // Multiple cleanup attempts to ensure everything is removed
    setTimeout(() => {
      hideAllHandles();
    }, 50);

    setTimeout(() => {
      hideAllHandles();
    }, 200);

    setTimeout(() => {
      hideAllHandles();
    }, 500);

    isResizing = false;
    resizeHandle = '';
    activeElement = null;
    activeGroup = null;
    initialData = {};
  }
};

// Function to clean up residual handles
const cleanupResidualHandles = () => {
  // Try multiple SVG selectors
  let svgElement =
    document.querySelector('#mermaid-graph-1') ||
    document.querySelector('#diagram-svg') ||
    document.querySelector('svg');

  if (!svgElement) return;

  // Hide all resize handles except those belonging to currently selected element
  const allHandles = svgElement.querySelectorAll('.resize-handle');
  const allSelectionBorders = svgElement.querySelectorAll(
    '.selection-border, .text-selection-border, .icon-selection-border, .image-selection-border, .svg-shape-selection-border'
  );

  allHandles.forEach((handle) => {
    // Only hide handles that are not part of the active group
    if (!activeGroup || !activeGroup.contains(handle)) {
      handle.style.display = 'none';
    }
  });

  allSelectionBorders.forEach((border) => {
    // Only hide borders that are not part of the active group
    if (!activeGroup || !activeGroup.contains(border)) {
      border.style.display = 'none';
    }
  });

  // IMMEDIATE cleanup of dashed borders
  const allDashedElements = svgElement.querySelectorAll('[stroke-dasharray]');
  allDashedElements.forEach((element) => {
    const strokeDasharray = element.getAttribute('stroke-dasharray');
    const stroke = element.getAttribute('stroke');
    const fill = element.getAttribute('fill');
    const className = element.getAttribute('class') || '';

    // Hide selection borders immediately
    if (
      strokeDasharray &&
      (strokeDasharray.includes('5') || strokeDasharray.includes('4')) &&
      stroke === '#3b82f6' &&
      (fill === 'none' || fill === 'transparent' || !fill) &&
      (className.includes('selection-border') || !className.includes('placed-'))
    ) {
      element.style.display = 'none';
    }
  });
};

// Function to hide all handles when clicking elsewhere
const hideAllHandles = () => {
  // Try multiple SVG selectors for immediate response
  let svgElement =
    document.querySelector('#mermaid-graph-1') ||
    document.querySelector('#diagram-svg') ||
    document.querySelector('svg');

  if (!svgElement) {
    return;
  }

  // IMMEDIATE cleanup of all selection borders
  const allDashedElements = svgElement.querySelectorAll('[stroke-dasharray]');

  allDashedElements.forEach((element) => {
    const strokeDasharray = element.getAttribute('stroke-dasharray');
    const stroke = element.getAttribute('stroke');
    const fill = element.getAttribute('fill');

    // Hide any dashed border that looks like a selection border
    if (
      strokeDasharray &&
      (strokeDasharray.includes('5') || strokeDasharray.includes('4')) &&
      (fill === 'none' || fill === 'transparent' || !fill)
    ) {
      element.style.display = 'none';
    }
  });

  // Also hide all resize handles
  const allHandles = svgElement.querySelectorAll('.resize-handle');
  allHandles.forEach((handle) => {
    handle.style.display = 'none';
  });
};

// Initialize the system
let isSystemInitialized = false;

const initOverrideSystem = () => {
  if (isSystemInitialized) {
    return;
  }

  // Remove any existing listeners first
  document.removeEventListener('mousedown', handleGlobalMouseDown, true);
  document.removeEventListener('mousemove', handleGlobalMouseMove, true);
  document.removeEventListener('mouseup', handleGlobalMouseUp, true);

  // Add new listeners with capture=true to intercept before other handlers
  document.addEventListener('mousedown', handleGlobalMouseDown, true);
  document.addEventListener('mousemove', handleGlobalMouseMove, true);
  document.addEventListener('mouseup', handleGlobalMouseUp, true);

  isSystemInitialized = true;
};

// Initialize immediately and also after DOM loads
initOverrideSystem();

// Also initialize after a delay to ensure it overrides everything
setTimeout(() => {
  if (!isSystemInitialized) {
    initOverrideSystem();
  }
}, 1000);

// Periodic cleanup to remove any residual selection elements
setInterval(() => {
  if (!isResizing) {
    const svgElement =
      document.querySelector('#mermaid-graph-1') ||
      document.querySelector('#diagram-svg') ||
      document.querySelector('svg');
    if (svgElement) {
      // Quick cleanup of obvious residual elements
      const residualElements = svgElement.querySelectorAll('[stroke-dasharray*="5"], [stroke-dasharray*="4"]');
      residualElements.forEach((element) => {
        const fill = element.getAttribute('fill');
        if (
          (fill === 'none' || fill === 'transparent' || !fill) &&
          !element.closest('.custom-text-group, .custom-icon-group, .custom-image-group, .custom-svg-shape-group')
        ) {
          element.style.display = 'none';
        }
      });
    }
  }
}, 2000); // Every 2 seconds
