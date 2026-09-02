import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apostolatesAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import type { Apostolate, MeetingSchedule } from '../../types';

interface ApostolateForm {
  name: string;
  description: string;
  meetingSchedules: MeetingSchedule[];
  photo: string;
  isActive: boolean;
}

const emptyForm: ApostolateForm = {
  name: '',
  description: '',
  meetingSchedules: [{ day: '', time: '', location: '' }],
  photo: '',
  isActive: true,
};

const summariseSchedules = (schedules?: MeetingSchedule[]): string => {
  if (!schedules || schedules.length === 0) return '-';
  const first = [schedules[0].day, schedules[0].time].filter(Boolean).join(' · ') || '—';
  return schedules.length > 1 ? `${first} (+${schedules.length - 1} more)` : first;
};

export default function ManageApostolates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [apostolates, setApostolates] = useState<Apostolate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Apostolate | null>(null);
  const [formData, setFormData] = useState<ApostolateForm>(emptyForm);
  const hasFetchedRef = useRef(false);

  const fetchApostolates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apostolatesAPI.getAllAdmin();
      setApostolates(data);
    } catch (error) {
      console.error('Error fetching apostolates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchApostolates();
    }
  }, [navigate, fetchApostolates]);

  const handleScheduleChange = (index: number, field: keyof MeetingSchedule, value: string) => {
    const updated = [...formData.meetingSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, meetingSchedules: updated });
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      meetingSchedules: [...formData.meetingSchedules, { day: '', time: '', location: '' }],
    });
  };

  const removeSchedule = (index: number) => {
    setFormData({
      ...formData,
      meetingSchedules: formData.meetingSchedules.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Keep only schedule rows that have at least one field filled in.
      const meetingSchedules = formData.meetingSchedules.filter(
        (s) => (s.day || '').trim() || (s.time || '').trim() || (s.location || '').trim()
      );
      const submitData = {
        name: formData.name,
        description: formData.description,
        photo: formData.photo || undefined,
        isActive: formData.isActive,
        meetingSchedules,
      };
      if (editing) {
        await apostolatesAPI.update(editing._id, submitData);
      } else {
        await apostolatesAPI.create(submitData);
      }
      setShowForm(false);
      setEditing(null);
      setFormData(emptyForm);
      fetchApostolates();
    } catch (error) {
      console.error('Error saving apostolate:', error);
      alert('Failed to save apostolate');
    }
  };

  const handleEdit = (apostolate: Apostolate) => {
    setEditing(apostolate);
    setFormData({
      name: apostolate.name,
      description: apostolate.description,
      meetingSchedules:
        apostolate.meetingSchedules && apostolate.meetingSchedules.length > 0
          ? apostolate.meetingSchedules.map((s) => ({
              day: s.day || '',
              time: s.time || '',
              location: s.location || '',
            }))
          : [{ day: '', time: '', location: '' }],
      photo: apostolate.photo || '',
      isActive: apostolate.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this apostolate?')) return;
    try {
      await apostolatesAPI.delete(id);
      fetchApostolates();
    } catch (error) {
      console.error('Error deleting apostolate:', error);
      alert('Failed to delete apostolate');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Apostolates</h1>
                <p className="text-sm text-gray-500">Organize parish apostolates and their meeting schedules</p>
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
            <h2 className="text-xl font-semibold text-gray-900">
              {showForm ? (editing ? 'Edit Apostolate' : 'Create New Apostolate') : 'All Apostolates'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {apostolates.length} {apostolates.length === 1 ? 'apostolate' : 'apostolates'} total
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setFormData(emptyForm);
              }}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Apostolate
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Edit Apostolate' : 'Create New Apostolate'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Apostolate name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                  placeholder="Describe the apostolate — you can include the leader and contact details here."
                />
              </div>

              {/* Meeting schedules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Meeting Schedules</label>
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add schedule
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Add one row per meeting time. Leave all fields blank to skip.
                </p>
                <div className="space-y-3">
                  {formData.meetingSchedules.map((schedule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                        <input
                          type="text"
                          value={schedule.day || ''}
                          onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="e.g. Every Thursday"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                        <input
                          type="text"
                          value={schedule.time || ''}
                          onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="e.g. 5:00 PM"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={schedule.location || ''}
                          onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="e.g. Parish Hall"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeSchedule(index)}
                          disabled={formData.meetingSchedules.length === 1}
                          className="w-full px-2 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-600"
                          aria-label="Remove schedule"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                  Active (visible to visitors)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {editing ? 'Update Apostolate' : 'Create Apostolate'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading apostolates...</p>
          </div>
        ) : apostolates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No apostolates found</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by creating a new apostolate.</p>
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setFormData(emptyForm);
              }}
              className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Apostolate
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Meeting Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apostolates.map((apostolate) => (
                    <tr key={apostolate._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{apostolate.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {summariseSchedules(apostolate.meetingSchedules)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            apostolate.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {apostolate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(apostolate)}
                            className="text-green-600 hover:text-green-900 transition-colors font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(apostolate._id)}
                            className="text-red-600 hover:text-red-900 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
