import {  CURRENCY } from "@/lib/constants";
import { formatAmountForStripe } from "@/lib/stripe-helper";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const {user} = session!;
  try {
    const amount: number = 5;
    if (!user) {
      return NextResponse.json({ statusCode: 401, message: "Unauthorized" });
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      submit_type: "pay",
      payment_method_types: ["card", "bancontact", "ideal"],
      mode: "payment",
      customer_email: user.email as string,
      line_items: [
        {
          quantity: 1,
          price_data: {
            unit_amount: formatAmountForStripe(amount, CURRENCY),
            currency: CURRENCY,
            product_data: {
              name: "Credits",
            },
          },
        },
      ],
      success_url: `${request.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/payment`,
    }

    const checkoutSession = await stripe.checkout.sessions.create(params)

    //TODO: Add a webhook with stripe to check if payment is successful
      await prisma.user.update({
        where: { email: user.email as string },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      return NextResponse.json(checkoutSession);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ statusCode: 500, message: err.message });
  }
}
