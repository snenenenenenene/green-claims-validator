import React, { useEffect, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import NodeWrapper from './NodeWrapper';
import { Trash2 } from 'lucide-react';

const MultipleChoiceNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [options, setOptions] = useState(data.options || []);
  const { getEdges } = useReactFlow();

  useEffect(() => {
    data.label = label;

    const edges = getEdges().filter((edge) => edge.source === id || edge.target === id);
    const mainSourceEdge = edges.find((edge) => edge.source === id && edge.sourceHandle === 'main');
    const mainTargetEdge = edges.find((edge) => edge.target === id && edge.targetHandle === 'main');

    const mainNextNodeId = mainSourceEdge ? mainSourceEdge.target : null;
    const mainPrevNodeId = mainTargetEdge ? mainTargetEdge.source : null;

    let updatedOptions = [...options];
    const defaultOptionIndex = updatedOptions.findIndex(option => option.label === "DEFAULT");

    if (defaultOptionIndex !== -1) {
      updatedOptions[defaultOptionIndex] = {
        label: "DEFAULT",
        nextNodeId: mainNextNodeId,
      };
    } else {
      updatedOptions.push({
        label: "DEFAULT",
        nextNodeId: mainNextNodeId,
      });
    }

    updatedOptions = updatedOptions.map(option => option.label === "DEFAULT" ? option : { ...option, nextNodeId: "-1" });

    if (JSON.stringify(updatedOptions) !== JSON.stringify(options)) {
      setOptions(updatedOptions);
    }

    data.options = updatedOptions;
  }, [label, options, data, id, getEdges]);

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
    <NodeWrapper id={id} hidden={data.hidden} style={data.style}>
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
    </NodeWrapper>
  );
};

export default MultipleChoiceNode;