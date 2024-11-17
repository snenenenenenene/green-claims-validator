// components/admin/ChartManagement.tsx
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { validateChartStructure } from "@/lib/validate-chart";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Check,
	Download,
	FileJson,
	Trash2,
	X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface GcvChart {
	id: string;
	name: string;
	content: string;
	version: number;
	isActive: boolean;
	createdAt: string;
}

export function ChartManagement() {
	const [charts, setCharts] = useState<GcvChart[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	useEffect(() => {
		fetchCharts();
	}, []);

	const fetchCharts = async () => {
		try {
			const response = await fetch('/api/gcv/charts');
			if (!response.ok) throw new Error('Failed to fetch charts');
			const data = await response.json();
			setCharts(data.charts);
		} catch (error) {
			console.error('Error fetching charts:', error);
			toast.error('Failed to load charts');
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setIsUploading(true);
			const content = await file.text();
			const data = JSON.parse(content);

			// Validate chart structure
			const validation = validateChartStructure(data);
			if (!validation.isValid) {
				toast.error(validation.error || 'Invalid chart structure');
				return;
			}

			const response = await fetch('/api/gcv/charts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: data,
					isActive: false // New imports are always inactive
				}),
			});

			if (!response.ok) throw new Error('Failed to import chart');

			toast.success('Chart imported successfully');
			fetchCharts();
		} catch (error) {
			console.error('Import error:', error);
			toast.error('Failed to import chart');
		} finally {
			setIsUploading(false);
			if (e.target) e.target.value = ''; // Reset file input
		}
	};

	const handleChartAction = async (chartId: string, action: 'activate' | 'deactivate') => {
		try {
			const response = await fetch('/api/gcv/manage-chart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chartId, action }),
			});

			if (!response.ok) throw new Error('Failed to manage chart');

			toast.success(`Chart ${action}d successfully`);
			fetchCharts();
		} catch (error) {
			console.error('Chart management error:', error);
			toast.error('Failed to manage chart');
		}
	};

	const handleDeleteChart = async (chartId: string) => {
		try {
			// Check if trying to delete the active chart
			const chart = charts.find(c => c.id === chartId);
			if (chart?.isActive) {
				toast.error("Cannot delete active chart. Deactivate it first.");
				setDeleteConfirm(null);
				return;
			}

			const response = await fetch(`/api/gcv/charts/${chartId}`, {
				method: 'DELETE',
			});

			if (!response.ok) throw new Error('Failed to delete chart');

			toast.success('Chart deleted successfully');
			setDeleteConfirm(null);
			fetchCharts();
		} catch (error) {
			console.error('Delete error:', error);
			toast.error('Failed to delete chart');
		}
	};

	const handleDownloadChart = (chart: GcvChart) => {
		try {
			const content = JSON.parse(chart.content);
			const blob = new Blob([JSON.stringify(content, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${chart.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download error:', error);
			toast.error('Failed to download chart');
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
		>
			<div className="p-6 border-b border-gray-200">
				<h2 className="text-lg font-semibold text-gray-900">Chart Management</h2>
				<p className="text-sm text-gray-500">Import and manage questionnaire charts</p>
			</div>

			<div className="p-6 space-y-6">
				<label className="block">
					<div className={cn(
						"border-2 border-dashed rounded-xl p-8 text-center transition-colors",
						"hover:border-blue-400 cursor-pointer",
						isUploading ? "opacity-50" : "border-gray-300"
					)}>
						<FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-sm text-gray-600 mb-2">
							{isUploading ? "Uploading..." : "Click to upload chart JSON"}
						</p>
						<p className="text-xs text-gray-500">
							New charts will be imported as inactive
						</p>
						<input
							type="file"
							className="hidden"
							accept="application/json"
							onChange={handleFileUpload}
							disabled={isUploading}
						/>
					</div>
				</label>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-gray-700">Imported Charts</h3>
						{charts.length > 0 && (
							<span className="text-xs text-gray-500">
								{charts.filter(c => c.isActive).length}/1 Active
							</span>
						)}
					</div>

					{charts.length === 0 ? (
						<div className="text-center py-12 bg-gray-50 rounded-lg">
							<AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
							<p className="text-sm text-gray-600">No charts imported yet</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{charts.map((chart) => (
								<div key={chart.id} className="py-4 flex items-center justify-between">
									<div>
										<h4 className="text-sm font-medium text-gray-900">{chart.name}</h4>
										<p className="text-sm text-gray-500">
											Version {chart.version} • Imported {new Date(chart.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => handleDownloadChart(chart)}
											className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
										>
											<Download className="h-4 w-4" />
											Download
										</button>

										{chart.isActive ? (
											<button
												onClick={() => handleChartAction(chart.id, 'deactivate')}
												className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
											>
												<Check className="h-4 w-4" />
												Active
											</button>
										) : (
											<button
												onClick={() => handleChartAction(chart.id, 'activate')}
												className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
											>
												<X className="h-4 w-4" />
												Inactive
											</button>
										)}

										<AnimatePresence mode="wait">
											{deleteConfirm === chart.id ? (
												<motion.div
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: 20 }}
													className="flex items-center gap-2"
												>
													<button
														onClick={() => handleDeleteChart(chart.id)}
														className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
													>
														Confirm
													</button>
													<button
														onClick={() => setDeleteConfirm(null)}
														className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
													>
														Cancel
													</button>
												</motion.div>
											) : (
												<motion.button
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													onClick={() => setDeleteConfirm(chart.id)}
													disabled={chart.isActive}
													className={cn(
														"flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
														chart.isActive
															? "text-gray-400 bg-gray-50 cursor-not-allowed"
															: "text-red-600 bg-red-50 hover:bg-red-100"
													)}
													title={chart.isActive ? "Deactivate chart before deleting" : "Delete chart"}
												>
													<Trash2 className="h-4 w-4" />
													Delete
												</motion.button>
											)}
										</AnimatePresence>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}