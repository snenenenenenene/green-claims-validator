"use client";
import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Handle,
} from "reactflow";

import { chartInstances } from "../../data/charts";
import "reactflow/dist/style.css";
import ResizeRotateNode from "../../../components/dashboard/resizeRotateNode";

const nodeTypes = {
  resizeRotate: ResizeRotateNode,
};

const InstancePage = ({
  params,
}: {
  params: {
    instanceId: string;
  };
}) => {
  const [currentInstance, setCurrentInstance] = useState(null);

  useEffect(() => {
    const instance = chartInstances.find(
      (instance) => instance.name === params.instanceId,
    );
    if (instance) {
      setCurrentInstance(instance);
      setNodes(instance.initialNodes);
      setEdges(instance.initialEdges);
    }
  }, [params.instanceId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentInstance ? currentInstance.initialNodes : [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentInstance ? currentInstance.initialEdges : [],
  );

  const { project } = useReactFlow();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: `${+new Date()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (!currentInstance) {
    return <p>Loading...</p>;
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        nodeTypes={nodeTypes}
      >
        {/* <Controls /> */}
        {/* <MiniMap /> */}
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <section className="flex w-full pt-4" id="buttons">
        <button
          className="ml-auto rounded-full border border-yellow bg-yellow p-1.5 px-8 py-4 text-black transition-all hover:border-yellow-hover hover:bg-yellow-hover"
          onClick={() => console.log("Saving schema...")}
        >
          Save
        </button>
      </section>
    </div>
  );
};

export default InstancePage;
