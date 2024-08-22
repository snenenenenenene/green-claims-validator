import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import useStore from "@/lib/store";
import { Trash2 } from "lucide-react";

const WeightNode = ({ id, data, isConnectable }) => {
	const [weight, setWeight] = useState(data.weight || 1);
	const [showRemoveButton, setShowRemoveButton] = useState(false);

	const { removeNode } = useStore((state) => ({
		removeNode: state.removeNode,
	}));
	const currentTab = useStore((state) => state.currentDashboardTab);
	const { getEdges, setNodes, setEdges } = useReactFlow();

	useEffect(() => {
		data.weight = weight;
	}, [weight, data]);

	const handleRemoveClick = () => {
		const edges = getEdges().filter(
			(edge) => edge.source === id || edge.target === id,
		);
		if (edges.length > 0) {
			if (confirm("Are you sure you want to delete this node?")) {
				removeNode(currentTab, id);
				setNodes((nds) => nds.filter((node) => node.id !== id));
				setEdges((eds) =>
					eds.filter((edge) => edge.source !== id && edge.target !== id),
				);
			}
		} else {
			removeNode(currentTab, id);
			setNodes((nds) => nds.filter((node) => node.id !== id));
			setEdges((eds) =>
				eds.filter((edge) => edge.source !== id && edge.target !== id),
			);
		}
	};

	return (
		<div
			className="relative bg-white dark:bg-gray-800 border border-gray-300 rounded p-2 text-center"
			onMouseEnter={() => setShowRemoveButton(true)}
			onMouseLeave={() => setShowRemoveButton(false)}
		>
			{showRemoveButton && (
				<button
					className="absolute right-0 top-0 m-1 rounded bg-red-500 p-1 text-xs text-white"
					onClick={handleRemoveClick}
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
			<div>
				<label className="block">Weight:</label>
				<input
					type="number"
					value={weight}
					onChange={(e) => setWeight(Number(e.target.value))}
					className="nodrag w-full dark:bg-gray-800"
					step="0.1"
					min="0"
				/>
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				className="bg-blue-500 h-4 w-4"
				isConnectable={isConnectable}
			/>
		</div>
	);
};

export default WeightNode;
