// This hook has been replaced by useHistoryEngine
// Keeping minimal export to prevent import errors
export const useUnifiedUndoRedo = () => ({
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
});

export default useUnifiedUndoRedo;
