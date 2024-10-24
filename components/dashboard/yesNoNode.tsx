import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position } from "reactflow";
import NodeWrapper from './NodeWrapper';
import { useStores } from "@/hooks/useStores";

const YesNoNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const { chartStore, utilityStore } = useStores();

  useEffect(() => {
    data.label = label;
  }, [label, data]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    chartStore.removeNode(utilityStore.currentTab, nodeId);
  }, [chartStore, utilityStore.currentTab]);

  return (
    <NodeWrapper id={id} hidden={data.hidden} style={data.style} onRemoveNode={handleRemoveNode}>
      <Handle
        type="target"
        position={Position.Top}
        className="bg-green-500 h-4 w-4"
        isConnectable={isConnectable}
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full bg-transparent dark:text-white rounded border p-2"
      />
      <div className="mt-4 flex justify-between">
        <div className="relative flex flex-1 flex-col items-center">
          <button className="mb-1 w-full rounded border p-2 dark:text-white">Yes</button>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="bottom-0 h-4 w-4 bg-blue-500"
            isConnectable={isConnectable}
          />
        </div>
        <div className="relative flex flex-1 flex-col items-center">
          <button className="mb-1 w-full rounded border p-2 dark:text-white">No</button>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="bottom-0 h-4 w-4 bg-red-500"
            isConnectable={isConnectable}
          />
        </div>
      </div>
    </NodeWrapper>
  );
};

export default YesNoNode;