"use client";
import React, { useEffect, useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  Connection,
  ConnectionLineType,
  Edge,
  Node as FlowNode,
  NodeChange,
  EdgeChange,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import YesNoNode from "@/components/dashboard/yesNoNode";
import SingleChoiceNode from "@/components/dashboard/singleChoiceNode";
import MultipleChoiceNode from "@/components/dashboard/multipleChoiceNode";
import EndNode from "@/components/dashboard/endNode";
import StartNode from "@/components/dashboard/startNode";
import EditableEdge from "@/components/dashboard/editableEdge";
import WeightNode from "@/components/dashboard/weightNode";
import FunctionNode from "@/components/dashboard/functionNode";
import { Settings } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useStores } from "@/hooks/useStores";
import SettingsModal from "@/components/dashboard/settingsModal";

const nodeTypes = {
  yesNo: YesNoNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  endNode: EndNode,
  startNode: StartNode,
  weightNode: WeightNode,
  functionNode: FunctionNode,
};

const edgeTypes = {
  editableEdge: EditableEdge,
};

const InstancePage = ({ params }: { params: { instanceId: string } }) => {
  const { chartStore, modalStore, utilityStore } = useStores();
  const { project } = useReactFlow();

  const instanceId = useMemo(() => decodeURIComponent(params.instanceId), [params.instanceId]);

  useEffect(() => {
    console.log(`Setting current tab to: ${instanceId}`);
    chartStore.setCurrentDashboardTab(instanceId);
    utilityStore.setCurrentTab(instanceId);
  }, [instanceId, chartStore, utilityStore]);

  const currentInstance = useMemo(() =>
    chartStore.getChartInstance(instanceId),
    [chartStore, instanceId]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (currentInstance) {
        chartStore.updateNodes(instanceId, changes);
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (currentInstance) {
        chartStore.updateEdges(instanceId, changes);
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (currentInstance) {
        chartStore.addEdge(instanceId, { ...connection, type: "editableEdge" });
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!currentInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({ x: event.clientX, y: event.clientY });
      const newNodeId = `${type}-${uuidv4()}`;
      let newNode: FlowNode;

      switch (type) {
        case "yesNo":
          newNode = {
            id: newNodeId,
            type,
            position,
            data: {
              label: `${type} node`,
              options: [
                { label: "yes", nextNodeId: null },
                { label: "no", nextNodeId: null },
              ],
            },
          };
          break;

        case "singleChoice":
        case "multipleChoice":
          newNode = {
            id: newNodeId,
            type,
            position,
            data: {
              label: `${type} node`,
              options: [
                { id: uuidv4(), label: "Option 1", nextNodeId: "-1" },
                { id: uuidv4(), label: "Option 2", nextNodeId: "-1" },
              ],
            },
          };
          break;

        case "weightNode":
          newNode = {
            id: newNodeId,
            type,
            position,
            data: {
              label: `${type} node`,
              weight: 1,
              nextNodeId: null,
              previousQuestionIds: [],
              options: [{ label: "DEFAULT", nextNodeId: null }],
            },
          };
          break;

        case "functionNode":
          newNode = {
            id: newNodeId,
            type,
            position,
            data: {
              label: "Function Node",
              variableScope: "local",
              selectedVariable: "",
              sequences: [],
              handles: ["default"],
              instanceId: instanceId,
            },
          };
          break;

        default:
          newNode = {
            id: newNodeId,
            type,
            position,
            data: {
              label: `${type} node`,
              options: [{ label: "DEFAULT", nextNodeId: null }],
            },
          };
          break;
      }

      chartStore.addNode(instanceId, newNode);
    },
    [project, chartStore, instanceId, currentInstance]
  );

  if (!currentInstance) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative h-full w-full flex-grow">
      <ReactFlow
        nodes={currentInstance.nodes}
        edges={currentInstance.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <button
        className="btn btn-ghost absolute right-4 top-4 z-10"
        onClick={() => {
          const modal = document.getElementById('settings_modal') as HTMLDialogElement | null;
          if (modal) modal.showModal();
        }}
      >
        <Settings size={24} />
      </button>
      <Toaster />
      <SettingsModal />
    </div>
  );
};

export default InstancePage;