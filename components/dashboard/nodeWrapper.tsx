import React, { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useStores } from '@/hooks/useStores';

interface NodeWrapperProps {
	id: string;
	children: React.ReactNode;
	hidden?: boolean;
	style?: React.CSSProperties;
}

const NodeWrapper: React.FC<NodeWrapperProps> = ({ id, children, hidden = false, style = {} }) => {
	const [showRemoveButton, setShowRemoveButton] = useState(false);
	const { setNodes, setEdges } = useReactFlow();
	const { chartStore, utilityStore } = useStores();

	const handleRemoveClick = useCallback(() => {
		if (confirm("Are you sure you want to delete this node?")) {
			const currentTab = utilityStore.currentTab;
			chartStore.removeNode(currentTab, id);

			// Update React Flow's state
			setNodes((nodes) => nodes.filter((node) => node.id !== id));
			setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
		}
	}, [id, chartStore, utilityStore.currentTab, setNodes, setEdges]);

	return (
		<div
			className={`relative bg-white rounded border-2 dark:bg-gray-800 p-4 ${hidden ? 'hidden' : ''}`}
			style={style}
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
			{children}
		</div>
	);
};

export default NodeWrapper;