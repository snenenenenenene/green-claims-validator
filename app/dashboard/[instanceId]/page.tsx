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
} from "reactflow";

import "reactflow/dist/style.css";
import YesNoNode from "@/components/dashboard/yesNoNode";
import SingleChoiceNode from "@/components/dashboard/singleChoiceNode";
import MultipleChoiceNode from "@/components/dashboard/multipleChoiceNode";
import EndNode from "@/components/dashboard/endNode";
import StartNode from "@/components/dashboard/startNode";
import useStore, { ChartInstance } from "@/lib/store";

const nodeTypes = {
  yesNo: YesNoNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  endNode: EndNode,
  startNode: StartNode,
};

interface InstancePageProps {
  params: {
    instanceId: string;
  };
}

const InstancePage: React.FC<InstancePageProps> = ({ params }) => {
  const { chartInstances, setNodesAndEdges } = useStore((state) => ({
    chartInstances: state.chartInstances,
    setNodesAndEdges: state.setNodesAndEdges,
  }));
  const [currentInstance, setCurrentInstance] = useState<ChartInstance | null>(
    null,
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const instance = chartInstances.find(
      (instance) => instance.name === params.instanceId,
    );

    if (instance) {
      if (currentInstance?.name !== instance.name) {
        setCurrentInstance(instance);
        setNodes(instance.initialNodes);
        setEdges(instance.initialEdges);
      }
    } else {
      if (currentInstance !== null) {
        setCurrentInstance(null);
        setNodes([]);
        setEdges([]);
      }
    }
  }, [params.instanceId, chartInstances, currentInstance, setNodes, setEdges]);

  const { project } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: `${+new Date()}`,
        type,
        position,
        data: {
          label: `${type} node`,
          options: ["Option 1", "Option 2"],
          endType: "end",
          redirectTab: "",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    if (currentInstance) {
      setNodesAndEdges(currentInstance.name, nodes, edges);
    }
  }, [nodes, edges, currentInstance, setNodesAndEdges]);

  return (
    <div className="h-full w-full flex-grow">
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
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default InstancePage;
