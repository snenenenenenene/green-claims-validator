// app/admin/claims/page.tsx
"use client";
import ClaimsReviewList from "@/components/claims/ClaimsReviewList";
import { CheckCircle, Clock, FileText, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {LoadingSpinner} from "@/components/ui/base"

interface AdminClaim {
	id: string;
	claim: string;
	status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
	createdAt: string;
	updatedAt: string;
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
	user: {
		id: string;
		name: string;
		email: string;
		image?: string;
	};
}

export default function AdminClaimsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [claims, setClaims] = useState<AdminClaim[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchClaims = async () => {
			try {
				const response = await fetch('/api/admin/claims');
				const data = await response.json();

				if (!response.ok) throw new Error(data.error);

				setClaims(data.claims);
			} catch (error) {
				console.error('Failed to fetch claims:', error);
				toast.error('Failed to load claims');
			} finally {
				setLoading(false);
			}
		};

		if (session?.user?.role === 'ADMIN') {
			fetchClaims();
		}
	}, [session]);

	const handleDocumentReview = async (documentId: string, status: 'APPROVED' | 'REJECTED', note?: string) => {
		try {
			const response = await fetch(`/api/documents/${documentId}/review`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status, note })
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.error);

			// Update local state
			setClaims(prevClaims =>
				prevClaims.map(claim => ({
					...claim,
					documents: claim.documents.map(doc =>
						doc.id === documentId
							? { ...doc, status, reviewNote: note }
							: doc
					)
				}))
			);

			toast.success(`Document ${status.toLowerCase()} successfully`);
		} catch (error) {
			console.error('Failed to review document:', error);
			toast.error('Failed to update document status');
		}
	};

	if (status === "loading" || loading) {
		return <LoadingSpinner />;
	}

	if (status === "authenticated" && session?.user?.role !== "ADMIN") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center space-y-4">
					<p className="text-red-500 font-medium">Access denied</p>
					<p className="text-gray-600">You must be an admin to view this page.</p>
					<button
						onClick={() => router.push('/')}
						className="text-blue-500 hover:text-blue-600"
					>
						Return to home
					</button>
				</div>
			</div>
		);
	}

	const totalClaims = claims.length;
	const totalDocuments = claims.reduce((acc, claim) => acc + claim.documents.length, 0);
	const pendingReviews = claims.reduce(
		(acc, claim) => acc + claim.documents.filter(doc => doc.status === 'PENDING').length,
		0
	);
	const completedReviews = claims.reduce(
		(acc, claim) => acc + claim.documents.filter(doc => doc.status !== 'PENDING').length,
		0
	);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Claims Review Dashboard</h1>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-blue-50 rounded-lg">
							<FileText className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Total Claims</p>
							<p className="text-2xl font-bold text-gray-900">{totalClaims}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-violet-50 rounded-lg">
							<Users className="h-6 w-6 text-violet-600" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Total Documents</p>
							<p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-yellow-50 rounded-lg">
							<Clock className="h-6 w-6 text-yellow-600" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Pending Reviews</p>
							<p className="text-2xl font-bold text-gray-900">{pendingReviews}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-green-50 rounded-lg">
							<CheckCircle className="h-6 w-6 text-green-600" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Completed Reviews</p>
							<p className="text-2xl font-bold text-gray-900">{completedReviews}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Claims List */}
			<ClaimsReviewList
				claims={claims}
				isAdmin={true}
				onReviewDocument={handleDocumentReview}
			/>
		</div>
	);
}