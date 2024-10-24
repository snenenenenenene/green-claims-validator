import React, { useState, useEffect } from 'react';
import { useStores } from "@/hooks/useStores";
import { ChartInstance } from "@/types";
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default SettingsModal;