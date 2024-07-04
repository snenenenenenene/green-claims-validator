import React, { useEffect, useState, useRef } from "react";
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  NodeResizer,
} from "reactflow";
import { drag } from "d3-drag";
import { select } from "d3-selection";

export default function ResizeRotateNode({
  id,
  sourcePosition = Position.Left,
  targetPosition = Position.Right,
  data,
}) {
  const rotateControlRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [rotation, setRotation] = useState(0);
  const [resizable, setResizable] = useState(!!data.resizable);
  const [rotatable, setRotatable] = useState(!!data.rotatable);
  const [label, setLabel] = useState(data.label || "Node");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!rotateControlRef.current) {
      return;
    }

    const selection = select(rotateControlRef.current);
    const dragHandler = drag().on("drag", (evt) => {
      const dx = evt.x - 100;
      const dy = evt.y - 100;
      const rad = Math.atan2(dx, dy);
      const deg = rad * (180 / Math.PI);
      setRotation(180 - deg);
      updateNodeInternals(id);
    });

    selection.call(dragHandler);
  }, [id, updateNodeInternals]);

  const handleLabelChange = (event) => {
    setLabel(event.target.value);
    data.label = event.target.value; // Update the node's data
    updateNodeInternals(id); // Trigger an update to the node's internals
  };

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
  };

  return (
    <>
      <div className="rounded border p-2 shadow-md">
        <NodeResizer isVisible={resizable} minWidth={180} minHeight={100} />
        <div className="p-2">
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              autoFocus
              className="mb-2 w-full rounded border bg-transparent p-1 text-white outline-yellow"
            />
          ) : (
            <div
              onDoubleClick={handleLabelDoubleClick}
              //   onClick={handleLabelDoubleClick}
              className="z-50 mb-2 cursor-pointer"
            >
              {label}
            </div>
          )}
          <div className="mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={resizable}
                onChange={(evt) => setResizable(evt.target.checked)}
                className="form-checkbox"
              />
              <span>resizable</span>
            </label>
          </div>
        </div>
        <Handle position={sourcePosition} type="source" />
        <Handle position={targetPosition} type="target" />
      </div>
    </>
  );
}
