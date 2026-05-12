import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { DiagramSample, diagramSamples, diagramSampleCategories } from '../../constants/diagram-samples.data';

export const DiagramSamples: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredSamples =
    selectedCategory === 'All'
      ? diagramSamples
      : diagramSamples.filter((sample) => sample.category === selectedCategory);

  const handleSampleSelect = (sample: DiagramSample) => {
    // Load the diagram code first
    dispatch(setMermaidCode(sample.code));

    // Note: Auto-centering is now handled automatically by DiagramDisplay.tsx
    // No need to manually center here

    // Show notification
    dispatch(
      showNotification({
        message: `Loaded ${sample.name} example`,
        type: 'success',
      })
    );
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">📚</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Diagram Examples ({diagramSamples.length})
          </span>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900">
          {/* Category Filter */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({diagramSamples.length})
              </button>
              {diagramSampleCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category} ({diagramSamples.filter((s) => s.category === category).length})
                </button>
              ))}
            </div>
          </div>

          {/* Samples Grid */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredSamples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleSelect(sample)}
                className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{sample.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{sample.name}</h4>
                      <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {sample.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{sample.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Click any example to load it into the editor. You can then modify the code to customize it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
