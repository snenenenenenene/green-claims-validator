import React, { useEffect, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

const UpdateNode = ({ nodes, setNodes, edges, setEdges }) => {
  const [nodeName, setNodeName] = useState("Node 1");
  const [nodeBg, setNodeBg] = useState("#eee");
  const [nodeHidden, setNodeHidden] = useState(false);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          node.data = {
            ...node.data,
            label: nodeName,
          };
        }
        return node;
      }),
    );
  }, [nodeName, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          node.style = { ...node.style, backgroundColor: nodeBg };
        }
        return node;
      }),
    );
  }, [nodeBg, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          node.hidden = nodeHidden;
        }
        return node;
      }),
    );
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === "e1-2") {
          edge.hidden = nodeHidden;
        }
        return edge;
      }),
    );
  }, [nodeHidden, setNodes, setEdges]);

  return (
    <div className="absolute right-2 top-2 z-40 text-xs">
      <label className="block">label:</label>
      <input
        value={nodeName}
        onChange={(evt) => setNodeName(evt.target.value)}
        className="rounded border p-1"
      />

      <label className="mt-2 block">background:</label>
      <input
        value={nodeBg}
        onChange={(evt) => setNodeBg(evt.target.value)}
        className="rounded border p-1"
      />

      <div className="mt-2 flex items-center">
        <label className="mr-2">hidden:</label>
        <input
          type="checkbox"
          checked={nodeHidden}
          onChange={(evt) => setNodeHidden(evt.target.checked)}
          className="rounded border p-1"
        />
      </div>
    </div>
  );
};

export default UpdateNode;
