"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { AlertTriangle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const { chartStore } = useStores();
	const router = useRouter();

	useEffect(() => {
		// Get the first chart instance
		const firstInstance = chartStore.chartInstances[0];

		if (firstInstance) {
			router.push(`/dashboard/${firstInstance.id}`);
		}
	}, [chartStore.chartInstances, router]);

	// Show loading state while redirecting
	if (chartStore.chartInstances.length > 0) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<LoadingSpinner />
					<p className="mt-4 text-gray-600">Redirecting to flow editor...</p>
				</div>
			</div>
		);
	}

	// Show empty state if no instances exist
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center max-w-md mx-auto p-6">
				<AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					No Flows Found
				</h2>
				<p className="text-gray-600 mb-6">
					Create your first flow to get started with the visual editor.
				</p>
				<button
					onClick={() => {
						// Create a new instance logic here
						// After creation, it will auto-redirect due to the useEffect
						const newInstance = chartStore.createNewChartInstance();
						router.push(`/dashboard/${newInstance.id}`);
					}}
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
				>
					<Plus className="h-4 w-4" />
					Create New Flow
				</button>
			</div>
		</div>
	);
}