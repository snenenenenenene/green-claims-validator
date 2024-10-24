import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position } from "reactflow";
import NodeWrapper from './NodeWrapper';
import { useStores } from "@/hooks/useStores";

const StartNode = ({ id, data, isConnectable }) => {
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
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full bg-transparent dark:text-white rounded border p-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-green-500 h-4 w-4"
        isConnectable={isConnectable}
      />
    </NodeWrapper>
  );
};

export default StartNode;