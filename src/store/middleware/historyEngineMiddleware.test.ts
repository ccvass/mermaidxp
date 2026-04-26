import { vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import diagramReducer, { setMermaidCode } from '../slices/diagramSlice';
import canvasReducer, { setZoom, setPan } from '../slices/canvasSlice';
import historyEngineReducer, {
  setFeatureEnabled,
  captureNow,
  undo as heUndo,
  redo as heRedo,
} from '../slices/historyEngineSlice';
import { historyEngineMiddleware } from '../middleware/historyEngineMiddleware';

vi.useFakeTimers();

describe('historyEngineMiddleware (unified undo/redo)', () => {
  const makeStore = () => {
    const store = configureStore({
      reducer: {
        diagram: diagramReducer,
        canvas: canvasReducer,
        historyEngine: historyEngineReducer,
      },
      middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(historyEngineMiddleware),
    });
    return store;
  };

  test('captureNow initializes present snapshot when featureEnabled', () => {
    const store = makeStore();
    // enable feature
    store.dispatch(setFeatureEnabled(true));

    // initial capture
    store.dispatch(captureNow({ actionType: 'init' }));

    const state = store.getState();
    expect(state.historyEngine.present).not.toBeNull();
    expect(state.historyEngine.present?.meta.actionType).toBe('init');
    // present must reflect diagram+canvas
    expect(state.historyEngine.present?.mermaidCode).toBe(state.diagram.mermaidCode);
    expect(state.historyEngine.present?.canvas.zoom).toBe(state.canvas.zoom);
  });

  test('text edits coalesce into a single snapshot after debounce', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    const before = store.getState().historyEngine;
    expect(before.past.length).toBe(0);

    // burst of edits
    store.dispatch(setMermaidCode('Code A'));
    store.dispatch(setMermaidCode('Code B'));
    store.dispatch(setMermaidCode('Code C'));

    // no commit yet (not enough time)
    expect(store.getState().historyEngine.past.length).toBe(0);

    // advance timers to trigger TEXT_COALESCE_MS (700ms)
    vi.advanceTimersByTime(700);

    const after = store.getState().historyEngine;
    // present updated and previous present moved to past once
    expect(after.past.length).toBe(1);
    expect(after.present?.mermaidCode).toBe('Code C');
  });

  test('canvas changes coalesce (setZoom/setPan) with shorter debounce', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    const past0 = store.getState().historyEngine.past.length;

    // canvas changes
    store.dispatch(setZoom(1.5));
    store.dispatch(setPan({ x: 10, y: 20 }));

    // should not commit immediately
    expect(store.getState().historyEngine.past.length).toBe(past0);

    // advance 150ms coalescing window
    vi.advanceTimersByTime(150);

    const { past, present } = store.getState().historyEngine;
    expect(past.length).toBe(past0 + 1);
    expect(present?.canvas.zoom).toBe(1.5);
    expect(present?.canvas.pan).toEqual({ x: 10, y: 20 });
  });

  test('undo/redo apply snapshots without mutating diagram history', async () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    const initialCode = store.getState().diagram.mermaidCode;

    // make a text change and commit
    store.dispatch(setMermaidCode('Changed #1'));
    vi.advanceTimersByTime(700);

    const histLenBefore = store.getState().diagram.history.length;

    // undo should restore initialCode via applyMermaidCode and NOT push new diagram history entry
    store.dispatch(heUndo());
    // middleware applies snapshot on microtask -> flush it
    await Promise.resolve();

    const stateAfterUndo = store.getState();
    expect(stateAfterUndo.diagram.mermaidCode).toBe(initialCode);
    expect(stateAfterUndo.diagram.history.length).toBe(histLenBefore);

    // redo should restore Changed #1 and also not push diagram history
    store.dispatch(heRedo());
    await Promise.resolve();

    const stateAfterRedo = store.getState();
    expect(stateAfterRedo.diagram.mermaidCode).toBe('Changed #1');
    expect(stateAfterRedo.diagram.history.length).toBe(histLenBefore);
  });

  test('deduplicates identical snapshots by hash', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    const basePast = store.getState().historyEngine.past.length;

    // set the same code repeatedly
    const original = store.getState().diagram.mermaidCode;
    store.dispatch(setMermaidCode(original));
    vi.advanceTimersByTime(700);

    // Since hash and content are identical, no new past entry should be added
    expect(store.getState().historyEngine.past.length).toBe(basePast);
  });

  test('groupId is attached to commits within beginGroup/endGroup window', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    const groupId = 'test-group';
    store.dispatch({ type: 'historyEngine/beginGroup', payload: groupId });

    store.dispatch(setMermaidCode('G1-A'));
    vi.advanceTimersByTime(700);

    store.dispatch(setMermaidCode('G1-B'));
    vi.advanceTimersByTime(700);

    store.dispatch({ type: 'historyEngine/endGroup' });

    const { past, present } = store.getState().historyEngine;
    expect(past.length).toBeGreaterThanOrEqual(1);
    expect(present?.meta.groupId).toBe(groupId);
    if (past.length >= 2) {
      expect(past[past.length - 1].meta.groupId).toBe(groupId);
    }

    store.dispatch(setMermaidCode('outside-group'));
    vi.advanceTimersByTime(700);
    const after = store.getState().historyEngine;
    expect(after.present?.meta.groupId).toBeNull();
  });

  test('setMaxSize trims history to configured limit', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    store.dispatch({ type: 'historyEngine/setMaxSize', payload: 3 });

    for (let i = 1; i <= 5; i++) {
      const payload = 'code-' + 'x'.repeat(i); // variable length ensures different hash
      store.dispatch(setMermaidCode(payload));
      vi.advanceTimersByTime(700);
    }

    const { past, present } = store.getState().historyEngine;
    expect(past.length).toBeLessThanOrEqual(3);
    expect(present?.mermaidCode?.startsWith('code-')).toBe(true);
  });

  test('clear empties past and future but keeps present', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    store.dispatch(setMermaidCode('c1'));
    vi.advanceTimersByTime(700);

    store.dispatch(setMermaidCode('c2'));
    vi.advanceTimersByTime(700);

    const before = store.getState().historyEngine;
    expect(before.past.length).toBeGreaterThan(0);

    store.dispatch({ type: 'historyEngine/clear' });

    const after = store.getState().historyEngine;
    expect(after.past.length).toBe(0);
    expect(after.future.length).toBe(0);
    expect(after.present).not.toBeNull();
  });

  test('selection changes coalesce within debounce window', () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    const past0 = store.getState().historyEngine.past.length;

    store.dispatch({ type: 'canvas/setSelectedNodes', payload: ['A'] });
    store.dispatch({ type: 'canvas/setSelectedNodes', payload: ['A', 'B'] });

    expect(store.getState().historyEngine.past.length).toBe(past0);

    vi.advanceTimersByTime(150);

    const { past, present } = store.getState().historyEngine;
    expect(past.length).toBe(past0 + 1);
    expect(present?.canvas.selectedNodes).toEqual(['A', 'B']);
  });

  test('undo/redo do not create commits during restoring', async () => {
    const store = makeStore();
    store.dispatch(setFeatureEnabled(true));
    store.dispatch(captureNow({ actionType: 'init' }));

    store.dispatch(setMermaidCode('c1'));
    vi.advanceTimersByTime(700);

    const histBefore = store.getState().historyEngine;
    const pastBefore = histBefore.past.length;

    store.dispatch(heUndo());
    await Promise.resolve();

    const mid = store.getState().historyEngine;
    expect(mid.past.length).toBeLessThanOrEqual(pastBefore);

    store.dispatch(heRedo());
    await Promise.resolve();

    const after = store.getState().historyEngine;
    expect(after.past.length).toBeLessThanOrEqual(pastBefore);
  });
});
