'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify email. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-8">
                {message}
              </p>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 py-3 text-lg rounded-xl shadow-lg">
                  Continue to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-8">
                {message}
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 text-lg rounded-xl">
                    Go to Login
                  </Button>
                </Link>
                <ResendVerificationButton />
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ResendVerificationButton() {
  const [email, setEmail] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      setMessage('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Resend Verification Email
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleResend}
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                Send Verification Email
              </div>
            )}
          </Button>
          {message && (
            <p className={`text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}




