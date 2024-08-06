"use client";

export default function Success(context: any) {

	const sessionId = context.searchParams.session_id || null;

	return (
		<div>
			<h1>Payment Success</h1>
			<p>Thank you for your payment!</p>
			<p>Your session ID is: {sessionId}</p>
		</div>
	);
}
