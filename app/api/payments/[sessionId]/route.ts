// app/api/payments/[sessionId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
	request: Request,
	{ params }: { params: { sessionId: string } }
) {
	try {
		const payment = await prisma.payment.findUnique({
			where: {
				stripeSessionId: params.sessionId,
			},
		});

		if (!payment) {
			return NextResponse.json(
				{ error: 'Payment not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			amount: payment.amount,
			credits: payment.creditAmount,
			date: payment.createdAt,
		});
	} catch (error) {
		console.error('Error fetching payment:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch payment details' },
			{ status: 500 }
		);
	}
}