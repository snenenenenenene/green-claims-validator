import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

const WeightNode = ({ id, data, isConnectable }) => {
	const [weight, setWeight] = useState(data.weight || 1);

	useEffect(() => {
		data.weight = weight;
	}, [weight, data]);

	return (
		<div className="bg-gray-100 border border-gray-300 rounded p-2 text-center">
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
					className="nodrag w-full"
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
