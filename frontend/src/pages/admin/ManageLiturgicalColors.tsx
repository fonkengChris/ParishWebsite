import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { liturgicalColorAPI, liturgicalColorOverridesAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import { useTheme } from '../../contexts/ThemeContext';
import type { LiturgicalColorResponse, ColorOverride } from '../../services/api';

const COLOR_OPTIONS = [
  { value: 'white', label: 'White', hex: '#ffffff', description: 'Christmas & Easter seasons' },
  { value: 'red', label: 'Red', hex: '#dc2626', description: 'Palm Sunday, Good Friday, Pentecost' },
  { value: 'green', label: 'Green', hex: '#16a34a', description: 'Ordinary Time' },
  { value: 'purple', label: 'Purple', hex: '#9333ea', description: 'Advent & Lent' },
  { value: 'rose', label: 'Rose', hex: '#e11d48', description: 'Gaudete & Laetare Sundays' },
  { value: 'gold', label: 'Gold', hex: '#f59e0b', description: 'Special celebrations' },
];

export default function ManageLiturgicalColors() {
  const navigate = useNavigate();
  const { refreshColor } = useTheme();
  const [user, setUser] = useState(getStoredUser());
  const [overrides, setOverrides] = useState<ColorOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOverride, setEditingOverride] = useState<ColorOverride | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    color: 'white' as ColorOverride['color'],
    reason: '',
  });
  const [currentColor, setCurrentColor] = useState<LiturgicalColorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchingColorRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchOverrides = useCallback(async () => {
    try {
      setLoading(true);
      const data = await liturgicalColorOverridesAPI.getAll();
      setOverrides(data.overrides || []);
    } catch (err: any) {
      console.error('Error fetching overrides:', err);
      
      // Handle different error types
      let errorMessage = 'Failed to load overrides';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.status) {
        const status = err.response.status;
        const statusText = err.response.statusText || 'Unknown Error';
        errorMessage = `${status} ${statusText}`;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for JSON parse errors specifically
      if (err?.message?.includes('JSON.parse') || err?.name === 'SyntaxError') {
        errorMessage = 'Server returned an invalid response. Please check if the API endpoint is correct.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentColor = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (fetchingColorRef.current) {
      return;
    }
    
    try {
      fetchingColorRef.current = true;
      const color = await liturgicalColorAPI.getCurrent();
      setCurrentColor(color);
    } catch (err) {
      console.error('Error fetching current color:', err);
      // Don't set error state for current color failures, just log it
    } finally {
      fetchingColorRef.current = false;
    }
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOverrides();
      fetchCurrentColor();
    }
  }, [navigate, fetchOverrides, fetchCurrentColor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingOverride) {
        await liturgicalColorOverridesAPI.update(formData.date, {
          color: formData.color,
          reason: formData.reason,
        });
      } else {
        await liturgicalColorOverridesAPI.create({
          date: formData.date,
          color: formData.color,
          reason: formData.reason,
        });
      }

      await fetchOverrides();
      await fetchCurrentColor();
      // Refresh the theme to apply the new override immediately
      await refreshColor();
      resetForm();
    } catch (err) {
      console.error('Error saving override:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save override';
      setError(errorMessage);
    }
  };

  const handleEdit = (override: ColorOverride) => {
    setEditingOverride(override);
    setFormData({
      date: override.date.split('T')[0],
      color: override.color,
      reason: override.reason || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (date: string) => {
    if (!confirm('Are you sure you want to delete this color override?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/liturgical-color-overrides/${date}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete override');
      
      await fetchOverrides();
      await fetchCurrentColor();
      // Refresh the theme to apply changes immediately
      await refreshColor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete override');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      color: 'white',
      reason: '',
    });
    setEditingOverride(null);
    setShowForm(false);
  };

  const getColorInfo = (colorName: string) => {
    return COLOR_OPTIONS.find(c => c.value === colorName) || COLOR_OPTIONS[0];
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Liturgical Colors</h1>
                <p className="text-sm text-gray-500">Override the automatic liturgical color for specific dates</p>
              </div>
            </div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Color Display */}
        {currentColor && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Liturgical Color</h2>
            <div className="flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-xl shadow-lg border-4 border-gray-100"
                style={{ backgroundColor: currentColor.hex }}
              ></div>
              <div>
                <p className="text-3xl font-bold capitalize text-gray-900 mb-1">{currentColor.color}</p>
                <p className="text-sm text-gray-600 font-medium">{currentColor.date}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingOverride ? 'Edit Color Override' : 'Add Color Override'}
              </h2>
              <button
                onClick={resetForm}
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
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Color <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {COLOR_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.color === option.value
                          ? 'border-rose-600 bg-rose-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={option.value}
                        checked={formData.color === option.value}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value as ColorOverride['color'] })}
                        className="sr-only"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: option.hex }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Special feast day, local celebration..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg hover:from-rose-700 hover:to-rose-800 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {editingOverride ? 'Update Override' : 'Add Override'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Color Overrides</h2>
            <p className="text-sm text-gray-500 mt-1">
              {overrides.length} {overrides.length === 1 ? 'override' : 'overrides'} configured
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg hover:from-rose-700 hover:to-rose-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Color Override
            </button>
          )}
        </div>

        {/* Overrides List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading overrides...</p>
            </div>
          ) : overrides.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No color overrides configured</h3>
              <p className="mt-2 text-sm text-gray-500">Add an override to manually set the liturgical color for a specific date.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg hover:from-rose-700 hover:to-rose-800 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Color Override
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {overrides.map((override) => {
                const colorInfo = getColorInfo(override.color);
                return (
                  <div key={override._id || override.date} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-xl shadow-md border-2 border-gray-100 flex-shrink-0"
                          style={{ backgroundColor: colorInfo.hex }}
                        ></div>
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            {new Date(override.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm font-semibold text-gray-700 capitalize mt-1">{colorInfo.label}</p>
                          {override.reason && (
                            <p className="text-sm text-gray-600 mt-2">{override.reason}</p>
                          )}
                          {override.createdBy && (
                            <p className="text-xs text-gray-400 mt-2">
                              Created by {override.createdBy.username || override.createdBy.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(override)}
                          className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 hover:border-rose-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(override.date)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

