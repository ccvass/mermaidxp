import type { Middleware } from '@reduxjs/toolkit';
import {
  commitSnapshot,
  setIsRestoring,
  undo as undoAction,
  redo as redoAction,
  captureNow,
} from '../slices/historyEngineSlice';
import { setMermaidCode, applyMermaidCode } from '../slices/diagramSlice';
import { setZoom, setPan, setSelectedNodes } from '../slices/canvasSlice';
import {
  setAllElements,
  setSelectedElements,
  addElement,
  updateElement,
  deleteElement,
  deleteElements,
  moveElement,
  moveElements,
  resizeElement,
  rotateElement,
  // selectElement, selectElements, deselectElement, clearSelection - not used in middleware
  copyElements,
  pasteElements,
  updateElementStyle,
  updateElementsStyle,
  updateElementContent,
} from '../slices/canvasElementsSlice';
import type { RootState } from '..';

// Config
const TEXT_COALESCE_MS = 700;
const CANVAS_COALESCE_MS = 150; // for selection bursts
const ELEMENT_MOVE_COALESCE_MS = 300; // for drag operations
const ELEMENT_RESIZE_COALESCE_MS = 300; // for resize operations

const hashState = (
  code: string,
  zoom: number,
  pan: { x: number; y: number },
  selected: string[],
  elements: Record<string, any>,
  selectedElementIds: string[]
) => {
  const elementsHash =
    Object.keys(elements).length > 0
      ? JSON.stringify(
          Object.keys(elements)
            .sort()
            .map((id) => ({
              id,
              pos: elements[id]?.position,
              size: elements[id]?.size,
              content: elements[id]?.content,
              version: elements[id]?.metadata?.version,
            }))
        )
      : '{}';
  const base = `${code.length}|${zoom.toFixed(4)}|${pan.x.toFixed(2)},${pan.y.toFixed(2)}|${selected.join(',')}|${elementsHash}|${selectedElementIds.join(',')}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0;
  return `${h}`;
};

export const historyEngineMiddleware: Middleware = (store) => {
  let textTimer: any = null;
  let canvasTimer: any = null;
  let moveTimer: any = null;
  let resizeTimer: any = null;
  let pendingTextHash: string | null = null;

  const makeSnapshot = (state: RootState, actionType?: string, description?: string) => {
    const code = state.diagram.mermaidCode;
    const { zoom, pan, selectedNodes } = state.canvas;
    const { elements, selectedElementIds } = state.canvasElements || { elements: {}, selectedElementIds: [] };
    const hash = hashState(code, zoom, pan, selectedNodes, elements, selectedElementIds);
    return {
      mermaidCode: code,
      canvas: { zoom, pan, selectedNodes },
      canvasElements: { elements, selectedElementIds },
      meta: {
        timestamp: Date.now(),
        actionType,
        groupId: state.historyEngine.activeGroupId,
        hash,
        description,
      },
    };
  };

  const commitNow = (actionType?: string, description?: string) => {
    const state = store.getState();

    // CRITICAL FIX: Don't snapshot if elements haven't actually changed
    const currentElements = state.canvasElements.elements;
    const lastSnapshot = state.historyEngine.present;

    if (lastSnapshot?.canvasElements) {
      const lastElements = lastSnapshot.canvasElements.elements;

      // Compare element IDs first (fast check)
      const currentIds = Object.keys(currentElements).sort();
      const lastIds = Object.keys(lastElements).sort();

      if (currentIds.length !== lastIds.length || currentIds.join(',') !== lastIds.join(',')) {
        // Element added/removed - definitely need snapshot
      } else {
        // Same elements exist, check if any properties changed
        let hasChanges = false;

        for (const id of currentIds) {
          const current = currentElements[id];
          const last = lastElements[id];

          // Compare meaningful properties (skip metadata timestamps)
          const currentRelevant = {
            position: current.position,
            size: current.size,
            rotation: current.rotation,
            content: current.content,
            style: current.style,
          };

          const lastRelevant = {
            position: last.position,
            size: last.size,
            rotation: last.rotation,
            content: last.content,
            style: last.style,
          };

          if (JSON.stringify(currentRelevant) !== JSON.stringify(lastRelevant)) {
            hasChanges = true;
            break;
          }
        }

        if (!hasChanges) {
          return;
        }
      }
    }

    const snapshot = makeSnapshot(state, actionType, description);
    store.dispatch(commitSnapshot({ snapshot }));
  };

  const handleApplySnapshot = () => {
    const state = store.getState();
    const present = state.historyEngine.present;
    if (!present) {
      console.error('❌ RESTORE FAILED: No present snapshot');
      return;
    }

    store.dispatch(setIsRestoring(true));

    // Apply in a microtask to ensure reducers settled
    Promise.resolve().then(() => {
      const snap = store.getState().historyEngine.present || present;


      // Restore diagram state (CODE ONLY - don't restore pan/zoom to avoid moving diagram)
      store.dispatch(applyMermaidCode(snap.mermaidCode));
      // DON'T restore zoom/pan - let user keep their current view
      // store.dispatch(setZoom(snap.canvas.zoom));
      // store.dispatch(setPan(snap.canvas.pan));
      store.dispatch(setSelectedNodes(snap.canvas.selectedNodes));

      // Restore canvas elements state
      if (snap.canvasElements) {
        const elementsToRestore = snap.canvasElements.elements;
        const elementIds = Object.keys(elementsToRestore);

        // Log first element details for debugging
        if (elementIds.length > 0) {
          // Elements available for restore
        }

        store.dispatch(setAllElements(elementsToRestore));
        store.dispatch(setSelectedElements(snap.canvasElements.selectedElementIds));
      }

      store.dispatch(setIsRestoring(false));
    });
  };

  return (next) => (action: any) => {
    const result = next(action);

    const state = store.getState();
    const enabled = state.historyEngine.featureEnabled;
    if (!enabled) {
      return result;
    }

    // Avoid capturing while restoring history
    if (state.historyEngine.isRestoring) return result;

    // Handle explicit capture
    if ((action as any).type === captureNow.type) {
      commitNow(action.payload?.actionType);
      return result;
    }

    // Handle undo/redo apply
    if ((action as any).type === undoAction.type || (action as any).type === redoAction.type) {
      handleApplySnapshot();
      return result;
    }

    const type: string = (action as any).type;

    // Coalescing for text edits
    if (type === setMermaidCode.type) {
      const s = store.getState();
      const { zoom, pan, selectedNodes } = s.canvas;
      const { elements, selectedElementIds } = s.canvasElements || { elements: {}, selectedElementIds: [] };
      const newHash = hashState(s.diagram.mermaidCode, zoom, pan, selectedNodes, elements, selectedElementIds);
      if (pendingTextHash === newHash) {
        // same content; skip
      } else {
        pendingTextHash = newHash;
        if (textTimer) clearTimeout(textTimer);
        textTimer = setTimeout(() => {
          commitNow('text', 'Code editor changes');
          textTimer = null;
        }, TEXT_COALESCE_MS);
      }
      return result;
    }

    // Canvas state changes
    if (type === setZoom.type || type === setPan.type || type === setSelectedNodes.type) {
      if (canvasTimer) clearTimeout(canvasTimer);
      canvasTimer = setTimeout(() => {
        const description = type === setSelectedNodes.type ? 'Selection changed' : 'Canvas view changed';
        commitNow(type === setSelectedNodes.type ? 'select' : 'canvas', description);
        canvasTimer = null;
      }, CANVAS_COALESCE_MS);
      return result;
    }

    // Move/Resize with coalescence
    if (type === moveElement.type || type === moveElements.type) {
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        commitNow('element', 'Element moved');
        moveTimer = null;
      }, ELEMENT_MOVE_COALESCE_MS);
      return result;
    }

    if (type === resizeElement.type) {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        commitNow('element', 'Element resized');
        resizeTimer = null;
      }, ELEMENT_RESIZE_COALESCE_MS);
      return result;
    }

    // Other element actions - Immediate capture (no coalescing)
    // NOTE: Selection actions are NOT captured (they're UI state, not data changes)
    const immediateActionMap: Record<string, string> = {
      [addElement.type]: 'Element added',
      [updateElement.type]: 'Element updated',
      [deleteElement.type]: 'Element deleted',
      [deleteElements.type]: 'Elements deleted',
      [rotateElement.type]: 'Element rotated',
      // [selectElement.type]: 'Element selected', // REMOVED - UI only
      // [selectElements.type]: 'Elements selected', // REMOVED - UI only
      // [deselectElement.type]: 'Element deselected', // REMOVED - UI only
      // [clearSelection.type]: 'Selection cleared', // REMOVED - UI only
      [copyElements.type]: 'Elements copied',
      [pasteElements.type]: 'Elements pasted',
      [updateElementStyle.type]: 'Element style updated',
      [updateElementsStyle.type]: 'Elements style updated',
      [updateElementContent.type]: 'Element content updated',
    };

    if (immediateActionMap[type]) {
      // For these actions, capture immediately for precise undo/redo
      setTimeout(() => {
        commitNow('element', immediateActionMap[type]);
      }, 10); // Small delay to ensure state is updated
      return result;
    }

    return result;
  };
};
