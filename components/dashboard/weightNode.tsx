import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import NodeWrapper from './NodeWrapper';

const WeightNode = ({ id, data, isConnectable }) => {
  const [weight, setWeight] = useState(data.weight || 1);

  useEffect(() => {
    data.weight = weight;
  }, [weight, data]);

  return (
    <NodeWrapper id={id}>
      <Handle
        type="target"
        position={Position.Top}
        className="bg-green-500 h-4 w-4"
        isConnectable={isConnectable}
      />
      <div>
        <label className="block">Weight:</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="nodrag w-full dark:bg-gray-800"
          step="0.1"
          min="0"
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-blue-500 h-4 w-4"
        isConnectable={isConnectable}
      />
    </NodeWrapper>
  );
};

export default WeightNode;