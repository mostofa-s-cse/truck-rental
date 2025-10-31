'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface PaymentDetails {
  tran_id?: string;
  amount?: string;
  card_type?: string;
  status?: string;
}

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  
  // Get URL parameters directly
  const tranId = searchParams.get('tran_id');
  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  
  // Set payment details directly from URL parameters
  const paymentDetails: PaymentDetails = {
    tran_id: tranId || 'Unknown',
    amount: amount || '0',
    card_type: 'Online Payment',
    status: status || 'CANCELLED'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">You cancelled the payment process. No charges were made to your account.</p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium font-mono text-xs">{paymentDetails.tran_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">৳{parseFloat(paymentDetails.amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentDetails.card_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-yellow-600">Cancelled</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-900 mb-2">What happened?</h3>
            <p className="text-yellow-800 text-sm mb-3">
              The payment process was cancelled. This could be because:
            </p>
            <ul className="text-yellow-800 text-sm space-y-1 text-left">
              <li>• You clicked the cancel button</li>
              <li>• You closed the payment window</li>
              <li>• The payment session expired</li>
              <li>• You navigated away from the payment page</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">No worries!</h3>
            <p className="text-blue-800 text-sm">
              Your booking is still pending and no charges were made. You can complete the payment anytime from your bookings page.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/user/bookings"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Complete Payment
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors block flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Your booking will remain pending until payment is completed.</p>
            <p className="mt-2">
              Need help? Contact us at <strong>support@truckrental.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 