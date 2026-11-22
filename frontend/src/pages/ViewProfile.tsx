import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { authAPI, parishionersAPI } from '../services/api';
import { isAuthenticated } from '../utils/auth';
import type { Parishioner } from '../types';

export default function ViewProfile() {
  const { id } = useParams<{ id: string }>();
  const [parishioner, setParishioner] = useState<Parishioner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [noProfileForAccount, setNoProfileForAccount] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load parishioner data
        if (id) {
          await loadParishioner(id);
        } else if (isAuthenticated()) {
          // Signed in: always show the signed-in user's own profile
          try {
            const mine = await authAPI.getMyProfile();
            await loadParishioner(mine._id);
          } catch (err: any) {
            setNoProfileForAccount(err.response?.status === 404);
            if (err.response?.status !== 404) setError('Failed to load your profile. Please try again.');
            setLoading(false);
          }
        } else {
          setNeedsSignIn(true);
          setLoading(false);
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
    } catch (err: any) {
      console.error('Error loading parishioner:', err);
      setError(err.response?.status === 403
        ? 'You can only view your own profile.'
        : 'Failed to load profile. Please try again.');
    } finally {
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

  // Helper to get apostolate names
  const getApostolatesNames = (): string[] => {
    if (!parishioner?.apostolates || parishioner.apostolates.length === 0) return [];
    return parishioner.apostolates.map(m =>
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

  if (noProfileForAccount) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700 mb-3">Your Profile</p>
          <h1 className="font-serif text-3xl text-ink mb-4">No parishioner profile</h1>
          <p className="text-ink-soft">
            This account is a staff account and isn&rsquo;t linked to a parishioner record.
            Parishioner profiles are created when someone registers.
          </p>
        </div>
      </Layout>
    );
  }

  if (needsSignIn) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700 mb-3">Your Profile</p>
          <h1 className="font-serif text-3xl text-ink mb-4">Sign in to see your profile</h1>
          <p className="text-ink-soft mb-8">
            Your parishioner profile is private. Sign in with the email you registered with.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
          <p className="mt-6 text-sm text-ink-soft">
            Not registered yet?{' '}
            <Link to="/register" className="text-primary-700 hover:underline font-medium">
              Register here
            </Link>
          </p>
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

          {/* Apostolates */}
          {getApostolatesNames().length > 0 && (
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Apostolates</h2>
              <div className="flex flex-wrap gap-2">
                {getApostolatesNames().map((name, index) => (
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

