// app/claims/layout.tsx
"use client";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const Breadcrumbs = () => {
	const pathname = usePathname();
	const router = useRouter();

	const getBreadcrumbs = () => {
		const paths = pathname.split('/').filter(Boolean);
		let breadcrumbs: any = [];
		let currentPath = '';

		paths.forEach((path, index) => {
			currentPath += `/${path}`;
			const isClaimId = path.length === 24; // Assuming MongoDB ObjectId length

			let label = path;
			if (path === 'claims') label = 'Claims';
			else if (path === 'questionnaire') label = 'Questionnaire';
			else if (path === 'results') label = 'Results';
			else if (isClaimId) label = 'Claim Details';

			breadcrumbs.push({
				label,
				path: currentPath,
				isLast: index === paths.length - 1
			});
		});

		return breadcrumbs;
	};

	return (
		<nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8 bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-sm">
			<button
				onClick={() => router.push('/')}
				className="hover:text-gray-700 flex items-center"
			>
				<Home className="h-4 w-4" />
			</button>
			<ChevronRight className="h-4 w-4" />
			{getBreadcrumbs().map((breadcrumb: any, index) => (
				<div key={breadcrumb.path} className="flex items-center">
					{index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
					{breadcrumb.isLast ? (
						<span className="text-gray-900 font-medium">{breadcrumb.label}</span>
					) : (
						<button
							onClick={() => router.push(breadcrumb.path)}
							className="hover:text-gray-700"
						>
							{breadcrumb.label}
						</button>
					)}
				</div>
			))}
		</nav>
	);
};

export default function ClaimsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="h-full flex flex-col overflow-scroll">
			<div className="relative z-10 h-full w-full container mx-auto px-4 py-8">
				<Breadcrumbs />
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="h-full w-full"
				>
					{children}
				</motion.div>
			</div>
		</div>
	);
}