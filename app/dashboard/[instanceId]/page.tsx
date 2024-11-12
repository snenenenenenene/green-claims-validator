"use client";

import {
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode,
} from "@/components/nodes/index";
import { useStores } from "@/hooks/useStores";
import { motion } from "framer-motion";
import { Loader2, Play, Redo, Save, Settings, Undo, ZoomIn, ZoomOut } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ReactFlow, {
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  MiniMap,
  Panel,
  useReactFlow
} from "reactflow";

import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath
} from 'reactflow';

import {LoadingSpinner} from "@/components/ui/base"

function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-gray-200 dark:bg-gray-800 border border-white rounded-full text-xs leading-none hover:shadow-md"
            onClick={onEdgeClick}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}


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

// Helper function to create new nodes
function createNewNode(type: string, position: { x: number; y: number }, instanceId: string) {
  const newNodeId = `${type}-${Math.random().toString(36).substr(2, 9)}`;

  const baseNode = {
    id: newNodeId,
    type,
    position,
    data: {
      label: `${type} node`,
      instanceId,
    },
    style: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
    },
  };

  switch (type) {
    case "yesNo":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          question: "Yes/No Question",
          options: [
            { label: "yes", nextNodeId: null },
            { label: "no", nextNodeId: null },
          ],
        },
      };

    case "singleChoice":
    case "multipleChoice":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          question: `${type === 'singleChoice' ? 'Single' : 'Multiple'} Choice Question`,
          options: [
            { id: crypto.randomUUID(), label: "Option 1", nextNodeId: null },
            { id: crypto.randomUUID(), label: "Option 2", nextNodeId: null },
          ],
        },
      };

    case "weightNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          weight: 1,
          nextNodeId: null,
          previousQuestionIds: [],
          options: [{ label: "DEFAULT", nextNodeId: null }],
        },
      };

    case "functionNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          variableScope: "local",
          selectedVariable: "",
          sequences: [],
          handles: ["default"],
        },
      };

    case "startNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          label: "Start",
          options: [{ label: "DEFAULT", nextNodeId: null }],
        },
        style: {
          ...baseNode.style,
          background: '#ecfdf5',
          borderColor: '#6ee7b7',
        },
      };

    case "endNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          label: "End",
          endType: "end",
          redirectTab: "",
        },
        style: {
          ...baseNode.style,
          background: '#fef2f2',
          borderColor: '#fca5a5',
        },
      };

    default:
      return baseNode;
  }
}

const DashboardInstancePage = ({ params }: { params: { instanceId: string } }) => {
  const { chartStore, utilityStore } = useStores();
  const { project, zoomIn, zoomOut } = useReactFlow();
  const [isLoading, setIsLoading] = useState(false);

  const instanceId = decodeURIComponent(params.instanceId);
  const currentInstance = chartStore.getChartInstance(instanceId);

  useEffect(() => {
    chartStore.setCurrentDashboardTab(instanceId);
    utilityStore.setCurrentTab(instanceId);
  }, [instanceId, chartStore, utilityStore]);

  const onNodesChange = useCallback(
    (changes) => {
      if (currentInstance) {
        chartStore.updateNodes(instanceId, changes);
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onEdgesChange = useCallback(
    (changes) => {
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
      const newNode = createNewNode(type, position, instanceId);
      if (newNode) {
        chartStore.addNode(instanceId, newNode);
      }
    },
    [project, chartStore, instanceId, currentInstance]
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await utilityStore.saveToDb(chartStore.chartInstances);
      toast.success("Flow saved successfully");
    } catch (error) {
      toast.error("Failed to save flow");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentInstance) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ReactFlow
        nodes={currentInstance.nodes}
        edges={currentInstance.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }}
        fitView
      >
        {/* Top Controls */}
        <Panel position="top-right" className="flex gap-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-200"
          >
            <button
              onClick={() => zoomIn()}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => {/* Implement undo */ }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => {/* Implement redo */ }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => {
                const modal = document.getElementById('settings_modal') as HTMLDialogElement | null;
                if (modal) modal.showModal();
              }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </motion.div>
        </Panel>

        {/* Bottom Controls */}
        <Panel position="bottom-right" className="flex gap-2 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={() => {
                toast.success("Starting flow simulation...");
                // Implement simulation logic
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-lg text-sm font-medium text-white hover:bg-green-600"
            >
              <Play className="h-4 w-4" />
              Simulate
            </button>
          </motion.div>
        </Panel>

        <Background
          color="#94a3b8"
          className="bg-slate-50"
          variant="dots"
          gap={12}
          size={1}
        />
        <MiniMap
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg"
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={(node) => {
            switch (node.type) {
              case 'startNode':
                return '#6ee7b7';
              case 'endNode':
                return '#fca5a5';
              default:
                return '#e2e8f0';
            }
          }}
        />
        <Controls
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg"
          showInteractive={false}
        />
      </ReactFlow>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      <SettingsModal />
    </div>
  );
};

export default DashboardInstancePage;

const SettingsModal: React.FC = () => {
	const { chartStore, utilityStore, variableStore } = useStores();
	const { setCurrentTabColor, setOnePage, updateChartInstanceName, deleteTab } = chartStore;
	const { currentTab, saveToDb } = utilityStore;

	const currentInstance = chartStore.getChartInstance(currentTab);

	const [newColor, setNewColor] = useState(currentInstance?.color || "#80B500");
	const [onePageMode, setOnePageMode] = useState(currentInstance?.onePageMode || false);
	const [newTabName, setNewTabName] = useState(currentInstance?.name || "");
	const [localVariables, setLocalVariables] = useState(currentInstance?.variables || []);
	const [globalVariables, setGlobalVariables] = useState(variableStore.variables?.global || []);
	const [newVariableName, setNewVariableName] = useState("");
	const [newVariableValue, setNewVariableValue] = useState("");
	const [newVariableScope, setNewVariableScope] = useState<"local" | "global">("local");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (currentInstance) {
			setNewColor(currentInstance.color || "#80B500");
			setOnePageMode(currentInstance.onePageMode || false);
			setNewTabName(currentInstance.name);
			setLocalVariables(currentInstance.variables || []);
		}
		setGlobalVariables(variableStore.variables?.global || []);
	}, [currentInstance, variableStore.variables]);

	const handleSaveSettings = async () => {
		if (currentInstance) {
			setIsSaving(true);
			setCurrentTabColor(currentInstance.id, newColor);
			setOnePage(currentInstance.id, onePageMode);
			updateChartInstanceName(currentInstance.id, newTabName);
			const updatedInstance = {
				...currentInstance,
				color: newColor,
				onePageMode: onePageMode,
				name: newTabName,
				variables: localVariables,
			};
			chartStore.updateChartInstance(updatedInstance);
			variableStore.setVariables({ ...variableStore.variables, global: globalVariables });

			try {
				console.log("Current tab:", currentTab);
				console.log("Updated instance:", updatedInstance);
				console.log("All chart instances:", chartStore.chartInstances);

				// Ensure we're passing the updated chart instances
				const updatedChartInstances = chartStore.chartInstances.map(instance =>
					instance.id === updatedInstance.id ? updatedInstance : instance
				);

				await Promise.all([
					saveToDb(updatedChartInstances),
					new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2 second delay
				]);
				toast.success('Settings saved successfully');
				closeModal();
			} catch (error) {
				console.error("Error saving to database:", error);
				toast.error('Failed to save settings. Please try again.');
			} finally {
				setIsSaving(false);
			}
		} else {
			console.error("No current instance found");
			toast.error('No current instance found. Unable to save settings.');
		}
	};

	const handleDeleteTab = () => {
		if (currentInstance && window.confirm("Are you sure you want to delete this tab?")) {
			deleteTab(currentInstance.id);
			closeModal();
		}
	};

	const handleAddVariable = () => {
		if (newVariableName && newVariableValue) {
			const newVariable = { name: newVariableName, value: newVariableValue };
			if (newVariableScope === "local") {
				setLocalVariables([...localVariables, newVariable]);
			} else {
				setGlobalVariables([...globalVariables, newVariable]);
			}
			setNewVariableName("");
			setNewVariableValue("");
		}
	};

	const handleRemoveVariable = (index: number, scope: "local" | "global") => {
		if (scope === "local") {
			setLocalVariables(localVariables.filter((_, i) => i !== index));
		} else {
			setGlobalVariables(globalVariables.filter((_, i) => i !== index));
		}
	};

	const closeModal = () => {
		const modal = document.getElementById('settings_modal') as HTMLDialogElement | null;
		if (modal) {
			modal.close();
		}
	};

	return (
		<dialog id="settings_modal" className="modal">
			<div className="modal-box">
				<h2 className="text-2xl font-bold mb-4 dark:text-white">Settings</h2>
				<div className="mb-4">
					<label className="block mb-2 dark:text-white">Tab Color</label>
					<input
						type="color"
						value={newColor}
						onChange={(e) => setNewColor(e.target.value)}
						className="w-full h-10"
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-2 dark:text-white">One Page Mode</label>
					<input
						type="checkbox"
						checked={onePageMode}
						onChange={(e) => setOnePageMode(e.target.checked)}
						className="mr-2"
					/>
					<span className="dark:text-white">Enable</span>
				</div>
				<div className="mb-4">
					<label className="block mb-2 dark:text-white">Tab Name</label>
					<input
						type="text"
						value={newTabName}
						onChange={(e) => setNewTabName(e.target.value)}
						className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div className="mb-4">
					<h3 className="text-lg font-semibold mb-2 dark:text-white">Variables</h3>
					<div className="flex space-x-2 mb-2">
						<button
							className={`btn ${newVariableScope === "local" ? "btn-active" : ""}`}
							onClick={() => setNewVariableScope("local")}
						>
							Local
						</button>
						<button
							className={`btn ${newVariableScope === "global" ? "btn-active" : ""}`}
							onClick={() => setNewVariableScope("global")}
						>
							Global
						</button>
					</div>
					{(newVariableScope === "local" ? localVariables : globalVariables).map((variable, index) => (
						<div key={index} className="flex justify-between items-center mb-2">
							<span className="dark:text-white">{variable.name}: {variable.value}</span>
							<button
								onClick={() => handleRemoveVariable(index, newVariableScope)}
								className="btn btn-error btn-sm"
							>
								Remove
							</button>
						</div>
					))}
					<div className="flex space-x-2 mt-2">
						<input
							type="text"
							value={newVariableName}
							onChange={(e) => setNewVariableName(e.target.value)}
							placeholder="Variable Name"
							className="w-1/3 p-2 border rounded dark:bg-gray-700 dark:text-white"
						/>
						<input
							type="text"
							value={newVariableValue}
							onChange={(e) => setNewVariableValue(e.target.value)}
							placeholder="Variable Value"
							className="w-1/3 p-2 border rounded dark:bg-gray-700 dark:text-white"
						/>
						<button
							onClick={handleAddVariable}
							className="btn btn-primary"
						>
							Add {newVariableScope.charAt(0).toUpperCase() + newVariableScope.slice(1)}
						</button>
					</div>
				</div>
				<div className="flex justify-between">
					<button
						className="btn btn-primary"
						onClick={handleSaveSettings}
						disabled={isSaving}
					>
						{isSaving ? (
							<>
								<LoadingSpinner/>
								Saving...
							</>
						) : (
							'Save'
						)}
					</button>
					<button className="btn btn-error" onClick={handleDeleteTab}>
						Delete Tab
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
};
