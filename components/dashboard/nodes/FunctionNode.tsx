// components/dashboard/nodes/FunctionNode.tsx
import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
	Function as FunctionIcon,
	Plus,
	ChevronDown,
	ChevronRight,
	Code,
	Variable
} from 'lucide-react';
import { FunctionNodeData, FunctionNodeSequence } from '@/types/nodes';
import BaseNode from './BaseNode';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';

const FunctionNode = ({ id, data, selected }: NodeProps<FunctionNodeData>) => {
	const { chartStore } = useStores();
	const [isExpanded, setIsExpanded] = useState(false);

	const handleScopeChange = useCallback((scope: 'local' | 'global') => {
		chartStore.updateNodeData(data.instanceId, id, {
			...data,
			variableScope: scope,
		});
	}, [chartStore, data, id]);

	const handleVariableSelect = useCallback((variable: string) => {
		chartStore.updateNodeData(data.instanceId, id, {
			...data,
			selectedVariable: variable,
		});
	}, [chartStore, data, id]);

	const handleAddSequence = useCallback((type: FunctionNodeSequence['type']) => {
		const newSequence: FunctionNodeSequence = {
			type,
			value: 0,
			condition: type === 'if' ? '==' : undefined,
			variable: data.selectedVariable,
			children: type === 'if' ? [] : undefined,
		};

		chartStore.updateNodeData(data.instanceId, id, {
			...data,
			sequences: [...data.sequences, newSequence],
		});
	}, [chartStore, data, id]);

	const handleDelete = useCallback(() => {
		if (window.confirm('Are you sure you want to delete this function node?')) {
			chartStore.removeNode(data.instanceId, id);
		}
	}, [chartStore, data.instanceId, id]);

	return (
		<BaseNode
			title="Function"
			onDelete={handleDelete}
			selected={selected}
			handles={false}
			headerClassName="bg-violet-50/50"
		>
			<div className="space-y-4">
				<Handle
					type="target"
					position={Position.Top}
					className={cn(
						"w-3 h-3 bg-violet-500 border-2 border-white",
						"transition-all duration-200",
						"hover:bg-violet-600 hover:scale-110"
					)}
				/>

				<div className="space-y-4">
					{/* Scope Selection */}
					<div className="flex gap-2">
						<button
							onClick={() => handleScopeChange('local')}
							className={cn(
								"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
								data.variableScope === 'local'
									? "bg-violet-100 text-violet-700"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							)}
						>
							<Variable className="h-4 w-4" />
							Local
						</button>
						<button
							onClick={() => handleScopeChange('global')}
							className={cn(
								"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
								data.variableScope === 'global'
									? "bg-violet-100 text-violet-700"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							)}
						>
							<Code className="h-4 w-4" />
							Global
						</button>
					</div>

					{/* Variable Selection */}
					{/* Implementation depends on your variable management system */}

					{/* Sequences */}
					<div className="space-y-2">
						{data.sequences.map((sequence, index) => (
							<div
								key={index}
								className="border border-gray-200 rounded-lg p-2"
							>
								{/* Sequence implementation */}
							</div>
						))}

						{/* Add Sequence Button */}
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
						>
							<Plus className="h-4 w-4" />
							Add Operation
							{isExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</button>

						{isExpanded && (
							<div className="p-2 space-y-1">
								<button
									onClick={() => handleAddSequence('if')}
									className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
								>
									Add Condition
								</button>
								<button
									onClick={() => handleAddSequence('addition')}
									className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
								>
									Add Addition
								</button>
								<button
									onClick={() => handleAddSequence('subtraction')}
									className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
								>
									Add Subtraction
								</button>
								{/* Add more operations as needed */}
							</div>
						)}
					</div>
				</div>

				{/* Output Handles */}
				{data.handles.map((handle) => (
					<Handle
						key={handle}
						type="source"
						position={Position.Bottom}
						id={handle}
						className={cn(
							"w-3 h-3 bg-violet-500 border-2 border-white",
							"transition-all duration-200",
							"hover:bg-violet-600 hover:scale-110"
						)}
						style={{
							left: `${((data.handles.indexOf(handle) + 1) / (data.handles.length + 1)) * 100}%`,
						}}
					/>
				))}
			</div>
		</BaseNode>
	);
};

export default memo(FunctionNode);