import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { UndoRedoButtons } from '../ui/UndoRedoButtons';

export const UndoRedoTest: React.FC = () => {
  const dispatch = useDispatch();
  const currentCode = useSelector((state: RootState) => state.diagram.mermaidCode);

  const testCodes = [
    'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]',
    'graph LR\n    X[Input] --> Y[Transform]\n    Y --> Z[Output]',
    'flowchart TB\n    1[First] --> 2[Second]\n    2 --> 3[Third]',
    'graph TD\n    Alpha --> Beta\n    Beta --> Gamma\n    Gamma --> Delta',
  ];

  const handleTestCode = (code: string) => {
    dispatch(setMermaidCode(code));
  };

  return (
    <div className="p-4 bg-gray-50 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🧪 Undo/Redo Test Panel</h3>

      {/* Undo/Redo Controls */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Controls:</h4>
        <UndoRedoButtons />
      </div>

      {/* Test Buttons */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Different Diagrams:</h4>
        <div className="flex flex-wrap gap-2">
          {testCodes.map((code, index) => (
            <button
              key={index}
              onClick={() => handleTestCode(code)}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors"
            >
              Test {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Code Display */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Code:</h4>
        <textarea
          value={currentCode}
          onChange={(e) => dispatch(setMermaidCode(e.target.value))}
          className="w-full h-32 p-2 text-sm font-mono bg-white border border-gray-300 rounded-md resize-none"
          placeholder="Edit the Mermaid code here..."
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-white p-3 rounded-md border">
        <h4 className="font-medium mb-2">📋 How to Test:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click the "Test" buttons to load different diagrams</li>
          <li>Edit the code in the textarea above</li>
          <li>Use Ctrl+Z to undo changes</li>
          <li>Use Ctrl+Y to redo changes</li>
          <li>Watch the history counter update</li>
        </ol>
      </div>
    </div>
  );
};
