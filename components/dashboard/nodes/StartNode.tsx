// components/dashboard/nodes/StartNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Flag } from 'lucide-react';
import { StartNodeData } from '@/types/nodes';
import BaseNode from './BaseNode';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';

const StartNode = ({ id, data, selected }: NodeProps<StartNodeData>) => {
  const { chartStore } = useStores();

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete the start node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <BaseNode
      title="Start"
      onDelete={handleDelete}
      selected={selected}
      handles={false}
      headerClassName="bg-emerald-50/50"
    >
      <div className="p-4 flex items-center justify-center">
        <Flag className="h-8 w-8 text-emerald-500" />
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            "w-3 h-3 bg-emerald-500 border-2 border-white",
            "transition-all duration-200",
            "hover:bg-emerald-600 hover:scale-110"
          )}
        />
      </div>
    </BaseNode>
  );
};

export default memo(StartNode);