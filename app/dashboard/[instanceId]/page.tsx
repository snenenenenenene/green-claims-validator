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
import EditableEdge from "@/components/dashboard/editableEdge";
import useStore from "@/lib/store";
import { Settings } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { saveAs } from "file-saver";

const nodeTypes = {
  yesNo: YesNoNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  endNode: EndNode,
  startNode: StartNode,
};

const edgeTypes = {
  editableEdge: EditableEdge,
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
    setChartInstance,
    updateChartInstanceName, // New function to update chart instance name
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    setNodesAndEdges: state.setNodesAndEdges,
    setCurrentTabColor: state.setCurrentTabColor,
    setOnePage: state.setOnePage,
    deleteTab: state.deleteTab,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
    setChartInstance: state.setChartInstance,
    updateChartInstanceName: state.updateChartInstanceName, // New function to update chart instance name
  }));

  const [currentInstance, setCurrentInstance] = useState<any | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newColor, setNewColor] = useState("#80B500");
  const [onePageMode, setOnePageMode] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectedGlobalVersion, setSelectedGlobalVersion] = useState("");
  const [activeTab, setActiveTab] = useState("local");

  useEffect(() => {
    const instanceId = decodeURIComponent(params.instanceId);
    const instance = chartInstances.find(
      (instance) => instance.name === instanceId,
    );

    if (instance) {
      if (currentInstance?.name !== instance.name) {
        setCurrentInstance(instance);
        setNodes(instance.initialNodes);
        setEdges(instance.initialEdges);
        setNewColor(instance.color || "#80B500");
        setOnePageMode(instance.onePageMode || false);
        setNewTabName(instance.name); // Set the newTabName to the current instance name
      }
    } else {
      if (currentInstance !== null) {
        setCurrentInstance(null);
        setNodes([]);
        setEdges([]);
        setNewColor("#80B500");
        setOnePageMode(false);
        setNewTabName(""); // Reset the newTabName when no instance is found
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
          weight: 0,
          onChange: (value: number) => {
            const updatedNodes = nodes.map((node) =>
              node.id === newNode.id
                ? { ...node, data: { ...node.data, weight: value } }
                : node,
            );
            setNodes(updatedNodes);
          },
        },
      };

      setNodes((nds) => [...nds, newNode]);
      toast.success("Node added.");
    },
    [project, setNodes, nodes],
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "editableEdge" }, eds),
      ),
    [setEdges],
  );

  useEffect(() => {
    if (currentInstance) {
      setNodesAndEdges(currentInstance.name, nodes as any, edges as any);
    }
  }, [nodes, edges, currentInstance, setNodesAndEdges]);

  const exportToJSON = () => {
    if (!currentInstance) {
      toast.error("No instance selected.");
      return;
    }

    const { name, initialNodes, initialEdges } = currentInstance;
    const dataToExport = {
      name,
      nodes: initialNodes,
      edges: initialEdges,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    saveAs(blob, `${name}.json`);
    toast.success("Exported successfully.");
  };

  const handleSaveSettings = () => {
    if (currentInstance) {
      setCurrentTabColor(currentInstance.name, newColor);
      setOnePage(onePageMode);
      setShowSettings(false);
      toast.success("Settings saved.");
    }
  };

  const handleDeleteTab = () => {
    if (currentInstance) {
      deleteTab(currentInstance.name);
      setShowSettings(false);
      toast.success("Tab deleted.");
    }
  };

  const handleRenameTab = () => {
    if (newTabName && currentInstance) {
      updateChartInstanceName(currentInstance.name, newTabName); // Update the name in the store
      setCurrentTab(newTabName); // Update the current tab name
      toast.success("Tab renamed successfully.");
    }
  };

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVersion = event.target.value;
    setSelectedVersion(selectedVersion);

    const versionData = currentInstance?.publishedVersions?.find(
      (version) => version.version.toString() === selectedVersion,
    );

    if (versionData) {
      const { initialNodes, initialEdges } = versionData;
      setNodes(initialNodes);
      setEdges(initialEdges);
      toast.success("Reverted to selected version.");
    }
  };

  return (
    <div className="relative h-full w-full flex-grow">
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
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Controls />
        {/* @ts-ignore */}
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <button
        className="btn btn-ghost absolute right-4 top-4"
        onClick={() => setShowSettings(true)}
      >
        <Settings size={20} />
      </button>
      <Toaster />
      {showSettings && (
        <dialog open className="modal">
          <div className="modal-box">
            <div role="tablist" className="tabs tabs-bordered">
              <a
                role="tab"
                className={`tab ${activeTab === "local" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("local")}
              >
                Local Settings
              </a>
              <a
                role="tab"
                className={`tab ${activeTab === "global" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("global")}
              >
                Global Settings
              </a>
            </div>

            {activeTab === "local" && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Local Settings</h3>
                <div className="mt-4">
                  <label className="block">Tab Color</label>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-10 w-full p-0"
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
                <div className="mt-4">
                  <label className="block">Rename Tab</label>
                  <input
                    type="text"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Enter new tab name"
                  />
                  <button
                    className="btn btn-primary mt-2"
                    onClick={handleRenameTab}
                  >
                    Rename
                  </button>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="btn btn-error" onClick={handleDeleteTab}>
                    Delete
                  </button>
                  <button className="btn" onClick={() => setShowSettings(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-success" onClick={handleSaveSettings}>
                    Save
                  </button>
                </div>
              </div>
            )}

            {activeTab === "global" && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Global Settings</h3>
                <div className="mt-4">
                  <label className="block">Select Version</label>
                  <select
                    value={selectedGlobalVersion}
                    onChange={handleVersionChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select a version</option>
                    {currentInstance?.publishedVersions?.map((version) => (
                      <option key={version.version} value={version.version}>
                        {`${version.message} - ${new Date(
                          version.date,
                        ).toLocaleString()}`}
                      </option>
                    ))}
                  </select>
                  {selectedGlobalVersion && (
                    <button
                      className="btn btn-warning mt-2"
                      onClick={() =>
                        useStore.getState().revertToGlobalCommit(
                          selectedGlobalVersion,
                        )
                      }
                    >
                      Revert to Version
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default InstancePage;
