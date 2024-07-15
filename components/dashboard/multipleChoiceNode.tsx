import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";

const MultipleChoiceNode = ({ id, data, isConnectable }) => {
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
      {data.options.map((option, index) => (
        <div key={index} className="relative mt-2 flex items-center">
          <input type="checkbox" className="mr-2" />
          <label>{option}</label>
          <Handle
            type="source"
            position={Position.Bottom}
            id={`option-${index}`}
            className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 transform bg-blue-500"
          />
        </div>
      ))}
    </div>
  );
};

export default MultipleChoiceNode;
