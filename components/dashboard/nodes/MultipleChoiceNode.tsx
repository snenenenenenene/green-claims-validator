// components/dashboard/nodes/MultipleChoiceNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Check } from 'lucide-react';
import { ChoiceOption, MultipleChoiceNodeData } from '@/types/nodes';

const DEFAULT_QUESTION = "Select all that apply:";

const MultipleChoiceNode = ({ id, data, selected }: NodeProps<MultipleChoiceNodeData>) => {
  const { chartStore } = useStores();

  const handleQuestionChange = useCallback((value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      question: value || DEFAULT_QUESTION,
    });
  }, [chartStore, data, id]);

  const handleOptionChange = useCallback((optionId: string, value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: data.options.map(opt =>
        opt.id === optionId ? { ...opt, label: value } : opt
      ),
    });
  }, [chartStore, data, id]);

  const handleAddOption = useCallback(() => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: [
        ...data.options,
        { id: crypto.randomUUID(), label: '', nextNodeId: null }
      ],
    });
  }, [chartStore, data, id]);

  const handleRemoveOption = useCallback((optionId: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: data.options.filter(opt => opt.id !== optionId),
    });
  }, [chartStore, data.instanceId, id]);

  const handleSelectionLimitChange = useCallback((type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || undefined;
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      [type === 'min' ? 'minSelections' : 'maxSelections']: numValue,
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <BaseNode
      title="Multiple Choice"
      onDelete={handleDelete}
      selected={selected}
      handles={false}
      headerClassName="bg-indigo-50/50"
    >
      <div className="space-y-4">
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-white",
            "transition-all duration-200",
            "hover:bg-blue-600 hover:scale-110"
          )}
        />

        {/* Question Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={DEFAULT_QUESTION}
          />
        </div>

        {/* Selection Limits */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Selections
            </label>
            <input
              type="number"
              min="0"
              max={data.options.length}
              value={data.minSelections || ''}
              onChange={(e) => handleSelectionLimitChange('min', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Selections
            </label>
            <input
              type="number"
              min={data.minSelections || 0}
              max={data.options.length}
              value={data.maxSelections || ''}
              onChange={(e) => handleSelectionLimitChange('max', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div key={option.id} className="relative group">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                  <Check className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id={`${option.id}-target`}
                className={cn(
                  "w-3 h-3 bg-blue-500 border-2 border-white",
                  "transition-all duration-200",
                  "hover:bg-blue-600 hover:scale-110"
                )}
                style={{
                  left: `${((index + 1) / (data.options.length + 1)) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        <button
          onClick={handleAddOption}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </button>
      </div>
    </BaseNode>
  );
};

export default memo(MultipleChoiceNode);