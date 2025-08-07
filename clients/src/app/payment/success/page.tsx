'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PaymentDetails {
  tran_id?: string;
  amount?: string;
  card_type?: string;
  status?: string;
  val_id?: string;
  bank_tran_id?: string;
  card_issuer?: string;
  card_brand?: string;
  currency?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  // Get URL parameters directly
  const tranId = searchParams.get('tran_id');
  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  const valId = searchParams.get('val_id');
  const bankTranId = searchParams.get('bank_tran_id');
  const cardIssuer = searchParams.get('card_issuer');
  const cardBrand = searchParams.get('card_brand');
  const currency = searchParams.get('currency') || 'BDT';
  
  // Set payment details directly from URL parameters
  const paymentDetails: PaymentDetails = {
    tran_id: tranId || 'Unknown',
    amount: amount || '0',
    card_type: cardBrand || 'Online Payment',
    status: status || 'VALID',
    val_id: valId || '',
    bank_tran_id: bankTranId || '',
    card_issuer: cardIssuer || '',
    card_brand: cardBrand || '',
    currency: currency
  };

  // Verify payment with backend
  useEffect(() => {
    const verifyPayment = async () => {
      if (!tranId) {
        setError('No transaction ID found');
        setVerifying(false);
        return;
      }

      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setVerifying(false);
          return;
        }

        // Verify payment with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/sslcommerz/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tranId })
        });

        const result = await response.json();

        if (result.success) {
          setPaymentVerified(true);
        } else {
          setError(result.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };

    // Only verify if we have a transaction ID
    if (tranId) {
      verifyPayment();
    } else {
      setVerifying(false);
    }
  }, [tranId]);

  // Handle any navigation errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes('Invalid URL')) {
        console.error('URL Error detected:', event.error);
        setError('Invalid URL parameters received');
        setVerifying(false);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Verification Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2">What should you do?</h3>
              <p className="text-yellow-800 text-sm">
                Don&apos;t worry! Your payment might still be successful. Please check your bookings page to see the current status.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/user/bookings"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block"
              >
                Check My Bookings
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors block"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            {paymentVerified 
              ? "Your payment has been verified and processed successfully." 
              : "Your payment appears to be successful. Please check your bookings for confirmation."
            }
          </p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium font-mono text-gray-600 text-xs">{paymentDetails.tran_id}</span>
                </div>
                {paymentDetails.val_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validation ID:</span>
                    <span className="font-medium font-mono text-gray-600 text-xs">{paymentDetails.val_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-600">{paymentDetails.currency} {parseFloat(paymentDetails.amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize text-gray-600">{paymentDetails.card_type} </span>
                </div>
                {paymentDetails.card_issuer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card Issuer:</span>
                    <span className="font-medium text-gray-600">{paymentDetails.card_issuer}</span>
                  </div>
                )}
                {paymentDetails.bank_tran_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Transaction:</span>
                    <span className="font-medium font-mono text-gray-600 text-xs">{paymentDetails.bank_tran_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Completed</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-900 mb-2">What&apos;s next?</h3>
            <p className="text-green-800 text-sm">
              Your booking has been confirmed! You can now view your booking details and track your driver.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/user/bookings"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors block"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>A confirmation email has been sent to your registered email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 