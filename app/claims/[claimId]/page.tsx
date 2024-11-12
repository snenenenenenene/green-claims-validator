"use client";
import DocumentGrid from "@/components/document/DocumentGrid";
import { DocumentUpload } from "@/components/document/DocumentUpload";
import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
	BarChart,
	ChevronRight,
	ClipboardCheck,
	Clock,
	PlayCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Claim {
	id: string;
	claim: string;
	createdAt: string;
	status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
	progress?: number;
	documents: Array<{
		id: string;
		name: string;
		type: string;
		size: number;
		status: 'PENDING' | 'APPROVED' | 'REJECTED';
		createdAt: string;
		reviewNote?: string;
		reviewedBy?: {
			name: string;
			email: string;
		};
	}>;
}

export default function ClaimPage() {
	const params = useParams();
	const router = useRouter();
	const [claim, setClaim] = useState<Claim | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		const fetchClaim = async () => {
			try {
				const response = await fetch(`/api/claims/${params.claimId}`);
				const data = await response.json();
				setClaim(data.claim);
			} catch (error) {
				console.error('Error:', error);
				toast.error('Failed to load claim');
			} finally {
				setLoading(false);
			}
		};

		if (params.claimId) {
			fetchClaim();
		}
	}, [params.claimId]);

	const handleUploadComplete = async (document: any) => {
		try {
			// Refetch claim to get updated documents
			const response = await fetch(`/api/claims/${params.claimId}`);
			const data = await response.json();
			setClaim(data.claim);
			toast.success('Document uploaded successfully');
		} catch (error) {
			console.error('Error refreshing claim:', error);
		}
	};

	const handleContinue = () => {
		router.push(`/claims/${params.claimId}/questionnaire`);
	};

	const handleViewResults = () => {
		router.push(`/claims/${params.claimId}/results`);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (!claim) {
		return <div>Claim not found</div>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="max-w-4xl mx-auto px-4 py-8"
		>
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
				{/* Header */}
				<div className="p-6 border-b border-gray-200">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">{claim.claim}</h1>
					<p className="text-sm text-gray-500">
						Created on {new Date(claim.createdAt).toLocaleDateString()}
					</p>
				</div>

				<div className="p-6 space-y-6">
					{/* Status Card */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
						<div className="flex items-center gap-3">
							{claim.status === 'COMPLETED' ? (
								<ClipboardCheck className="h-6 w-6 text-green-500" />
							) : claim.status === 'IN_PROGRESS' ? (
								<Clock className="h-6 w-6 text-blue-500" />
							) : (
								<PlayCircle className="h-6 w-6 text-gray-500" />
							)}
							<div>
								<h3 className="font-medium text-gray-900">Status</h3>
								<p className="text-sm text-gray-500">
									{claim.status === 'COMPLETED' ? 'Completed' :
										claim.status === 'IN_PROGRESS' ? 'In Progress' :
											'Not Started'}
								</p>
							</div>
						</div>
						{claim.progress !== undefined && claim.status === 'IN_PROGRESS' && (
							<div className="text-right">
								<div className="text-sm font-medium text-gray-900">{claim.progress}%</div>
								<div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
									<div
										className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
										style={{ width: `${claim.progress}%` }}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Custom Tabs */}
					<div>
						<div className="flex space-x-1 border-b border-gray-200">
							<button
								onClick={() => setActiveTab(0)}
								className={cn(
									"px-4 py-2.5 text-sm font-medium leading-5 text-gray-700",
									"focus:outline-none",
									activeTab === 0
										? "border-b-2 border-blue-500"
										: "hover:text-gray-900 hover:border-gray-300"
								)}
							>
								Questionnaire
							</button>
							<button
								onClick={() => setActiveTab(1)}
								className={cn(
									"px-4 py-2.5 text-sm font-medium leading-5 text-gray-700",
									"focus:outline-none",
									activeTab === 1
										? "border-b-2 border-blue-500"
										: "hover:text-gray-900 hover:border-gray-300"
								)}
							>
								Supporting Documents
							</button>
						</div>
						<div className="mt-4">
							{activeTab === 0 && (
								<div className="space-y-3">
									{claim.status === 'COMPLETED' ? (
										<>
											<motion.button
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
												onClick={handleViewResults}
												className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 font-medium"
											>
												<BarChart className="h-5 w-5" />
												View Results
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
												onClick={handleContinue}
												className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 font-medium"
											>
												<PlayCircle className="h-5 w-5" />
												Retake Questionnaire
											</motion.button>
										</>
									) : (
										<motion.button
											whileHover={{ scale: 1.01 }}
											whileTap={{ scale: 0.99 }}
											onClick={handleContinue}
											className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 font-medium"
										>
											{claim.status === 'IN_PROGRESS' ? (
												<>
													<Clock className="h-5 w-5" />
													Continue Questionnaire
												</>
											) : (
												<>
													<PlayCircle className="h-5 w-5" />
													Start Questionnaire
												</>
											)}
											<ChevronRight className="h-5 w-5" />
										</motion.button>
									)}
								</div>
							)}
							{activeTab === 1 && (
								<div className="space-y-6">
									{/* Document Upload */}
									<div className="bg-gray-50 rounded-xl p-6">
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Upload Supporting Documents
										</h3>
										<DocumentUpload
											claimId={claim.id}
											onUploadComplete={handleUploadComplete}
										/>
									</div>

									{/* Document List */}
									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Uploaded Documents
										</h3>
										<DocumentGrid documents={claim.documents || []} />
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}