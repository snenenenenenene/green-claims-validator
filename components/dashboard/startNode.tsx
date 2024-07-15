import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";

const StartNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [nodeBg, setNodeBg] = useState(data.style?.backgroundColor || "#eee");
  const [nodeHidden, setNodeHidden] = useState(data.hidden || false);

  useEffect(() => {
    data.label = label;
    data.style = { ...data.style, backgroundColor: nodeBg };
    data.hidden = nodeHidden;
  }, [label, nodeBg, nodeHidden, data]);

  return (
    <div
      style={{ backgroundColor: nodeBg }}
      className={`rounded border-2 p-4 ${nodeHidden ? "hidden" : ""}`}
    >
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded border p-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-green-500 h-4 w-4"
      />
    </div>
  );
};

export default StartNode;
