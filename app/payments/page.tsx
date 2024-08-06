"use client"
import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import getStripe, { fetchPostJSON } from '@/lib/stripe-helper';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
export default function PreviewPage() {

	const router = useRouter();

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const stripe = await getStripe();
		await fetchPostJSON("/api/checkout_sessions", {
			amount: 5,
		})
			.then((response) => {
				console.log(response)
				router.push(response.url);
			})
			.catch((error) => {
				console.warn(error.message);
			});
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<h1 className="text-6xl">Payment</h1>
			<p>
				In order to use Green Claims Validator, you need to have some credits. You can get some credits by paying with your credit card.
			</p>
			<form onSubmit={handleSubmit}>
				<section>
					<button className='btn' type="submit">
						Checkout
					</button>
				</section>
			</form>
		</div>
	);
}