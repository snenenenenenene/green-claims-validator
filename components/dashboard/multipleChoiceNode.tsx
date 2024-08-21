import React, { useEffect, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import useStore from '@/lib/store';
import { Trash2 } from 'lucide-react';

const MultipleChoiceNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [nodeBg, setNodeBg] = useState(data.style?.backgroundColor || '#eee');
  const [nodeHidden, setNodeHidden] = useState(data.hidden || false);
  const [options, setOptions] = useState(data.options || []);
  const [showRemoveButton, setShowRemoveButton] = useState(false);

  const { removeNode } = useStore((state) => ({
    removeNode: state.removeNode,
  }));
  const currentTab = useStore((state) => state.currentTab);
  const { getEdges, setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    // Update the data object with current state values
    data.label = label;
    data.style = { ...data.style, backgroundColor: nodeBg };
    data.hidden = nodeHidden;

    const edges = getEdges().filter((edge) => edge.source === id || edge.target === id);
    const mainSourceEdge = edges.find((edge) => edge.source === id && edge.sourceHandle === 'main');
    const mainTargetEdge = edges.find((edge) => edge.target === id && edge.targetHandle === 'main');

    const mainNextNodeId = mainSourceEdge ? mainSourceEdge.target : null;
    const mainPrevNodeId = mainTargetEdge ? mainTargetEdge.source : null;

    // Check if the options already contain a DEFAULT option
    let updatedOptions = [...options];
    const defaultOptionIndex = updatedOptions.findIndex(option => option.label === "DEFAULT");

    if (defaultOptionIndex !== -1) {
      // Update existing DEFAULT option
      updatedOptions[defaultOptionIndex] = {
        label: "DEFAULT",
        nextNodeId: mainNextNodeId,
      };
    } else {
      // Add DEFAULT option if not present
      updatedOptions.push({
        label: "DEFAULT",
        nextNodeId: mainNextNodeId,
      });
    }

    // Ensure other options have nextNodeId set to "-1"
    updatedOptions = updatedOptions.map(option => option.label === "DEFAULT" ? option : { ...option, nextNodeId: "-1" });

    // Only update state if options have changed to avoid infinite loop
    if (JSON.stringify(updatedOptions) !== JSON.stringify(options)) {
      setOptions(updatedOptions);
    }

    data.options = updatedOptions;
  }, [label, nodeBg, nodeHidden, options, data, id, getEdges]);

  const handleRemoveClick = () => {
    const edges = getEdges().filter((edge) => edge.source === id || edge.target === id);
    if (edges.length > 0) {
      if (confirm('Are you sure you want to delete this node?')) {
        removeNode(currentTab, id);
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
      }
    } else {
      removeNode(currentTab, id);
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }
  };

  const handleOptionChange = (index, newValue) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], label: newValue };
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { label: '', nextNodeId: '-1', id: `option-${new Date().getTime()}` }]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <div
      className={`relative bg-white rounded border-2 dark:bg-gray-800 p-4 ${nodeHidden ? 'hidden' : ''}`}
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
      {/* Main Target Handle */}
      <Handle type="target" position={Position.Top} id="main" className="bg-green-500 h-4 w-4" isConnectable={isConnectable} />

      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full dark:bg-gray-800 rounded border p-2"
      />
      {options.map((option, index) => (
        <div key={index} className="relative mt-2 flex items-center">
          <input type="checkbox" name={`multiple-choice-${id}`} className="mr-2" />
          <div className="relative w-full">
            <input
              type="text"
              value={option.label}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="w-full dark:bg-gray-800 rounded border p-2 pr-8"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-red-500"
              onClick={() => handleRemoveOption(index)}
            >
              <Trash2 size={16} />
            </button>
            {option.label !== "DEFAULT" && (
              <Handle
                type="source"
                position={Position.Right}
                id={`MCN-${id}-${option.id}-next`}
                className="h-4 w-4 bg-blue-500 absolute right-0 top-1/2 transform -translate-y-1/2"
                isConnectable={isConnectable}
              />
            )}
          </div>
        </div>
      ))}
      {/* Main Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="main"
        className="h-4 w-4 bg-blue-500"
        isConnectable={isConnectable}
      />
      <button className="mt-2 w-full rounded bg-blue-500 p-2 text-white" onClick={handleAddOption}>
        Add Option
      </button>
    </div>
  );
};

export default MultipleChoiceNode;
