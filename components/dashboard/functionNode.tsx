import React, { useState } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import useStore from "@/lib/store";
import { Trash2, ExternalLink } from "lucide-react";

const FunctionNode = ({ id, data, isConnectable }: NodeProps) => {
	const [label, setLabel] = useState(data?.label || "Function Node");
	const [nodeBg, setNodeBg] = useState(data?.style?.backgroundColor || "#eee");
	const [nodeHidden, setNodeHidden] = useState(data?.hidden || false);
	const [showRemoveButton, setShowRemoveButton] = useState(false);
	const [variableScope, setVariableScope] = useState<"local" | "global">("local");

	const variables = useStore((state) => state.variables);
	const { openModal, setNodes } = useStore();
	const currentTab = useStore((state) => state.currentDashboardTab);
	const { getEdges, setEdges } = useReactFlow();

	const handleSelectVariable = (variableName: string) => {
		const selectedVariable = variables[variableScope].find((v) => v.name === variableName);
		console.log(`Selected ${variableScope} variable:`, selectedVariable);
	};

	const removeNode = () => {
		setNodes((nodes) => nodes.filter((node) => node.id !== id));
		setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
	};

	const showModal = () => {
		openModal(
			<div>
				<h3 className="text-lg font-bold">Select Variable</h3>
				<div className="mt-4 flex justify-center space-x-4">
					<button
						className={`btn ${variableScope === "local" ? "btn-active" : ""}`}
						onClick={() => setVariableScope("local")}
					>
						Local
					</button>
					<button
						className={`btn ${variableScope === "global" ? "btn-active" : ""}`}
						onClick={() => setVariableScope("global")}
					>
						Global
					</button>
				</div>
				<div className="mt-4">
					<label className="block">
						Select {variableScope.charAt(0).toUpperCase() + variableScope.slice(1)} Variable
					</label>
					<select
						onChange={(e) => handleSelectVariable(e.target.value)}
						className="select select-bordered w-full"
					>
						<option value="">Select a variable</option>
						{variables[variableScope].map((variable, index) => (
							<option key={index} value={variable.name}>
								{variable.name}
							</option>
						))}
					</select>
				</div>
			</div>
		);
	};

	return (
		<div
			className={`relative bg-white dark:bg-gray-800 rounded border-2 p-4 ${nodeHidden ? "hidden" : ""}`}
			onMouseEnter={() => setShowRemoveButton(true)}
			onMouseLeave={() => setShowRemoveButton(false)}
		>
			{showRemoveButton && (
				<button
					className="absolute right-0 top-0 m-1 rounded bg-red-500 p-1 text-xs text-white"
					onClick={removeNode}
				>
					<Trash2 size={16} />
				</button>
			)}
			<Handle
				type="target"
				position={Position.Top}
				className="bg-green-500 h-4 w-4"
				isConnectable={isConnectable}
			/>
			<input
				type="text"
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				className="w-full dark:bg-gray-800 rounded border p-2"
			/>
			<div className="mt-4 flex justify-between">
				<div className="relative flex flex-1 flex-col items-center">
					<button className="w-full rounded border p-2" onClick={showModal}>
						<ExternalLink size={16} />
					</button>
				</div>
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				className="h-4 w-4 bg-blue-500"
				isConnectable={isConnectable}
			/>
		</div>
	);
};

export default FunctionNode;
