"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle, ClipboardCheck, Clock, ChevronRight, BarChart } from "lucide-react";

interface Claim {
	id: string;
	claim: string;
	createdAt: string;
	status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
	progress?: number;
}

export default function ClaimPage() {
	const params = useParams();
	const router = useRouter();
	const [claim, setClaim] = useState<Claim | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchClaim = async () => {
			try {
				const response = await fetch(`/api/claims/${params.claimId}`);
				const data = await response.json();
				setClaim(data.claim);
			} catch (error) {
				console.error('Error:', error);
			} finally {
				setLoading(false);
			}
		};

		if (params.claimId) {
			fetchClaim();
		}
	}, [params.claimId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	console.log(claim)

	if (!claim) {
		return <div>Claim not found</div>;
	}

	const handleContinue = () => {
		router.push(`/claims/${params.claimId}/questionnaire`);
	};

	const handleViewResults = () => {
		router.push(`/claims/${params.claimId}/results`);
	};

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

					{/* Action Buttons */}
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
				</div>
			</div>
		</motion.div>
	);
}