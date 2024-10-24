import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { createPortal } from "react-dom";
import NodeWrapper from './NodeWrapper';
import { useStores } from "@/hooks/useStores";
import { Trash2 } from "lucide-react";

const FunctionNode = ({ id, data, isConnectable }) => {
	const [nodeData, setNodeData] = useState({
		label: data?.label || "Function Node",
		variableScope: data?.variableScope || "local",
		selectedVariable: data?.selectedVariable || "",
		sequences: data?.sequences || [],
		handles: data?.handles || ["default"]
	});

	const { variableStore, chartStore, utilityStore } = useStores();
	const currentTab = utilityStore.currentTab;
	const currentInstance = chartStore.getChartInstance(currentTab);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentOperation, setCurrentOperation] = useState("");
	const [currentValue, setCurrentValue] = useState<number | string>("");
	const [currentCondition, setCurrentCondition] = useState("");
	const [currentConditionValue, setCurrentConditionValue] = useState<number | string>("");

	useEffect(() => {
		console.log("FunctionNode initialized with data:", nodeData);
	}, []);

	// Memoize the filtered variables
	const filteredVariables = useMemo(() => {
		if (nodeData.variableScope === "global") {
			return variableStore.variables.global || [];
		} else {
			return currentInstance?.variables || [];
		}
	}, [variableStore.variables, currentInstance, nodeData.variableScope]);

	const updateNodeData = useCallback((updater) => {
		setNodeData((prevData) => {
			const newData = updater(prevData);
			console.log("Updating node data:", newData);
			chartStore.updateNodeData(data.instanceId, id, newData);
			return newData;
		});
	}, [chartStore, data.instanceId, id]);

	const handleSelectVariable = (variableName: string) => {
		console.log("Selecting variable:", variableName);
		updateNodeData((prev) => ({ ...prev, selectedVariable: variableName }));
	};

	const addOperation = (parentIndex = null) => {
		if (currentOperation && currentValue !== "" && nodeData.selectedVariable) {
			const newOperation = { type: currentOperation, value: Number(currentValue), variable: nodeData.selectedVariable };
			console.log("Adding operation:", newOperation);

			updateNodeData((prev) => {
				const newSequences = [...prev.sequences];
				if (parentIndex !== null) {
					newSequences[parentIndex].children.push(newOperation);
				} else {
					newSequences.push(newOperation);
				}
				return { ...prev, sequences: newSequences };
			});

			setCurrentOperation("");
			setCurrentValue("");
		}
	};

	const addRule = () => {
		if (currentCondition && currentConditionValue !== "" && nodeData.selectedVariable) {
			const newRule = { type: "if", condition: currentCondition, value: Number(currentConditionValue), variable: nodeData.selectedVariable, handleId: "default", children: [] };
			console.log("Adding rule:", newRule);

			updateNodeData((prev) => ({
				...prev,
				sequences: [...prev.sequences, newRule],
			}));

			setCurrentCondition("");
			setCurrentConditionValue("");
		}
	};

	const addElse = (ifIndex) => {
		console.log("Adding else block to if at index:", ifIndex);
		updateNodeData((prev) => {
			const newSequences = [...prev.sequences];
			const ifBlock = newSequences[ifIndex];

			if (!ifBlock.children.find((child) => child.type === "else")) {
				ifBlock.children.push({ type: "else", variable: nodeData.selectedVariable, handleId: "default", children: [] });
			}

			return { ...prev, sequences: newSequences };
		});
	};

	const updateHandleForBlock = (parentIndex, handleId, blockType = "if") => {
		console.log("Updating handle for block:", { parentIndex, handleId, blockType });
		updateNodeData((prev) => {
			const newSequences = [...prev.sequences];
			const block = newSequences[parentIndex].children.find((child) => child.type === blockType);

			if (block) {
				block.handleId = handleId;
			} else {
				newSequences[parentIndex].handleId = handleId;
			}

			return { ...prev, sequences: newSequences };
		});
	};

	const addHandleToNode = () => {
		const newHandleId = `handle-${nodeData.handles.length}`;
		console.log("Adding new handle:", newHandleId);
		updateNodeData((prev) => ({
			...prev,
			handles: [...prev.handles, newHandleId],
		}));
	};

	const removeHandle = (handleId: string) => {
		console.log("Removing handle:", handleId);
		updateNodeData((prev) => ({
			...prev,
			handles: prev.handles.filter((id) => id !== handleId),
			sequences: prev.sequences.filter((seq) => seq.handleId !== handleId),
		}));
	};

	const removeSequence = (index: number, parentIndex = null) => {
		console.log("Removing sequence:", { index, parentIndex });
		updateNodeData((prev) => {
			const newSequences = [...prev.sequences];
			if (parentIndex !== null) {
				newSequences[parentIndex].children = newSequences[parentIndex].children.filter((_, i) => i !== index);
			} else {
				newSequences.splice(index, 1);
			}
			return { ...prev, sequences: newSequences };
		});
	};

	const renderIndentedSequences = (sequences, level = 0, parentIndex = null) => {
		return sequences.map((seq, index) => {
			const isIndented = seq.type !== "else" && level > 0;
			const indentClass = isIndented ? "ml-8" : "";

			return (
				<div key={index} className={`flex flex-col ${indentClass}`}>
					<div className="flex justify-between items-center">
						<span>
							{seq.type === "if"
								? `If ${seq.variable} is ${seq.condition} ${seq.value}`
								: seq.type === "else"
									? `Else`
									: `${seq.type.charAt(0).toUpperCase() + seq.type.slice(1)} ${seq.value} to ${seq.variable}`}
						</span>
						<button
							className="btn btn-error btn-sm"
							onClick={() => removeSequence(index, parentIndex !== null ? parentIndex : null)}
						>
							<Trash2 size={16} />
						</button>
					</div>
					{(seq.type === "if" || seq.type === "else") && (
						<div className="flex space-x-2 mt-2">
							<select
								className="select select-bordered w-1/2"
								value={seq.handleId}
								onChange={(e) => updateHandleForBlock(parentIndex !== null ? parentIndex : index, e.target.value, seq.type)}
							>
								{nodeData.handles.map((handleId) => (
									<option key={handleId} value={handleId}>
										{handleId}
									</option>
								))}
							</select>
						</div>
					)}
					{(seq.type === "if" || seq.type === "else") && (
						<>
							{renderIndentedSequences(seq.children, level + 1, parentIndex !== null ? parentIndex : index)}
							{seq.type === "if" && !seq.children.find(child => child.type === "else") && (
								<div className="flex space-x-2 mt-2">
									<button className="btn btn-secondary" onClick={() => addElse(parentIndex !== null ? parentIndex : index)}>
										Add Else
									</button>
								</div>
							)}
						</>
					)}
				</div>
			);
		});
	};

	return (
		<>
			<NodeWrapper id={id} hidden={data.hidden} style={data.style}>
				<Handle
					type="target"
					position={Position.Top}
					className="bg-green-500 h-4 w-4"
					isConnectable={isConnectable}
				/>
				<input
					type="text"
					value={nodeData.label}
					onChange={(e) => {
						console.log("Changing label to:", e.target.value);
						updateNodeData(prev => ({ ...prev, label: e.target.value }));
					}}
					className="w-full dark:bg-gray-800 rounded border p-2"
				/>
				<div className="mt-4 flex justify-between">
					<div className="relative flex flex-1 flex-col items-center">
						<button className="w-full rounded border p-2" onClick={() => setIsModalOpen(true)}>
							Configure Function
						</button>
					</div>
				</div>
				{nodeData.handles.map((handleId) => (
					<div key={handleId} className="relative flex items-center">
						<Handle
							type="source"
							position={Position.Bottom}
							className="h-4 w-4 bg-blue-500"
							id={handleId}
							isConnectable={isConnectable}
						/>
						<span className="ml-2">{handleId}</span>
						<button
							className="btn btn-error btn-sm ml-2"
							onClick={() => removeHandle(handleId)}
						>
							<Trash2 size={16} />
						</button>
					</div>
				))}
			</NodeWrapper>

			{isModalOpen &&
				createPortal(
					<dialog open className="modal modal-open">
						<div className="modal-box">
							<h3 className="text-lg font-bold">Configure Function</h3>
							<div className="mt-4">
								<div className="mt-4 flex justify-center space-x-4">
									<button
										className={`btn ${nodeData.variableScope === "local" ? "btn-active" : ""}`}
										onClick={() => {
											console.log("Changing variable scope to local");
											updateNodeData(prev => ({ ...prev, variableScope: "local" }));
										}}
									>
										Local
									</button>
									<button
										className={`btn ${nodeData.variableScope === "global" ? "btn-active" : ""}`}
										onClick={() => {
											console.log("Changing variable scope to global");
											updateNodeData(prev => ({ ...prev, variableScope: "global" }));
										}}
									>
										Global
									</button>
								</div>
								<div className="mt-4">
									<label className="block">
										Select {nodeData.variableScope.charAt(0).toUpperCase() + nodeData.variableScope.slice(1)} Variable
									</label>
									<select
										onChange={(e) => handleSelectVariable(e.target.value)}
										value={nodeData.selectedVariable}
										className="select select-bordered w-full"
									>
										<option value="">Select a variable</option>
										{filteredVariables.map((variable, index) => (
											<option key={index} value={variable.name}>
												{variable.name}
											</option>
										))}
									</select>
								</div>

								<div className="mt-4">
									<h4 className="text-md font-bold">Operations</h4>
									<div className="flex space-x-2 mt-2">
										<select
											className="select select-bordered w-1/2"
											value={currentOperation}
											onChange={(e) => setCurrentOperation(e.target.value)}
										>
											<option value="">Select Operation</option>
											<option value="addition">Add</option>
											<option value="subtraction">Subtract</option>
											<option value="multiplication">Multiply</option>
											<option value="division">Divide</option>
										</select>
										<input
											type="number"
											value={currentValue}
											onChange={(e) => setCurrentValue(e.target.value)}
											className="input input-bordered w-1/2"
											placeholder="Enter value"
										/>
										<button className="btn btn-primary" onClick={() => addOperation()}>
											Add Operation
										</button>
									</div>
								</div>

								<div className="mt-4">
									<h4 className="text-md font-bold">Conditional Rules</h4>
									<div className="flex space-x-2 mt-2">
										<select
											className="select select-bordered w-1/3"
											value={currentCondition}
											onChange={(e) => setCurrentCondition(e.target.value)}
										>
											<option value="">Condition</option>
											<option value=">">Greater than</option>
											<option value="<">Less than</option>
											<option value="==">Equal to</option>
										</select>
										<input
											type="number"
											value={currentConditionValue}
											onChange={(e) => setCurrentConditionValue(e.target.value)}
											className="input input-bordered w-1/3"
											placeholder="Enter value"
										/>
										<button className="btn btn-primary" onClick={addRule}>
											Add Rule
										</button>
									</div>
								</div>

								<div className="mt-4">
									<h4 className="text-md font-bold">Handles</h4>
									<div className="flex space-x-2 mt-2">
										<button className="btn btn-primary" onClick={addHandleToNode}>
											Add Handle
										</button>
									</div>
								</div>

								<div className="mt-4">
									<h4 className="text-md font-bold">Sequence</h4>
									<div className="mt-4 space-y-2">
										{renderIndentedSequences(nodeData.sequences)}
									</div>
								</div>

								<div className="modal-action">
									<button className="btn" onClick={() => {
										console.log("Closing modal. Current node data:", nodeData);
										setIsModalOpen(false);
									}}>
										Close
									</button>
								</div>
							</div>
						</div>
					</dialog>,
					document.body
				)}
		</>
	);
};

export default FunctionNode;