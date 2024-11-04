// components/dashboard/nodes/WeightNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Scale } from 'lucide-react';
import { WeightNodeData } from '@/types/nodes';
import BaseNode from './BaseNode';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';

const WeightNode = ({ id, data, selected }: NodeProps<WeightNodeData>) => {
  const { chartStore } = useStores();

  const handleWeightChange = useCallback((value: string) => {
    const weight = parseFloat(value) || 1;
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      weight,
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this weight node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <BaseNode
      title="Weight"
      onDelete={handleDelete}
      selected={selected}
      handles={false}
      headerClassName="bg-amber-50/50"
    >
      <div className="space-y-4">
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            "w-3 h-3 bg-amber-500 border-2 border-white",
            "transition-all duration-200",
            "hover:bg-amber-600 hover:scale-110"
          )}
        />

        <div className="flex items-center gap-4">
          <Scale className="h-5 w-5 text-amber-500" />
          <input
            type="number"
            value={data.weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            step="0.1"
            min="0"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          Score will be multiplied by this weight
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            "w-3 h-3 bg-amber-500 border-2 border-white",
            "transition-all duration-200",
            "hover:bg-amber-600 hover:scale-110"
          )}
        />
      </div>
    </BaseNode>
  );
};

export default memo(WeightNode);

