import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { chartInstances } from "@/app/data/charts";

const EndNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [nodeBg, setNodeBg] = useState(data.style?.backgroundColor || "#eee");
  const [nodeHidden, setNodeHidden] = useState(data.hidden || false);
  const [endType, setEndType] = useState(data.endType || "end");
  const [redirectTab, setRedirectTab] = useState(data.redirectTab || "");

  useEffect(() => {
    data.label = label;
    data.style = { ...data.style, backgroundColor: nodeBg };
    data.hidden = nodeHidden;
    data.endType = endType;
    data.redirectTab = redirectTab;
  }, [label, nodeBg, nodeHidden, endType, redirectTab, data]);

  return (
    <div
      style={{ backgroundColor: nodeBg }}
      className={`rounded border-2 p-4 ${nodeHidden ? "hidden" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="bg-green-500 h-4 w-4"
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded border p-2"
      />
      <div className="mt-2">
        <select
          value={endType}
          onChange={(e) => setEndType(e.target.value)}
          className="w-full rounded border p-2"
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
            className="w-full rounded border p-2"
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
    </div>
  );
};

export default EndNode;
