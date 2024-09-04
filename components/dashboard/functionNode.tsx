import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import useStore from "@/lib/store";

const FunctionNode = ({ id, data, isConnectable }: NodeProps) => {
	const [label, setLabel] = useState(data?.label || "Function Node");
	const [nodeHidden, setNodeHidden] = useState(data?.hidden || false);
	const [showRemoveButton, setShowRemoveButton] = useState(false);
	const [variableScope, setVariableScope] = useState<"local" | "global">("local");
	const [selectedVariable, setSelectedVariable] = useState("");
	const [sequences, setSequences] = useState<
		Array<{ type: string; value?: number; condition?: string; variable: string; handleId?: string; children?: any[] }>
	>([]);
	const [handles, setHandles] = useState<string[]>(["default"]);
	const [currentOperation, setCurrentOperation] = useState("");
	const [currentValue, setCurrentValue] = useState<number | string>("");
	const [currentCondition, setCurrentCondition] = useState("");
	const [currentConditionValue, setCurrentConditionValue] = useState<number | string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const variables = useStore((state) => state.variables);

	// Function to log the full sequence
	const logCurrentState = (action: string) => {
		console.log(`Action: ${action}`);
		console.log("Full Sequences State: ", JSON.stringify(sequences, null, 2));
		console.log("Handles: ", handles);
	};

	const handleSelectVariable = (variableName: string) => {
		setSelectedVariable(variableName);
		logCurrentState(`Selected variable: ${variableName}`);
	};

	// Add operations and rules
	const addOperation = (parentIndex = null) => {
		if (currentOperation && currentValue !== "" && selectedVariable) {
			const newOperation = { type: currentOperation, value: Number(currentValue), variable: selectedVariable };

			if (parentIndex !== null) {
				setSequences((prevSequences) => {
					const newSequences = [...prevSequences];
					newSequences[parentIndex].children.push(newOperation);
					return newSequences;
				});
			} else {
				setSequences((prevSequences) => [...prevSequences, newOperation]);
			}

			logCurrentState(`Added ${currentOperation} operation with value: ${currentValue}`);
			setCurrentOperation("");
			setCurrentValue("");
		}
	};

	const addRule = () => {
		if (currentCondition && currentConditionValue !== "" && selectedVariable) {
			setSequences((prevSequences) => [
				...prevSequences,
				{ type: "if", condition: currentCondition, value: Number(currentConditionValue), variable: selectedVariable, handleId: "default", children: [] },
			]);
			logCurrentState(`Added if rule: ${currentCondition} ${currentConditionValue} with handle: default`);
			setCurrentCondition("");
			setCurrentConditionValue("");
		}
	};

	const addElse = (ifIndex) => {
		setSequences((prevSequences) => {
			const newSequences = [...prevSequences];
			const ifBlock = newSequences[ifIndex];

			if (ifBlock.children.find((child) => child.type === "else")) {
				return prevSequences; // Do nothing if an else block already exists
			}

			ifBlock.children.push({ type: "else", variable: selectedVariable, handleId: "default", children: [] });
			logCurrentState(`Added else block at index: ${ifIndex} with handle: default`);
			return newSequences;
		});
	};

	// Update the selected handle for if or else block
	const updateHandleForBlock = (parentIndex, handleId, blockType = "if") => {
		setSequences((prevSequences) => {
			const newSequences = [...prevSequences];
			const block = newSequences[parentIndex].children.find((child) => child.type === blockType);

			if (block) {
				block.handleId = handleId;
			} else {
				// Update the handleId of the main block if no child found
				newSequences[parentIndex].handleId = handleId;
			}

			logCurrentState(`Updated ${blockType} handle to: ${handleId} at index: ${parentIndex}`);
			return newSequences;
		});
	};

	const addHandleToNode = () => {
		const newHandleId = `handle-${handles.length}`;
		setHandles((prevHandles) => [...prevHandles, newHandleId]); // Add a handle only to the node itself
		logCurrentState(`Added new handle: ${newHandleId}`);
	};

	const removeHandle = (handleId: string) => {
		setHandles((prevHandles) => prevHandles.filter((id) => id !== handleId));
		setSequences((prevSequences) =>
			prevSequences.filter((seq) => seq.handleId !== handleId)
		);
		logCurrentState(`Removed handle: ${handleId}`);
	};

	const removeSequence = (index: number, parentIndex = null) => {
		if (parentIndex !== null) {
			setSequences((prevSequences) => {
				const newSequences = [...prevSequences];
				newSequences[parentIndex].children = newSequences[parentIndex].children.filter((_, i) => i !== index);
				return newSequences;
			});
		} else {
			setSequences((prevSequences) => prevSequences.filter((_, i) => i !== index));
		}
		logCurrentState(`Removed sequence at index: ${index} (parent: ${parentIndex})`);
	};

	const removeNode = () => {
		logCurrentState(`Removed node: ${id}`);
	};

	const openModal = () => {
		setIsModalOpen(true);
		logCurrentState("Opened modal");
	};

	const closeModal = () => {
		setIsModalOpen(false);
		logCurrentState("Closed modal");
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
					{/* Render "Go to handle" for if or else block */}
					{seq.type === "if" || seq.type === "else" ? (
						<div className="flex space-x-2 mt-2">
							<select
								className="select select-bordered w-1/2"
								value={seq.handleId} // Set the value of the selected handle
								onChange={(e) => updateHandleForBlock(parentIndex !== null ? parentIndex : index, e.target.value, seq.type)}
							>
								{handles.map((handleId) => (
									<option key={handleId} value={handleId}>
										{handleId}
									</option>
								))}
							</select>
						</div>
					) : null}
					{seq.type === "if" || seq.type === "else" ? (
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
					) : null}
				</div>
			);
		});
	};

	return (
		<>
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
						<button className="w-full rounded border p-2" onClick={openModal}>
							Configure Function
						</button>
					</div>
				</div>
				{handles.map((handleId) => (
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
			</div>

			{isModalOpen &&
				createPortal(
					<dialog open className="modal modal-open">
						<div className="modal-box">
							<h3 className="text-lg font-bold">Configure Function</h3>
							<div className="mt-4">
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
										value={selectedVariable}
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
										{renderIndentedSequences(sequences)}
									</div>
								</div>

								<div className="modal-action">
									<button className="btn" onClick={closeModal}>
										Close
									</button>
								</div>
							</div>
							<form method="dialog" className="modal-backdrop" onClick={closeModal}>
								<button type="button">Close</button>
							</form>
						</div>
					</dialog>,
					document.body // Render the modal at the root of the document
				)}
		</>
	);
};

export default FunctionNode;
