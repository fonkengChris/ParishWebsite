import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationsAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import type { Donation } from '../../types';

export default function ManageDonations() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    purpose: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const hasFetchedRef = useRef(false);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        limit: filters.limit
      };
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.purpose) params.purpose = filters.purpose;

      const data = await donationsAPI.getAll(params);
      setDonations(data.donations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if user has admin or parish-priest role
    if (!['admin', 'parish-priest'].includes(currentUser.role)) {
      navigate('/');
      return;
    }

    // Only fetch once on mount or when filters change
    if (!hasFetchedRef.current || filters.page !== pagination.page) {
      hasFetchedRef.current = true;
      fetchDonations();
    }
  }, [navigate, fetchDonations, filters, pagination.page]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
    hasFetchedRef.current = false;
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    hasFetchedRef.current = false;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodStyles = {
      'paypal': 'bg-blue-100 text-blue-800',
      'mtn-mobile-money': 'bg-purple-100 text-purple-800'
    };
    const displayName = method === 'mtn-mobile-money' ? 'MTN Mobile Money' : 'PayPal';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${methodStyles[method as keyof typeof methodStyles] || 'bg-gray-100 text-gray-800'}`}>
        {displayName}
      </span>
    );
  };

  // Convert any currency to FCFA (XAF)
  const convertToFCFA = (amount: number, currency: string): number => {
    if (currency === 'XAF') {
      return amount;
    }
    
    // Currency conversion rates (approximate, should be updated periodically)
    // These are approximate rates - for production, consider using a currency API
    const conversionRates: { [key: string]: number } = {
      'USD': 600,  // 1 USD ≈ 600 XAF
      'EUR': 650,  // 1 EUR ≈ 650 XAF
      'GBP': 750,  // 1 GBP ≈ 750 XAF
      'XAF': 1     // Base currency
    };

    const rate = conversionRates[currency.toUpperCase()] || 1;
    return amount * rate;
  };

  // Format amount in FCFA
  const formatAmount = (amount: number, currency: string) => {
    const amountInFCFA = convertToFCFA(amount, currency);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amountInFCFA);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleMessageExpansion = (donationId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(donationId)) {
        newSet.delete(donationId);
      } else {
        newSet.add(donationId);
      }
      return newSet;
    });
  };

  const MAX_MESSAGE_LENGTH = 30;

  if (!user) return null;

  if (loading && donations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Donations</h1>
                  <p className="text-sm text-gray-500">View and manage all donation records</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading donations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Donations</h1>
                <p className="text-sm text-gray-500">View and manage all donation records</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Donations</h2>
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} {pagination.total === 1 ? 'donation' : 'donations'} total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All Methods</option>
                <option value="paypal">PayPal</option>
                <option value="mtn-mobile-money">MTN Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <select
                value={filters.purpose}
                onChange={(e) => handleFilterChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All Purposes</option>
                <option value="general">General</option>
                <option value="charity">Charity</option>
                <option value="mass">Mass Intention</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: '', paymentMethod: '', purpose: '', page: 1, limit: 20 });
                  hasFetchedRef.current = false;
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Donations</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {donations.filter(d => d.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {donations.filter(d => d.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Amount (FCFA)</div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatAmount(
                donations
                  .filter(d => d.status === 'completed')
                  .reduce((sum, d) => sum + convertToFCFA(d.amount, d.currency), 0),
                'XAF'
              )}
            </div>
          </div>
        </div>

        {/* Donations Table */}
        {donations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No donations found</h3>
            <p className="mt-2 text-sm text-gray-500">No donations match your current filters.</p>
            <button
              onClick={() => {
                setFilters({ status: '', paymentMethod: '', purpose: '', page: 1, limit: 20 });
                hasFetchedRef.current = false;
              }}
              className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {donation.isAnonymous ? 'Anonymous' : donation.donor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.isAnonymous ? '' : donation.donor.email}
                        </div>
                        {donation.donor.phone && !donation.isAnonymous && (
                          <div className="text-xs text-gray-400">{donation.donor.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatAmount(donation.amount, donation.currency)}
                        </div>
                        {donation.currency !== 'XAF' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {donation.amount} {donation.currency}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {donation.purpose === 'mass' ? 'Mass Intention' : donation.purpose}
                        </div>
                        {donation.purposeDescription && (
                          <div className="text-xs text-gray-500">{donation.purposeDescription}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {donation.notes ? (
                          <div className="text-sm text-gray-700 max-w-xs">
                            {donation.notes.length > MAX_MESSAGE_LENGTH && !expandedMessages.has(donation._id) ? (
                              <>
                                <span>{donation.notes.substring(0, MAX_MESSAGE_LENGTH)}...</span>
                                <button
                                  onClick={() => toggleMessageExpansion(donation._id)}
                                  className="ml-1 text-primary-700 hover:text-primary-900 font-semibold text-sm underline underline-offset-2"
                                >
                                  read more
                                </button>
                              </>
                            ) : (
                              <>
                                <span>{donation.notes}</span>
                                {donation.notes.length > MAX_MESSAGE_LENGTH && (
                                  <button
                                    onClick={() => toggleMessageExpansion(donation._id)}
                                    className="ml-1 text-primary-700 hover:text-primary-900 font-semibold text-sm underline underline-offset-2"
                                  >
                                    read less
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No message</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentMethodBadge(donation.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(donation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {donation.createdAt ? formatDate(donation.createdAt) : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} donations
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

