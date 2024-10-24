import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { useStores } from "@/hooks/useStores";
import NodeWrapper from './NodeWrapper';

const EndNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [endType, setEndType] = useState(data.endType || "end");
  const [redirectTab, setRedirectTab] = useState(data.redirectTab || "");

  const { chartStore } = useStores();
  const chartInstances = chartStore.chartInstances;

  useEffect(() => {
    data.label = label;
    data.endType = endType;
    data.redirectTab = redirectTab;
  }, [label, endType, redirectTab, data]);

  return (
    <NodeWrapper id={id} hidden={data.hidden} style={data.style}>
      <Handle
        type="target"
        position={Position.Top}
        className="bg-green-500 h-4 w-4"
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full dark:bg-gray-800 rounded border p-2"
      />
      <div className="mt-2">
        <select
          value={endType}
          onChange={(e) => setEndType(e.target.value)}
          className="w-full dark:bg-gray-800 rounded border p-2"
        >
          <option value="end">End Quiz</option>
          <option value="redirect">Redirect to Another Tab</option>
        </select>
      </div>
      {endType === "redirect" && (
        <div className="mt-2">
          <select
            value={redirectTab}
            onChange={(e) => setRedirectTab(e.target.value)}
            className="w-full dark:bg-gray-800 rounded border p-2"
          >
            <option value="" disabled>
              Select a tab
            </option>
            {chartInstances.map((instance) => (
              <option key={instance.name} value={instance.name}>
                {instance.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </NodeWrapper>
  );
};

export default EndNode;