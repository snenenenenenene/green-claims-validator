// components/admin/ChartImportSection.tsx
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileJson } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function ChartImportSection() {
	const [isUploading, setIsUploading] = useState(false);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setIsUploading(true);
			const content = await file.text();
			const data = JSON.parse(content);

			const response = await fetch('/api/admin/import-chart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: data }),
			});

			if (!response.ok) throw new Error('Failed to import chart');

			toast.success('Chart imported successfully');
		} catch (error) {
			console.error('Import error:', error);
			toast.error('Failed to import chart');
		} finally {
			setIsUploading(false);
		}
	};

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

			<div className="p-6">
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
						<input
							type="file"
							className="hidden"
							accept="application/json"
							onChange={handleFileUpload}
							disabled={isUploading}
						/>
					</div>
				</label>
			</div>
		</motion.div>
	);
}