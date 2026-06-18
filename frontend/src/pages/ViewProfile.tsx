import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { authAPI, parishionersAPI } from '../services/api';
import type { Parishioner } from '../types';

export default function ViewProfile() {
  const { id } = useParams<{ id: string }>();
  const [parishioner, setParishioner] = useState<Parishioner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailLookup, setEmailLookup] = useState('');
  const [showEmailLookup, setShowEmailLookup] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load parishioner data
        if (id) {
          await loadParishioner(id);
        } else {
          // Check localStorage for saved ID
          const savedId = localStorage.getItem('parishionerId');
          if (savedId) {
            await loadParishioner(savedId);
          } else {
            setShowEmailLookup(true);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const loadParishioner = async (parishionerId: string) => {
    try {
      const data = await parishionersAPI.getProfile(parishionerId);
      setParishioner(data);
      setShowEmailLookup(false);
    } catch (err) {
      console.error('Error loading parishioner:', err);
      setError('Failed to load profile. Please try again or register.');
      setShowEmailLookup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.getProfileByEmail(emailLookup);
      setParishioner(data);
      localStorage.setItem('parishionerId', data._id);
      localStorage.setItem('parishionerEmail', emailLookup);
      await loadParishioner(data._id);
    } catch (err: any) {
      console.error('Email lookup error:', err);
      setError(err.response?.data?.message || 'Profile not found with that email.');
      setLoading(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not provided';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Helper to get mission station name
  const getMissionStationName = (): string => {
    if (!parishioner?.missionStation) return 'Not assigned';
    if (typeof parishioner.missionStation === 'object') {
      return parishioner.missionStation.name;
    }
    return 'Not assigned';
  };

  // Helper to get ministries names
  const getMinistriesNames = (): string[] => {
    if (!parishioner?.ministries || parishioner.ministries.length === 0) return [];
    return parishioner.ministries.map(m => 
      typeof m === 'object' ? m.name : 'Unknown'
    );
  };

  // Helper to get email from user object
  const getEmail = (): string => {
    if (!parishioner?.user) return 'Not provided';
    if (typeof parishioner.user === 'object' && parishioner.user !== null) {
      return parishioner.user.email;
    }
    return 'Not provided';
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (showEmailLookup) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">View Profile</h2>
            <p className="text-gray-600 text-center">
              Enter your registered email to view your parishioner profile.
            </p>
            <form onSubmit={handleEmailLookup} className="space-y-4">
              <div>
                <label htmlFor="emailLookup" className="sr-only">Email</label>
                <input
                  type="email"
                  id="emailLookup"
                  name="emailLookup"
                  required
                  value={emailLookup}
                  onChange={(e) => setEmailLookup(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your registered email"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'View Profile'}
              </button>
            </form>
            <div className="text-center text-sm text-gray-600">
              <p>
                Not yet registered?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!parishioner) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-red-500">Error: Parishioner profile not found.</p>
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium mt-4 block">
            Register as a new parishioner
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Parishioner Profile</h1>
            <p className="text-gray-600">View your personal and parish information.</p>
          </div>
          <Link
            to={`/profile/edit${id ? `/${id}` : ''}`}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Edit Profile
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="text-lg text-gray-900">{parishioner.firstName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="text-lg text-gray-900">{parishioner.lastName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg text-gray-900">{getEmail()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-lg text-gray-900">{parishioner.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-lg text-gray-900">{formatDate(parishioner.dateOfBirth)}</p>
              </div>
            </div>
          </section>

          {/* Address */}
          {parishioner.address && (
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parishioner.address.street && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Street</p>
                    <p className="text-lg text-gray-900">{parishioner.address.street}</p>
                  </div>
                )}
                {parishioner.address.city && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p className="text-lg text-gray-900">{parishioner.address.city}</p>
                  </div>
                )}
                {parishioner.address.state && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">State / Province</p>
                    <p className="text-lg text-gray-900">{parishioner.address.state}</p>
                  </div>
                )}
                {parishioner.address.zipCode && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Zip / Postal Code</p>
                    <p className="text-lg text-gray-900">{parishioner.address.zipCode}</p>
                  </div>
                )}
                {parishioner.address.country && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="text-lg text-gray-900">{parishioner.address.country}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Parish Information */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Parish Information</h2>
            <div>
              <p className="text-sm font-medium text-gray-500">Primary Mission Station</p>
              <p className="text-lg text-gray-900">{getMissionStationName()}</p>
            </div>
          </section>

          {/* Family Members */}
          {parishioner.familyMembers && parishioner.familyMembers.length > 0 && (
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Family Members</h2>
              <div className="space-y-4">
                {parishioner.familyMembers.map((member, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-lg text-gray-900">{member.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Relationship</p>
                        <p className="text-lg text-gray-900">{member.relationship}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="text-lg text-gray-900">{formatDate(member.dateOfBirth)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sacraments */}
          {parishioner.sacraments && (
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sacraments Received</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parishioner.sacraments.baptism && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Baptism</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(parishioner.sacraments.baptism.date)}
                    </p>
                    {parishioner.sacraments.baptism.location && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {parishioner.sacraments.baptism.location}
                      </p>
                    )}
                  </div>
                )}
                {parishioner.sacraments.firstCommunion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">First Communion</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(parishioner.sacraments.firstCommunion.date)}
                    </p>
                    {parishioner.sacraments.firstCommunion.location && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {parishioner.sacraments.firstCommunion.location}
                      </p>
                    )}
                  </div>
                )}
                {parishioner.sacraments.confirmation && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Confirmation</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(parishioner.sacraments.confirmation.date)}
                    </p>
                    {parishioner.sacraments.confirmation.location && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {parishioner.sacraments.confirmation.location}
                      </p>
                    )}
                  </div>
                )}
                {parishioner.sacraments.marriage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Marriage</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(parishioner.sacraments.marriage.date)}
                    </p>
                    {parishioner.sacraments.marriage.location && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {parishioner.sacraments.marriage.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Ministries */}
          {getMinistriesNames().length > 0 && (
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ministries</h2>
              <div className="flex flex-wrap gap-2">
                {getMinistriesNames().map((name, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {parishioner.notes && (
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{parishioner.notes}</p>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}

