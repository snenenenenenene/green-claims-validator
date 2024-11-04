// components/dashboard/nodes/FunctionNode.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { createPortal } from "react-dom";
import { FunctionNodeData, FunctionNodeSequence } from "@/types/nodes";
import BaseNode from "./BaseNode";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import {
	Trash2,
	Function as FunctionIcon,
	Settings,
	Plus,
	ChevronDown,
	Code,
	Variable,
	X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-xl shadow-xl">
				{children}
			</div>
		</div>,
		document.body
	);
};

const FunctionNode = ({ id, data, selected }: NodeProps<FunctionNodeData>) => {
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

	useEffect(() => {
		// Sync nodeData back to the node's data
		Object.assign(data, nodeData);
	}, [data, nodeData]);

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
			return newData;
		});
	}, []);

	const handleSelectVariable = (variableName: string) => {
		console.log("Selecting variable:", variableName);
		updateNodeData((prev) => ({ ...prev, selectedVariable: variableName }));
	};

	const addOperation = (parentIndex = null) => {
		if (currentOperation && currentValue !== "" && nodeData.selectedVariable) {
			const newOperation = {
				type: currentOperation,
				value: Number(currentValue),
				variable: nodeData.selectedVariable
			};
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
			const newRule = {
				type: "if",
				condition: currentCondition,
				value: Number(currentConditionValue),
				variable: nodeData.selectedVariable,
				handleId: "default",
				children: []
			};
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
				ifBlock.children.push({
					type: "else",
					variable: nodeData.selectedVariable,
					handleId: "default",
					children: []
				});
			}

			return { ...prev, sequences: newSequences };
		});
	};

	const updateHandleForBlock = (parentIndex, handleId, blockType = "if") => {
		console.log("Updating handle for block:", { parentIndex, handleId, blockType });
		updateNodeData((prev) => {
			const newSequences = [...prev.sequences];
			const block = newSequences[parentIndex].children.find(
				(child) => child.type === blockType
			);

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
				newSequences[parentIndex].children = newSequences[parentIndex].children.filter(
					(_, i) => i !== index
				);
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
				<motion.div
					key={index}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className={`flex flex-col ${indentClass}`}
				>
					<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
						<span className="text-sm font-medium">
							{seq.type === "if"
								? `If ${seq.variable} is ${seq.condition} ${seq.value}`
								: seq.type === "else"
									? `Else`
									: `${seq.type.charAt(0).toUpperCase() + seq.type.slice(1)} ${seq.value} to ${seq.variable}`}
						</span>
						<button
							className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-500 transition-colors"
							onClick={() => removeSequence(index, parentIndex !== null ? parentIndex : null)}
						>
							<Trash2 size={16} />
						</button>
					</div>

					{(seq.type === "if" || seq.type === "else") && (
						<div className="mt-2 space-y-2 pl-4">
							<div className="flex items-center gap-2">
								<label className="text-xs font-medium text-gray-600">Output Handle:</label>
								<select
									className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={seq.handleId}
									onChange={(e) => updateHandleForBlock(
										parentIndex !== null ? parentIndex : index,
										e.target.value,
										seq.type
									)}
								>
									{nodeData.handles.map((handleId) => (
										<option key={handleId} value={handleId}>
											{handleId}
										</option>
									))}
								</select>
							</div>

							{(seq.type === "if" || seq.type === "else") && (
								<>
									{renderIndentedSequences(
										seq.children,
										level + 1,
										parentIndex !== null ? parentIndex : index
									)}
									{seq.type === "if" && !seq.children.find(child => child.type === "else") && (
										<button
											className="mt-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
											onClick={() => addElse(parentIndex !== null ? parentIndex : index)}
										>
											+ Add Else Condition
										</button>
									)}
								</>
							)}
						</div>
					)}
				</motion.div>
			);
		});
	};

	const modalContent = (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between border-b border-gray-200 pb-4">
				<h3 className="text-lg font-bold text-gray-900">Configure Function</h3>
				<button
					onClick={() => setIsModalOpen(false)}
					className="p-1 hover:bg-gray-100 rounded-md"
				>
					<X className="h-5 w-5 text-gray-500" />
				</button>
			</div>

			{/* Scope Selection */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-gray-700">Variable Scope</label>
				<div className="flex gap-2">
					<button
						className={cn(
							"flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
							nodeData.variableScope === "local"
								? "bg-blue-50 text-blue-700 border-2 border-blue-200"
								: "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100"
						)}
						onClick={() => updateNodeData(prev => ({ ...prev, variableScope: "local" }))}
					>
						Local
					</button>
					<button
						className={cn(
							"flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
							nodeData.variableScope === "global"
								? "bg-purple-50 text-purple-700 border-2 border-purple-200"
								: "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100"
						)}
						onClick={() => updateNodeData(prev => ({ ...prev, variableScope: "global" }))}
					>
						Global
					</button>
				</div>
			</div>

			{/* Variable Selection */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-gray-700">
					Select {nodeData.variableScope.charAt(0).toUpperCase() + nodeData.variableScope.slice(1)} Variable
				</label>
				<select
					value={nodeData.selectedVariable}
					onChange={(e) => handleSelectVariable(e.target.value)}
					className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">Select a variable</option>
					{filteredVariables.map((variable, index) => (
						<option key={index} value={variable.name}>
							{variable.name}
						</option>
					))}
				</select>
			</div>

			{/* Operations Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h4 className="text-sm font-medium text-gray-700">Operations</h4>
					<div className="flex items-center gap-2">
						<select
							value={currentOperation}
							onChange={(e) => setCurrentOperation(e.target.value)}
							className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
							className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Value"
						/>
						<button
							onClick={() => addOperation()}
							className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
						>
							Add
						</button>
					</div>
				</div>

				{/* Conditional Rules */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-gray-700">Conditional Rules</h4>
					<div className="flex items-center gap-2">
						<select
							value={currentCondition}
							onChange={(e) => setCurrentCondition(e.target.value)}
							className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select Condition</option>
							<option value=">">Greater than</option>
							<option value="<">Less than</option>
							<option value="==">Equal to</option>
						</select>
						<input
							type="number"
							value={currentConditionValue}
							onChange={(e) => setCurrentConditionValue(e.target.value)}
							className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Value"
						/>
						<button
							onClick={addRule}
							className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
						>
							Add Rule
						</button>
					</div>
				</div>

				{/* Handles Section in Modal */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium text-gray-700">Handles</h4>
						<button
							onClick={addHandleToNode}
							className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
						>
							Add Handle
						</button>
					</div>
					<div className="space-y-2">
						{nodeData.handles.map((handleId) => (
							<div key={handleId} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg group">
								<div className="flex items-center gap-2">
									<div
										className={cn(
											"w-3 h-3 rounded-full border-2 border-white",
											"bg-violet-500"
										)}
									/>
									<span className="text-sm text-gray-600">{handleId}</span>
								</div>

								<div className="flex items-center gap-2">
									{handleId !== 'default' && (
										<button
											onClick={() => removeHandle(handleId)}
											className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-500 transition-colors"
										>
											<Trash2 size={16} />
										</button>
									)}

									{/* Drag Handle */}
									<div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 cursor-grab active:cursor-grabbing">
										<div className="flex flex-col gap-1">
											<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
											<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
											<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
										</div>
										<div className="flex flex-col gap-1">
											<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
											<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
											<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Sequences */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-gray-700">Sequences</h4>
					<div className="space-y-2 bg-gray-50 p-4 rounded-lg">
						{renderIndentedSequences(nodeData.sequences)}
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<BaseNode
			title="Function"
			onDelete={() => chartStore.removeNode(data.instanceId, id)}
			selected={selected}
			handles={false}
			headerClassName="bg-violet-50/50"
		>
			<div className="p-4 space-y-4">
				<Handle
					type="target"
					position={Position.Top}
					className={cn(
						"w-3 h-3 bg-violet-500 border-2 border-white",
						"transition-all duration-200",
						"hover:bg-violet-600 hover:scale-110"
					)}
				/>

				<input
					type="text"
					value={nodeData.label}
					onChange={(e) => updateNodeData(prev => ({ ...prev, label: e.target.value }))}
					className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
					placeholder="Function Name"
				/>

				<button
					onClick={() => setIsModalOpen(true)}
					className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg transition-colors"
				>
					<Settings className="h-4 w-4" />
					Configure Function
				</button>

				{/* Output Handles */}
				<div className="space-y-2">
					{nodeData.handles.map((handleId) => (
						<div
							key={handleId}
							className="relative flex items-center justify-between bg-gray-50 p-2 rounded-lg group"
						>
							<div className="flex items-center gap-2">
								<Handle
									type="source"
									position={Position.Bottom}
									id={handleId}
									className={cn(
										"w-3 h-3 bg-violet-500 border-2 border-white",
										"transition-all duration-200",
										"hover:bg-violet-600 hover:scale-110"
									)}
								/>
								<span className="text-sm text-gray-600">{handleId}</span>
							</div>

							<div className="flex items-center gap-2">
								{handleId !== 'default' && (
									<button
										onClick={() => removeHandle(handleId)}
										className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-500 transition-colors"
									>
										<Trash2 size={16} />
									</button>
								)}

								{/* Drag Handle */}
								<div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 cursor-grab active:cursor-grabbing">
									<div className="flex flex-col gap-1">
										<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
										<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
										<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
									</div>
									<div className="flex flex-col gap-1">
										<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
										<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
										<div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				{modalContent}
			</Modal>
		</BaseNode>
	);
};

export default FunctionNode;