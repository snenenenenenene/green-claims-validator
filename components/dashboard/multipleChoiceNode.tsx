import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import useStore from "@/lib/store";
import { Trash2 } from "lucide-react";

const MultipleChoiceNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [nodeBg, setNodeBg] = useState(data.style?.backgroundColor || "#eee");
  const [nodeHidden, setNodeHidden] = useState(data.hidden || false);
  const [options, setOptions] = useState(data.options || []);
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
    data.options = options;
  }, [label, nodeBg, nodeHidden, options, data]);

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

  const handleOptionChange = (index, newValue) => {
    const newOptions = [...options];
    newOptions[index] = newValue;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
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
      {options.map((option, index) => (
        <div key={index} className="relative mt-2 flex items-center">
          <input
            type="checkbox"
            name={`multiple-choice-${id}`}
            className="mr-2"
          />
          <div className="relative w-full">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="w-full rounded border p-2 pr-8"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-red-500"
              onClick={() => handleRemoveOption(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id={`option-${index}`}
            className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 transform bg-blue-500"
          />
        </div>
      ))}
      <button
        className="mt-2 w-full rounded bg-blue-500 p-2 text-white"
        onClick={handleAddOption}
      >
        Add Option
      </button>
    </div>
  );
};

export default MultipleChoiceNode;
