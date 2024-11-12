// app/payment-success/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {LoadingSpinner} from "@/components/ui/base"

interface PaymentDetails {
  amount: number;
  credits: number;
  date: string;
}

export default function Success({ searchParams }: { searchParams: { session_id: string } }) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.session_id;

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/payments/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        const data = await response.json();
        setPaymentDetails(data);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setError('Unable to load payment details. Please try again.');
        toast.error('Error loading payment details');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchPaymentDetails();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner/>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-red-100 p-3 text-red-500">
            <RefreshCcw className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Error Loading Payment</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Try Again
            <RefreshCcw className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          {/* Header */}
          <div className="border-b border-gray-100 bg-green-50 px-8 py-6">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
              Payment Successful!
            </h1>
            
            <p className="text-center text-gray-600">
              Thank you for your purchase. Your credits have been added to your account.
            </p>
          </div>

          {/* Payment Details */}
          <div className="space-y-6 px-8 py-6">
            <div className="space-y-4 rounded-lg bg-gray-50 p-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-gray-900">
                  €{paymentDetails.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credits Added:</span>
                <span className="font-medium text-gray-900">
                  {paymentDetails.credits} credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(paymentDetails.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link
                href="/claims"
                className="flex flex-1 items-center justify-center rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                View My Claims
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <Link
                href="/payments"
                className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                View Payment History
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}