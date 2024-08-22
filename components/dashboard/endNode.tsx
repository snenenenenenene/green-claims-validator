import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import useStore from "@/lib/store";
import { Trash2 } from "lucide-react";

const EndNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [nodeBg, setNodeBg] = useState(data.style?.backgroundColor || "#eee");
  const [nodeHidden, setNodeHidden] = useState(data.hidden || false);
  const [endType, setEndType] = useState(data.endType || "end");
  const [redirectTab, setRedirectTab] = useState(data.redirectTab || "");
  const [showRemoveButton, setShowRemoveButton] = useState(false);

  const chartInstances = useStore((state) => state.chartInstances);
  const { removeNode } = useStore((state) => ({
    removeNode: state.removeNode,
  }));
  const currentTab = useStore((state) => state.currentDashboardTab);
  const { getEdges, setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    data.label = label;
    data.style = { ...data.style, backgroundColor: nodeBg };
    data.hidden = nodeHidden;
    data.endType = endType;
    data.redirectTab = redirectTab;
  }, [label, nodeBg, nodeHidden, endType, redirectTab, data]);

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
      className={`relative bg-white dark:bg-gray-800 rounded border-2 p-4 ${nodeHidden ? "hidden" : ""}`}
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
    </div>
  );
};

export default EndNode;
