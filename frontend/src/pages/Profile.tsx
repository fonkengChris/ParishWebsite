import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { authAPI, parishionersAPI, missionStationsAPI, ministriesAPI } from '../services/api';
import type { Parishioner, MissionStation, Ministry } from '../types';

export default function EditProfile() {
  const { id } = useParams<{ id: string }>();
  const [parishioner, setParishioner] = useState<Parishioner | null>(null);
  const [missionStations, setMissionStations] = useState<MissionStation[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailLookup, setEmailLookup] = useState('');
  const [showEmailLookup, setShowEmailLookup] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Parish Information
    missionStation: '',
    
    // Family Members
    familyMembers: [{ name: '', relationship: '', dateOfBirth: '' }],
    
    // Sacraments
    baptismDate: '',
    baptismLocation: '',
    firstCommunionDate: '',
    firstCommunionLocation: '',
    confirmationDate: '',
    confirmationLocation: '',
    marriageDate: '',
    marriageLocation: '',
    
    // Ministries
    selectedMinistries: [] as string[],
    
    // Notes
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsData, ministriesData] = await Promise.all([
          missionStationsAPI.getAll(),
          ministriesAPI.getAll(),
        ]);
        setMissionStations(stationsData);
        setMinistries(ministriesData);

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
      
      // Get email from user object if populated
      const email = typeof data.user === 'object' && data.user !== null 
        ? data.user.email 
        : '';
      
      // Populate form with existing data
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: email,
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipCode: data.address?.zipCode || '',
        country: data.address?.country || '',
        missionStation: typeof data.missionStation === 'object' && data.missionStation !== null
          ? data.missionStation._id
          : (data.missionStation as string) || '',
        familyMembers: data.familyMembers && data.familyMembers.length > 0
          ? data.familyMembers.map(fm => ({
              name: fm.name || '',
              relationship: fm.relationship || '',
              dateOfBirth: fm.dateOfBirth ? (typeof fm.dateOfBirth === 'string' ? fm.dateOfBirth.split('T')[0] : '') : '',
            }))
          : [{ name: '', relationship: '', dateOfBirth: '' }],
        baptismDate: data.sacraments?.baptism?.date ? data.sacraments.baptism.date.split('T')[0] : '',
        baptismLocation: data.sacraments?.baptism?.location || '',
        firstCommunionDate: data.sacraments?.firstCommunion?.date ? data.sacraments.firstCommunion.date.split('T')[0] : '',
        firstCommunionLocation: data.sacraments?.firstCommunion?.location || '',
        confirmationDate: data.sacraments?.confirmation?.date ? data.sacraments.confirmation.date.split('T')[0] : '',
        confirmationLocation: data.sacraments?.confirmation?.location || '',
        marriageDate: data.sacraments?.marriage?.date ? data.sacraments.marriage.date.split('T')[0] : '',
        marriageLocation: data.sacraments?.marriage?.location || '',
        selectedMinistries: data.ministries
          ? data.ministries.map(m => typeof m === 'object' && m !== null ? m._id : m as string)
          : [],
        notes: data.notes || '',
      });
      setLoading(false);
    } catch (error: any) {
      setError('Profile not found. Please check your email or registration ID.');
      setLoading(false);
    }
  };

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLookup.trim()) {
      setError('Please enter your email address');
      return;
    }
    try {
      const data = await authAPI.getProfileByEmail(emailLookup);
      localStorage.setItem('parishionerId', data._id);
      localStorage.setItem('parishionerEmail', emailLookup);
      await loadParishioner(data._id);
      setShowEmailLookup(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Profile not found with this email address.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFamilyMemberChange = (index: number, field: string, value: string) => {
    const updated = [...formData.familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, familyMembers: updated });
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      familyMembers: [...formData.familyMembers, { name: '', relationship: '', dateOfBirth: '' }],
    });
  };

  const removeFamilyMember = (index: number) => {
    setFormData({
      ...formData,
      familyMembers: formData.familyMembers.filter((_, i) => i !== index),
    });
  };

  const handleMinistryChange = (ministryId: string) => {
    setFormData({
      ...formData,
      selectedMinistries: formData.selectedMinistries.includes(ministryId)
        ? formData.selectedMinistries.filter(id => id !== ministryId)
        : [...formData.selectedMinistries, ministryId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parishioner) return;
    
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: formData.country || undefined,
        },
        missionStation: formData.missionStation || undefined,
        familyMembers: formData.familyMembers
          .filter(fm => fm.name.trim() !== '')
          .map(fm => ({
            name: fm.name,
            relationship: fm.relationship,
            dateOfBirth: fm.dateOfBirth || undefined,
          })),
        sacraments: {
          baptism: formData.baptismDate
            ? { date: formData.baptismDate, location: formData.baptismLocation || undefined }
            : undefined,
          firstCommunion: formData.firstCommunionDate
            ? { date: formData.firstCommunionDate, location: formData.firstCommunionLocation || undefined }
            : undefined,
          confirmation: formData.confirmationDate
            ? { date: formData.confirmationDate, location: formData.confirmationLocation || undefined }
            : undefined,
          marriage: formData.marriageDate
            ? { date: formData.marriageDate, location: formData.marriageLocation || undefined }
            : undefined,
        },
        ministries: formData.selectedMinistries.length > 0 ? formData.selectedMinistries : undefined,
        notes: formData.notes || undefined,
      };

      const updated = await parishionersAPI.updateProfile(parishioner._id, updateData);
      setParishioner(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (showEmailLookup) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">Access Your Profile</h1>
          <p className="text-gray-600 mb-8">
            Enter your email address to access your parishioner profile.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLookup} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Access Profile
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Not registered yet?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!parishioner) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">Profile not found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your personal and parish information.</p>
          </div>
          <Link
            to={`/profile${id ? `/${id}` : ''}`}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            View Profile
          </Link>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">Profile updated successfully!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  title="Email cannot be changed. Contact admin if you need to update it."
                />
                <p className="text-xs text-gray-500 mt-1">Email is linked to your account and cannot be changed here</p>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Parish Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Parish Information</h2>
            <div>
              <label htmlFor="missionStation" className="block text-sm font-medium text-gray-700 mb-1">
                Mission Station
              </label>
              <select
                id="missionStation"
                name="missionStation"
                value={formData.missionStation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a mission station</option>
                {missionStations.map((station) => (
                  <option key={station._id} value={station._id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Family Members */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Family Members</h2>
              <button
                type="button"
                onClick={addFamilyMember}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Member
              </button>
            </div>
            {formData.familyMembers.map((member, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={member.relationship}
                    onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                    placeholder="e.g., Spouse, Child"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={member.dateOfBirth}
                    onChange={(e) => handleFamilyMemberChange(index, 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(index)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Sacraments */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Sacraments Received</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baptism Date</label>
                <input
                  type="date"
                  name="baptismDate"
                  value={formData.baptismDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baptism Location</label>
                <input
                  type="text"
                  name="baptismLocation"
                  value={formData.baptismLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Communion Date</label>
                <input
                  type="date"
                  name="firstCommunionDate"
                  value={formData.firstCommunionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Communion Location</label>
                <input
                  type="text"
                  name="firstCommunionLocation"
                  value={formData.firstCommunionLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Date</label>
                <input
                  type="date"
                  name="confirmationDate"
                  value={formData.confirmationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Location</label>
                <input
                  type="text"
                  name="confirmationLocation"
                  value={formData.confirmationLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Date</label>
                <input
                  type="date"
                  name="marriageDate"
                  value={formData.marriageDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Location</label>
                <input
                  type="text"
                  name="marriageLocation"
                  value={formData.marriageLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Ministries */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Ministries of Interest</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ministries.map((ministry) => (
                <label key={ministry._id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.selectedMinistries.includes(ministry._id)}
                    onChange={() => handleMinistryChange(ministry._id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{ministry.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Additional Notes</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information you'd like to share..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </section>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
