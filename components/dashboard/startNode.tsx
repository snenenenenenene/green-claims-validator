import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import useStore from "@/lib/store";
import { Trash2 } from "lucide-react";

const StartNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [nodeBg, setNodeBg] = useState(data.style?.backgroundColor || "#eee");
  const [nodeHidden, setNodeHidden] = useState(data.hidden || false);
  const [showRemoveButton, setShowRemoveButton] = useState(false);

  const { removeNode } = useStore((state) => ({
    removeNode: state.removeNode,
  }));
  const currentTab = useStore((state) => state.currentTab);
  const { getEdges, setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    data.label = label;
    data.style = { ...data.style, backgroundColor: nodeBg };
    data.hidden = nodeHidden;
  }, [label, nodeBg, nodeHidden, data]);

  const handleRemoveClick = () => {
    const edges = getEdges().filter(
      (edge) => edge.source === id || edge.target === id,
    );
    if (edges.length > 0) {
      if (confirm("Are you sure you want to delete this node?")) {
        removeNode(currentTab, id);
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) =>
          eds.filter((edge) => edge.source !== id && edge.target !== id),
        );
      }
    } else {
      removeNode(currentTab, id);
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id),
      );
    }
  };

  return (
    <div
      style={{ backgroundColor: nodeBg }}
      className={`relative rounded border-2 p-4 ${nodeHidden ? "hidden" : ""}`}
      onMouseEnter={() => setShowRemoveButton(true)}
      onMouseLeave={() => setShowRemoveButton(false)}
    >
      {showRemoveButton && (
        <button
          className="absolute right-0 top-0 m-1 rounded bg-red-500 p-1 text-xs text-white"
          onClick={handleRemoveClick}
        >
          <Trash2 size={16} />
        </button>
      )}
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
