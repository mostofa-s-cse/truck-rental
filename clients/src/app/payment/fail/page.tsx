'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw } from 'lucide-react';

interface PaymentDetails {
  tran_id?: string;
  amount?: string;
  card_type?: string;
  status?: string;
  error?: string;
  failedreason?: string;
  errorReason?: string;
}

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  
  // Get URL parameters directly
  const tranId = searchParams.get('tran_id');
  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  const error = searchParams.get('error') || searchParams.get('failedreason') || searchParams.get('errorReason') || undefined;
  
  // Set payment details directly from URL parameters
  const paymentDetails: PaymentDetails = {
    tran_id: tranId || 'Unknown',
    amount: amount || '0',
    card_type: 'Online Payment',
    status: status || 'FAILED',
    error: error
  };

  // Get error message for display
  const getErrorMessage = () => {
    if (error) {
      // Common SSLCommerz error messages
      const errorMessages: { [key: string]: string } = {
        'Invalid card number': 'The card number you entered is invalid.',
        'Card expired': 'Your card has expired. Please use a different card.',
        'Insufficient funds': 'Your card has insufficient funds for this transaction.',
        'Transaction declined': 'Your bank declined this transaction.',
        'Invalid CVV': 'The CVV code you entered is incorrect.',
        '3D Secure failed': '3D Secure authentication failed.',
        'Session expired': 'The payment session expired. Please try again.',
        'Invalid amount': 'The payment amount is invalid.',
        'Merchant not found': 'Payment gateway configuration error.',
        'Invalid currency': 'Currency not supported for this transaction.'
      };

      // Check if we have a specific error message
      for (const [key, message] of Object.entries(errorMessages)) {
        if (error.toLowerCase().includes(key.toLowerCase())) {
          return message;
        }
      }

      // Return the original error if no specific message found
      return error;
    }

    return 'Your payment could not be processed. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium font-mono text-gray-600 text-xs">{paymentDetails.tran_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-600">৳{parseFloat(paymentDetails.amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize text-gray-600">{paymentDetails.card_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-red-600 text-xs">Failed</span>
                </div>
                {paymentDetails.error && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Error Details:</span>
                    <p className="text-red-600 mt-1 text-xs break-words">{paymentDetails.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-900 mb-2">What went wrong?</h3>
            <p className="text-red-800 text-sm mb-3">
              The payment could not be completed. This might be due to:
            </p>
            <ul className="text-red-800 text-sm space-y-1 text-left">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details</li>
              <li>• Card restrictions or security settings</li>
              <li>• Network connectivity issues</li>
              <li>• Bank declined the transaction</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What should you do?</h3>
            <p className="text-blue-800 text-sm">
              Don&apos;t worry! Your booking is still pending. You can try the payment again from your bookings page.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/user/bookings"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Payment Again
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors block"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>If you continue to experience issues, please contact our support team.</p>
            <p className="mt-2">
              <strong>Support:</strong> support@truckrental.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 