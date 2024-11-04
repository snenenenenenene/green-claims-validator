// components/dashboard/DashboardFooter.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, GitCommit, ChevronUp, Loader2 } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { toast } from 'react-hot-toast';

export default function DashboardFooter() {
	const { chartStore, commitStore, utilityStore } = useStores();
	const [isExpanded, setIsExpanded] = useState(false);
	const [commitMessage, setCommitMessage] = useState('');
	const [commitType, setCommitType] = useState<'local' | 'global'>('local');
	const [isSaving, setIsSaving] = useState(false);

	const handleCommitAndSave = async () => {
		if (!commitMessage.trim()) {
			toast.error('Please enter a commit message');
			return;
		}

		setIsSaving(true);
		try {
			// Add commit
			if (commitType === 'local') {
				commitStore.addLocalCommit(commitMessage);
			} else {
				commitStore.addGlobalCommit(commitMessage);
			}

			// Save to DB
			await utilityStore.saveToDb(chartStore.chartInstances);

			toast.success('Changes saved successfully');
			setCommitMessage('');
			setIsExpanded(false);
		} catch (error) {
			toast.error('Failed to save changes');
			console.error('Save error:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleQuickSave = async () => {
		setIsSaving(true);
		try {
			await utilityStore.saveToDb(chartStore.chartInstances);
			toast.success('Changes saved successfully');
		} catch (error) {
			toast.error('Failed to save changes');
			console.error('Save error:', error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<motion.div
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			className="fixed bottom-0 left-0 right-0 z-50"
		>
			{/* Expanded Commit Panel */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="bg-white border-t border-gray-200 shadow-lg"
					>
						<div className="container mx-auto max-w-3xl p-4 space-y-4">
							{/* Commit Message Input */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Commit Message
								</label>
								<input
									type="text"
									value={commitMessage}
									onChange={(e) => setCommitMessage(e.target.value)}
									placeholder="Describe your changes..."
									className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							{/* Commit Type Selection */}
							<div className="flex items-center gap-2">
								<button
									onClick={() => setCommitType('local')}
									className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${commitType === 'local'
											? 'bg-blue-100 text-blue-700'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
										}`}
								>
									Local Commit
								</button>
								<button
									onClick={() => setCommitType('global')}
									className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${commitType === 'global'
											? 'bg-blue-100 text-blue-700'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
										}`}
								>
									Global Commit
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Footer Bar */}
			<div className="bg-white border-t border-gray-200 shadow-lg">
				<div className="container mx-auto max-w-3xl p-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{/* Toggle Expand Button */}
							<button
								onClick={() => setIsExpanded(!isExpanded)}
								className="p-2 text-gray-600 hover:text-gray-900"
								aria-label={isExpanded ? "Collapse commit panel" : "Expand commit panel"}
							>
								<ChevronUp
									className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""
										}`}
								/>
							</button>

							{/* Quick Save Button */}
							<button
								onClick={handleQuickSave}
								disabled={isSaving}
								className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
							>
								{isSaving ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								Quick Save
							</button>
						</div>

						{/* Commit and Save Button */}
						<button
							onClick={handleCommitAndSave}
							disabled={isSaving || !commitMessage.trim()}
							className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<GitCommit className="h-4 w-4" />
							)}
							Commit & Save
						</button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}