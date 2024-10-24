import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeWrapper from './NodeWrapper';
import { Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const SingleChoiceNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [options, setOptions] = useState(data.options || []);

  useEffect(() => {
    data.label = label;
    data.options = options;
  }, [label, options, data]);

  const handleOptionChange = (index, newValue) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], label: newValue };
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { id: uuidv4(), label: "", nextNodeId: null }]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

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
        className="w-full rounded border p-2 dark:bg-gray-800"
      />
      {options.map((option, index) => (
        <div key={option.id} className="relative mt-2 flex items-center">
          <input type="radio" name={`single-choice-${id}`} className="mr-2" />
          <div className="relative w-full">
            <input
              type="text"
              value={option.label}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="w-full rounded border p-2 pr-8 dark:bg-gray-800"
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
            id={`SCN-${id}-${option.id}-next`}
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
    </NodeWrapper>
  );
};

export default SingleChoiceNode;