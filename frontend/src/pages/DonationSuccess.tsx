import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { donationsAPI } from '../services/api';

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [donation, setDonation] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Extract parameters from URL
    const token = searchParams.get('token');
    const storedDonationId = localStorage.getItem('pendingDonationId');

    // Check if we have the required parameters
    if (!token) {
      // Check if user cancelled
      if (searchParams.get('cancel') === 'true' || !storedDonationId) {
        setError('Payment was cancelled or incomplete. Please try again.');
        setLoading(false);
        return;
      }
      setError('Missing payment information. Please contact support.');
      setLoading(false);
      return;
    }

    if (!storedDonationId) {
      setError('Missing donation information. Please contact support.');
      setLoading(false);
      return;
    }

    // Store the IDs but don't process yet - wait for user confirmation
    setOrderId(token);
    setDonationId(storedDonationId);
    setLoading(false);
  }, [searchParams]);

  const handleConfirmPayment = async () => {
    if (!orderId || !donationId || hasProcessedRef.current) {
      return;
    }

    hasProcessedRef.current = true;
    setLoading(true);
    setError('');

    try {
      const result = await donationsAPI.capturePayPalOrder(orderId, donationId);
      
      if (result.success) {
        setSuccess(true);
        setDonation(result.donation);
        localStorage.removeItem('pendingDonationId');
      } else {
        setError('Payment processing failed. Please contact support.');
        hasProcessedRef.current = false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to process payment. Please contact support.';
      setError(errorMessage);
      hasProcessedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  if (loading && !orderId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-10 text-center shadow-xl">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-4xl font-bold text-green-800 mb-4">Thank You!</h1>
            <p className="text-green-700 text-lg mb-6">
              Your donation has been processed successfully.
            </p>
            {donation && (
              <div className="bg-white rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Donation Details</h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Amount:</strong> {donation.amount} {donation.currency}</p>
                  <p><strong>Purpose:</strong> {donation.purpose}</p>
                  {donation.paymentDetails?.transactionId && (
                    <p><strong>Transaction ID:</strong> {donation.paymentDetails.transactionId}</p>
                  )}
                  <p><strong>Date:</strong> {new Date(donation.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            <p className="text-green-600 mb-6">
              A receipt has been sent to your email address.
            </p>
            <button
              onClick={() => navigate('/donations')}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
            >
              Make Another Donation
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !orderId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-10 text-center shadow-xl">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-4xl font-bold text-red-800 mb-4">Payment Failed</h1>
            <p className="text-red-700 text-lg mb-6">{error}</p>
            <button
              onClick={() => navigate('/donations')}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show confirmation screen before processing
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Complete Your Payment</h1>
          <p className="text-gray-600 text-lg mb-8">
            You've been redirected back from PayPal. Click the button below to complete and process your donation.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/donations')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={loading || hasProcessedRef.current}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

