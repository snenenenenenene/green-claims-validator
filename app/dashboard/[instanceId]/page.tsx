"use client";
import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";
import YesNoNode from "@/components/dashboard/yesNoNode";
import SingleChoiceNode from "@/components/dashboard/singleChoiceNode";
import MultipleChoiceNode from "@/components/dashboard/multipleChoiceNode";
import EndNode from "@/components/dashboard/endNode";
import StartNode from "@/components/dashboard/startNode";
import useStore, { ChartInstance } from "@/lib/store";
import { Settings } from "lucide-react";
import { Toaster } from "react-hot-toast";

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
  const {
    chartInstances,
    setNodesAndEdges,
    setCurrentTabColor,
    setOnePage,
    deleteTab,
    currentTab,
    setCurrentTab,
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    setNodesAndEdges: state.setNodesAndEdges,
    setCurrentTabColor: state.setCurrentTabColor,
    setOnePage: state.setOnePage,
    deleteTab: state.deleteTab,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
  }));

  const [currentInstance, setCurrentInstance] = useState<ChartInstance | null>(
    null,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");
  const [onePageMode, setOnePageMode] = useState(false);

  useEffect(() => {
    const instance = chartInstances.find(
      (instance) => instance.name === params.instanceId,
    );

    if (instance) {
      if (currentInstance?.name !== instance.name) {
        setCurrentInstance(instance);
        setNodes(instance.initialNodes);
        setEdges(instance.initialEdges);
        setNewColor(instance.color || "#ffffff");
        setOnePageMode(instance.onePageMode || false);
      }
    } else {
      if (currentInstance !== null) {
        setCurrentInstance(null);
        setNodes([]);
        setEdges([]);
        setNewColor("#ffffff");
        setOnePageMode(false);
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
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds,
        ),
      ),
    [setEdges],
  );

  useEffect(() => {
    if (currentInstance) {
      setNodesAndEdges(currentInstance.name, nodes, edges);
    }
  }, [nodes, edges, currentInstance, setNodesAndEdges]);

  const handleSaveSettings = () => {
    if (currentInstance) {
      setCurrentTabColor(currentInstance.name, newColor);
      setOnePage(currentInstance.name, onePageMode);
      setShowSettings(false);
    }
  };

  const handleDeleteTab = () => {
    if (currentInstance) {
      deleteTab(currentInstance.name);
      setShowSettings(false);
    }
  };

  return (
    <div className="h-full w-full flex-grow relative">
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
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <button
        className="absolute top-4 right-4 z-10 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
        onClick={() => setShowSettings(true)}
      >
        <Settings size={20} />
      </button>
      <Toaster />
      {showSettings && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Settings</h3>
            <div className="mt-4">
              <label className="block">Tab Color</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full h-10 p-0"
              />
            </div>
            <div className="mt-4 flex items-center">
              <label className="mr-2">One Page Mode:</label>
              <input
                type="checkbox"
                checked={onePageMode}
                onChange={(e) => setOnePageMode(e.target.checked)}
                className="form-checkbox"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="btn btn-error"
                onClick={handleDeleteTab}
              >
                Delete
              </button>
              <button
                className="btn"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveSettings}
              >
                Save
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default InstancePage;
