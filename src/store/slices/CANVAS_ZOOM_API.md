# Canvas Zoom API Documentation

## Overview

The canvas slice provides a comprehensive zoom API for managing zoom levels in the diagram viewer. The zoom functionality includes actions, selectors, and typed hooks for easy integration with React components.

## Constants

- `ZOOM_STEP`: 0.1 - The increment/decrement value for zoom in/out operations
- `MIN_ZOOM`: 0.1 - Minimum allowed zoom level (10%)
- `MAX_ZOOM`: 4 - Maximum allowed zoom level (400%)
- `DEFAULT_ZOOM`: 1 - Default zoom level (100%)

## Actions

### Zoom Actions

- `setZoom(zoom: number)`: Sets the zoom to a specific value (clamped between MIN_ZOOM and MAX_ZOOM)
- `zoomIn()`: Increases zoom by ZOOM_STEP
- `zoomOut()`: Decreases zoom by ZOOM_STEP
- `resetZoom()`: Resets zoom to DEFAULT_ZOOM and pan to {x: 0, y: 0}

## Selectors

### Basic Selectors

- `selectZoom(state)`: Returns current zoom level
- `selectPan(state)`: Returns current pan position {x, y}
- `selectCanvas(state)`: Returns entire canvas state

### Computed Selectors

- `selectCanZoomIn(state)`: Returns true if zoom can be increased
- `selectCanZoomOut(state)`: Returns true if zoom can be decreased
- `selectIsDefaultZoom(state)`: Returns true if zoom is at default level

## Hooks

### Individual State Hooks

```typescript
import { useZoom, usePan, useCanZoomIn, useCanZoomOut } from '@/store/slices/canvasSlice.hooks';

function MyComponent() {
  const zoom = useZoom();
  const pan = usePan();
  const canZoomIn = useCanZoomIn();
  const canZoomOut = useCanZoomOut();

  return (
    <div>
      <p>Current zoom: {zoom * 100}%</p>
      <p>Pan position: {pan.x}, {pan.y}</p>
    </div>
  );
}
```

### Action Hooks

```typescript
import { useZoomActions, useCanvasActions } from '@/store/slices/canvasSlice.hooks';

function ZoomControls() {
  const { zoomIn, zoomOut, setZoom, resetZoom } = useZoomActions();
  const canZoomIn = useCanZoomIn();
  const canZoomOut = useCanZoomOut();

  return (
    <div>
      <button onClick={zoomIn} disabled={!canZoomIn}>Zoom In</button>
      <button onClick={zoomOut} disabled={!canZoomOut}>Zoom Out</button>
      <button onClick={resetZoom}>Reset</button>
      <button onClick={() => setZoom(2)}>200%</button>
    </div>
  );
}
```

### Complete Canvas Actions Hook

```typescript
import { useCanvasActions } from '@/store/slices/canvasSlice.hooks';

function CanvasController() {
  const { setZoom, zoomIn, zoomOut, resetZoom, setPan, updatePan, fitToViewport } = useCanvasActions();

  // Use all canvas actions...
}
```

## Usage Examples

### Basic Zoom Controls

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { zoomIn, zoomOut, resetZoom, selectZoom } from '@/store/slices/canvasSlice';

function ZoomBar() {
  const dispatch = useAppDispatch();
  const zoom = useAppSelector(selectZoom);

  return (
    <div>
      <button onClick={() => dispatch(zoomOut())}>-</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => dispatch(zoomIn())}>+</button>
      <button onClick={() => dispatch(resetZoom())}>Reset</button>
    </div>
  );
}
```

### Keyboard Shortcuts

```typescript
import { useEffect } from 'react';
import { useZoomActions } from '@/store/slices/canvasSlice.hooks';

function KeyboardShortcuts() {
  const { zoomIn, zoomOut, resetZoom } = useZoomActions();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomIn, zoomOut, resetZoom]);

  return null;
}
```

### Mouse Wheel Zoom

```typescript
import { useRef } from 'react';
import { useZoomActions, useZoom } from '@/store/slices/canvasSlice.hooks';

function ZoomableCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setZoom } = useZoomActions();
  const currentZoom = useZoom();

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(currentZoom + delta);
    }
  };

  return (
    <div ref={canvasRef} onWheel={handleWheel}>
      {/* Canvas content */}
    </div>
  );
}
```

## Testing

The zoom functionality is fully tested. Run tests with:

```bash
npm test -- canvasSlice.test.ts
```

Tests cover:

- All zoom actions and their constraints
- Selectors and computed values
- Edge cases (min/max zoom limits)
- Integration with other canvas features (pan, fitToViewport)
