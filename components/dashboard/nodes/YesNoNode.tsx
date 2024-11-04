// components/dashboard/nodes/YesNoNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import { YesNoNodeData } from '@/types/nodes';

const DEFAULT_QUESTION = "Does your claim meet this requirement?";

const YesNoNode = ({ id, data, selected }: NodeProps<YesNoNodeData>) => {
  const { chartStore } = useStores();

  const handleQuestionChange = useCallback((value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      question: value || DEFAULT_QUESTION
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <BaseNode
      title="Yes/No Question"
      onDelete={handleDelete}
      selected={selected}
      handles={false} // Disable default handles from BaseNode
      headerClassName="bg-emerald-50/50"
    >
      <div className="space-y-4">
        {/* Input Handle at Top */}
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-white top-0 -translate-y-1/2",
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={DEFAULT_QUESTION}
          />
        </div>

        {/* Options with Handles */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Yes', id: 'yes', position: Position.Bottom },
            { label: 'No', id: 'no', position: Position.Bottom }
          ].map((option) => (
            <div key={option.id} className="relative">
              <div className={cn(
                "p-2 text-center border rounded-lg bg-gray-50 text-sm font-medium transition-all duration-200",
                selected ? "border-gray-300" : "border-gray-200",
                "hover:border-blue-500 hover:bg-blue-50"
              )}>
                {option.label}
              </div>
              <Handle
                type="source"
                position={option.position}
                id={option.id}
                className={cn(
                  "w-3 h-3 bg-blue-500 border-2 border-white",
                  "transition-all duration-200",
                  "hover:bg-blue-600 hover:scale-110",
                  option.id === 'yes' ? "left-[25%]" : "left-[75%]",
                  "bottom-0 translate-y-1/2"
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
};

// Set display name for React DevTools
YesNoNode.displayName = 'YesNoNode';

export default memo(YesNoNode);