// app/payments/page.tsx
"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CreditCard, History, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import getStripe from '@/lib/stripe-helper';
import toast from 'react-hot-toast';

interface Payment {
	id: string;
	amount: number;
	currency: string;
	status: string;
	creditAmount: number;
	createdAt: string;
}

interface PricingTier {
	credits: number;
	price: number;
	description: string;
	featured?: boolean;
}

const pricingTiers: PricingTier[] = [
	{
		credits: 50,
		price: 5,
		description: "Perfect for small businesses starting their green journey",
	},
	{
		credits: 150,
		price: 12,
		description: "Most popular for growing companies",
		featured: true,
	},
	{
		credits: 500,
		price: 35,
		description: "Best value for established enterprises",
	},
];

export default function PaymentsPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'pricing' | 'history'>('pricing');
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(false);
	const [processingPayment, setProcessingPayment] = useState(false);

	useEffect(() => {
		if (session?.user?.email) {
			fetchPaymentHistory();
		}
	}, [session]);

	const fetchPaymentHistory = async () => {
		try {
			const response = await fetch('/api/payments/history');
			const data = await response.json();
			setPayments(data.payments);
		} catch (error) {
			console.error('Error fetching payment history:', error);
			toast.error('Failed to load payment history');
		}
	};

	const handlePurchase = async (tier: PricingTier) => {
		if (!session) {
			toast.error('Please sign in to purchase credits');
			return;
		}

		setProcessingPayment(true);
		try {
			const stripe = await getStripe();
			const response = await fetch('/api/checkout_sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount: tier.price,
					creditAmount: tier.credits,
				}),
			});

			const data = await response.json();
			if (data.statusCode === 500) {
				console.error('Error:', data.message);
				toast.error('Error creating checkout session');
				return;
			}

			const result = await stripe?.redirectToCheckout({
				sessionId: data.id,
			});

			if (result?.error) {
				toast.error(result.error.message!);
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error processing payment');
		} finally {
			setProcessingPayment(false);
		}
	};

	const formatCurrency = (amount: number, currency: string = 'EUR') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto max-w-6xl px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Credits & Payments</h1>
					<p className="mt-2 text-gray-600">
						Purchase credits to validate your green claims and view your payment history
					</p>
				</div>

				{/* Tabs */}
				<div className="mb-8 flex space-x-1 rounded-lg bg-white p-1 shadow-sm">
					<button
						onClick={() => setActiveTab('pricing')}
						className={`flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'pricing'
								? 'bg-green-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'
							}`}
					>
						<CreditCard className="h-4 w-4" />
						<span>Purchase Credits</span>
					</button>
					<button
						onClick={() => setActiveTab('history')}
						className={`flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'history'
								? 'bg-green-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'
							}`}
					>
						<History className="h-4 w-4" />
						<span>Payment History</span>
					</button>
				</div>

				{activeTab === 'pricing' ? (
					<div className="grid gap-6 md:grid-cols-3">
						{pricingTiers.map((tier, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className={`relative rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${tier.featured ? 'border-green-500' : 'border-gray-200'
									}`}
							>
								{tier.featured && (
									<div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white">
										Most Popular
									</div>
								)}
								<div className="mb-4">
									<h3 className="text-2xl font-bold">{tier.credits} Credits</h3>
									<p className="mt-2 text-sm text-gray-600">{tier.description}</p>
								</div>
								<div className="mb-6">
									<span className="text-3xl font-bold">€{tier.price}</span>
									<span className="text-gray-500">/one-time</span>
								</div>
								<button
									onClick={() => handlePurchase(tier)}
									disabled={processingPayment}
									className={`w-full rounded-lg bg-green-500 py-2 text-white transition-colors hover:bg-green-600 ${processingPayment ? 'cursor-not-allowed opacity-50' : ''
										}`}
								>
									{processingPayment ? (
										<Loader2 className="mx-auto h-5 w-5 animate-spin" />
									) : (
										<span className="flex items-center justify-center">
											Purchase
											<ArrowRight className="ml-2 h-4 w-4" />
										</span>
									)}
								</button>
							</motion.div>
						))}
					</div>
				) : (
					<div className="rounded-2xl bg-white p-6 shadow-sm">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b text-left">
										<th className="pb-4 text-sm font-medium text-gray-500">Date</th>
										<th className="pb-4 text-sm font-medium text-gray-500">Amount</th>
										<th className="pb-4 text-sm font-medium text-gray-500">Credits</th>
										<th className="pb-4 text-sm font-medium text-gray-500">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{payments.length === 0 ? (
										<tr>
											<td colSpan={4} className="py-4 text-center text-gray-500">
												No payment history found
											</td>
										</tr>
									) : (
										payments.map((payment) => (
											<tr key={payment.id}>
												<td className="py-4">{formatDate(payment.createdAt)}</td>
												<td className="py-4">
													{formatCurrency(payment.amount, payment.currency)}
												</td>
												<td className="py-4">{payment.creditAmount} credits</td>
												<td className="py-4">
													<span
														className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${payment.status === 'completed'
																? 'bg-green-100 text-green-700'
																: 'bg-red-100 text-red-700'
															}`}
													>
														{payment.status === 'completed' ? (
															<CheckCircle2 className="mr-1 h-3 w-3" />
														) : (
															<XCircle className="mr-1 h-3 w-3" />
														)}
														{payment.status}
													</span>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
