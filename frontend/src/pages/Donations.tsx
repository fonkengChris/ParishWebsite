import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { donationsAPI } from '../services/api';
import { getStoredUser, isAuthenticated } from '../utils/auth';
import { parishionersAPI, authAPI } from '../services/api';

export default function Donations() {
  const [formData, setFormData] = useState<{
    amount: string;
    currency: string;
    purpose: 'general' | 'charity' | 'mass' | 'other';
    purposeDescription: string;
    donor: {
      name: string;
      email: string;
      phone: string;
    };
    notes: string;
    isAnonymous: boolean;
  }>({
    amount: '',
    currency: 'XAF',
    purpose: 'general',
    purposeDescription: '',
    donor: {
      name: '',
      email: '',
      phone: ''
    },
    notes: '',
    isAnonymous: false
  });
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mtn-mobile-money' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [mtnReferenceId, setMtnReferenceId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentMethodsStatus, setPaymentMethodsStatus] = useState<{
    paypal: { available: boolean; configured: boolean };
    mtnMobileMoney: { available: boolean; configured: boolean };
  } | null>(null);

  // Check payment methods availability on load
  useEffect(() => {
    const checkPaymentMethods = async () => {
      try {
        const status = await donationsAPI.getPaymentMethodsStatus();
        setPaymentMethodsStatus(status);
      } catch (err) {
        console.error('Failed to check payment methods status:', err);
        // Set defaults if check fails
        setPaymentMethodsStatus({
          paypal: { available: false, configured: false },
          mtnMobileMoney: { available: false, configured: false }
        });
      }
    };
    checkPaymentMethods();
  }, []);

  // Pre-fill form with logged-in user information
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!isAuthenticated()) {
        return;
      }

      const user = getStoredUser();
      if (!user) {
        return;
      }

      // Always pre-fill email from user object if available
      const updates: Partial<typeof formData.donor> = {};
      
      if (user.email) {
        updates.email = user.email;
      }

      // Try to get name and phone from parishioner profile
      if (user.role === 'parishioner' && user.email) {
        let parishioner = null;
        
        const parishionerId = localStorage.getItem('parishionerId');
        if (parishionerId) {
          try {
            parishioner = await parishionersAPI.getProfile(parishionerId);
          } catch (err) {
            console.log('Could not load parishioner profile by ID, trying email...');
          }
        }
        
        if (!parishioner && user.email) {
          try {
            parishioner = await authAPI.getProfileByEmail(user.email);
            if (parishioner?._id) {
              localStorage.setItem('parishionerId', parishioner._id);
            }
          } catch (err) {
            console.log('Could not load parishioner profile by email');
          }
        }
        
        if (parishioner) {
          const fullName = `${parishioner.firstName || ''} ${parishioner.lastName || ''}`.trim();
          if (fullName) {
            updates.name = fullName;
          }
          if (parishioner.phone) {
            updates.phone = parishioner.phone;
          }
        }
      } else if (user.username) {
        // For admin/editor/priest roles, use username as name
        updates.name = user.username;
      } else if (user.email) {
        // Fallback: use email prefix as name
        const emailName = user.email.split('@')[0];
        const formattedName = emailName
          .replace(/[._]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        updates.name = formattedName;
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          donor: {
            ...prev.donor,
            ...updates,
          },
        }));
      }
    };

    loadUserInfo();
  }, []);

  // Check MTN payment status periodically
  useEffect(() => {
    // Only start polling if payment method is MTN, we have a donation ID, and payment is not yet successful
    if (paymentMethod === 'mtn-mobile-money' && donationId && mtnReferenceId && !success) {
      const interval = setInterval(async () => {
        // Skip if already checking or if payment is already successful
        if (checkingStatus || success) {
          return;
        }
        
        setCheckingStatus(true);
        try {
          const result = await donationsAPI.checkMTNStatus(donationId);
          if (result.status === 'completed') {
            setSuccess(true);
            setError('');
            clearInterval(interval);
          } else if (result.status === 'failed') {
            setError('Payment failed. Please try again.');
            clearInterval(interval);
          }
        } catch (err: any) {
          console.error('Error checking payment status:', err);
          // Don't stop polling on error - might be temporary network issue
        } finally {
          setCheckingStatus(false);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [paymentMethod, donationId, mtnReferenceId, success]); // Removed checkingStatus from dependencies

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('donor.')) {
      const donorField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        donor: {
          ...prev.donor,
          [donorField]: value
        }
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePayPalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Convert XAF to USD for PayPal (approximate conversion)
      let amount = parseFloat(formData.amount);
      let currency = formData.currency;
      
      if (currency === 'XAF') {
        // Convert XAF to USD (approximate rate: 1 USD ≈ 600 XAF)
        amount = amount / 600;
        currency = 'USD';
      }

      const result = await donationsAPI.createPayPalOrder({
        amount,
        currency,
        purpose: formData.purpose,
        donor: formData.donor,
        purposeDescription: formData.purposeDescription,
        notes: formData.notes,
        isAnonymous: formData.isAnonymous
      });

      setDonationId(result.donationId);
      setPaymentMethod('paypal');
      
      // Store donation ID for success page
      localStorage.setItem('pendingDonationId', result.donationId);
      
      // Redirect to PayPal
      if (result.approvalUrl) {
        window.location.href = result.approvalUrl;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create PayPal order. Please try again.';
      const errorDetails = err.response?.data?.details;
      
      if (err.response?.status === 503) {
        setError(
          errorDetails || 
          'PayPal is not configured. Please use MTN Mobile Money or contact the administrator.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMTNSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.donor.phone) {
        setError('Phone number is required for MTN Mobile Money');
        setLoading(false);
        return;
      }

      const result = await donationsAPI.createMTNRequest({
        amount: parseFloat(formData.amount),
        phoneNumber: formData.donor.phone,
        purpose: formData.purpose,
        donor: formData.donor,
        purposeDescription: formData.purposeDescription,
        notes: formData.notes,
        isAnonymous: formData.isAnonymous
      });

      setDonationId(result.donationId);
      setMtnReferenceId(result.referenceId);
      setPaymentMethod('mtn-mobile-money');
      setSuccess(false); // Will be set to true when payment is confirmed
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create MTN payment request. Please try again.';
      const errorDetails = err.response?.data?.details;
      
      if (err.response?.status === 503) {
        setError(
          errorDetails || 
          'MTN Mobile Money is not configured. Please use PayPal or contact the administrator.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const purposeOptions = [
    { value: 'general', label: 'General Donation' },
    { value: 'charity', label: 'Charity' },
    { value: 'mass', label: 'Mass Intention' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Support Our Parish</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your generous donations help us continue our mission and serve our community. 
            Thank you for your support!
          </p>
        </div>

        {success ? (
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-10 text-center shadow-xl mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
            <p className="text-green-700 text-lg">
              Your donation has been received successfully. A receipt has been sent to your email.
            </p>
            {donationId && (
              <p className="text-green-600 text-sm mt-4">
                Donation ID: {donationId}
              </p>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            )}

            {paymentMethod === 'mtn-mobile-money' && donationId && !success && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">📱</div>
                  <h3 className="text-xl font-bold text-blue-800">Payment Request Sent</h3>
                </div>
                <p className="text-blue-700 mb-2">
                  Please check your phone and approve the payment request.
                </p>
                <p className="text-blue-600 text-sm">
                  Reference: {mtnReferenceId}
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  We're checking your payment status automatically...
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Donation Form</h2>
              
              <form onSubmit={paymentMethod === 'paypal' ? handlePayPalSubmit : handleMTNSubmit}>
                <div className="space-y-6">
                  {/* Donor Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="donor.name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="donor.name"
                          name="donor.name"
                          required
                          value={formData.donor.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="donor.email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="donor.email"
                          name="donor.email"
                          required
                          value={formData.donor.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="donor.phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number {paymentMethod === 'mtn-mobile-money' && '*'}
                        </label>
                        <input
                          type="tel"
                          id="donor.phone"
                          name="donor.phone"
                          required={paymentMethod === 'mtn-mobile-money'}
                          value={formData.donor.phone}
                          onChange={handleChange}
                          placeholder="+237 6XX XXX XXX"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                        {paymentMethod === 'mtn-mobile-money' && (
                          <p className="text-sm text-gray-500 mt-1">MTN Mobile Money number required</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isAnonymous"
                          checked={formData.isAnonymous}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Make this donation anonymous</span>
                      </label>
                    </div>
                  </div>

                  {/* Donation Details */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Donation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                          Amount *
                        </label>
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          required
                          min="100"
                          step="100"
                          value={formData.amount}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                          Currency *
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          required
                          value={formData.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                        >
                          <option value="XAF">XAF (Central African CFA franc)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700 mb-2">
                          Purpose *
                        </label>
                        <select
                          id="purpose"
                          name="purpose"
                          required
                          value={formData.purpose}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                        >
                          {purposeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(formData.purpose === 'other' || formData.purposeDescription) && (
                        <div className="md:col-span-2">
                          <label htmlFor="purposeDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                            Please specify
                          </label>
                          <input
                            type="text"
                            id="purposeDescription"
                            name="purposeDescription"
                            value={formData.purposeDescription}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        disabled={!!(paymentMethodsStatus && !paymentMethodsStatus.paypal.available)}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-primary-500 bg-primary-50'
                            : paymentMethodsStatus && !paymentMethodsStatus.paypal.available
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">💳</div>
                        <div className="font-semibold text-gray-800">PayPal</div>
                        <div className="text-sm text-gray-600 mt-1">Credit/Debit Card</div>
                        {paymentMethodsStatus && !paymentMethodsStatus.paypal.available && (
                          <div className="text-xs text-red-600 mt-2">Not Available</div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mtn-mobile-money')}
                        disabled={!!(paymentMethodsStatus && !paymentMethodsStatus.mtnMobileMoney.available)}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          paymentMethod === 'mtn-mobile-money'
                            ? 'border-primary-500 bg-primary-50'
                            : paymentMethodsStatus && !paymentMethodsStatus.mtnMobileMoney.available
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">📱</div>
                        <div className="font-semibold text-gray-800">MTN Mobile Money</div>
                        <div className="text-sm text-gray-600 mt-1">Cameroon</div>
                        {paymentMethodsStatus && !paymentMethodsStatus.mtnMobileMoney.available && (
                          <div className="text-xs text-red-600 mt-2">Not Available</div>
                        )}
                      </button>
                    </div>
                    {paymentMethodsStatus && 
                     (!paymentMethodsStatus.paypal.available || !paymentMethodsStatus.mtnMobileMoney.available) && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm text-yellow-800">
                          {!paymentMethodsStatus.paypal.available && !paymentMethodsStatus.mtnMobileMoney.available
                            ? '⚠️ Payment methods are currently being configured. Please contact the administrator.'
                            : '⚠️ Some payment methods are not available. Please select an available method.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  {paymentMethod && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {loading ? 'Processing...' : paymentMethod === 'paypal' ? 'Continue to PayPal' : 'Send Payment Request'}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Information Section */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">About Your Donation</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>All donations are securely processed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>You will receive a receipt via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>Your donation helps support our parish mission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>You can choose to make your donation anonymous</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

