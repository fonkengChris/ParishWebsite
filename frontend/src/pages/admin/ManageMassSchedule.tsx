import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { massScheduleAPI, missionStationsAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import type { MassSchedule, MissionStation } from '../../types';
import { DAYS_OF_WEEK, MASS_SCHEDULE_TYPES, type MassScheduleType } from '../../data/constants';

export default function ManageMassSchedule() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);
  const [missionStations, setMissionStations] = useState<MissionStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MassSchedule | null>(null);
  const [formData, setFormData] = useState<{
    missionStation: string;
    dayOfWeek: typeof DAYS_OF_WEEK[number];
    time: string;
    type: MassScheduleType;
    description: string;
    isActive: boolean;
  }>({
    missionStation: '',
    dayOfWeek: DAYS_OF_WEEK[0],
    time: '',
    type: MASS_SCHEDULE_TYPES[0],
    description: '',
    isActive: true,
  });
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedulesData, stationsData] = await Promise.all([
        massScheduleAPI.getAllAdmin(),
        missionStationsAPI.getAllAdmin(),
      ]);
      setSchedules(schedulesData);
      setMissionStations(stationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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

    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [navigate, fetchData]);

  // Convert 12-hour time format to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    // Handle already 24-hour format (HH:MM)
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time12h)) {
      return time12h;
    }

    // Parse 12-hour format (e.g., "4:00 PM" or "11:30 AM")
    const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
      throw new Error('Invalid time format. Please use format like "4:00 PM" or "16:00"');
    }

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Convert 24-hour time format to 12-hour format
  const convertTo12Hour = (time24h: string): string => {
    // Handle already 12-hour format
    if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(time24h)) {
      return time24h;
    }

    // Parse 24-hour format (e.g., "16:00" or "08:30")
    const match = time24h.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return time24h; // Return as-is if can't parse
    }

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }

    return `${hours}:${minutes} ${period}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert time to 24-hour format
      const submitData = {
        ...formData,
        time: convertTo24Hour(formData.time),
      };

      if (editing) {
        await massScheduleAPI.update(editing._id, submitData);
      } else {
        await massScheduleAPI.create(submitData);
      }
      setShowForm(false);
      setEditing(null);
      setFormData({
        missionStation: '',
        dayOfWeek: DAYS_OF_WEEK[0],
        time: '',
        type: MASS_SCHEDULE_TYPES[0],
        description: '',
        isActive: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(error instanceof Error ? error.message : 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule: MassSchedule) => {
    setEditing(schedule);
    // Get mission station ID (handle both object and string)
    const stationId = typeof schedule.missionStation === 'object' && schedule.missionStation !== null
      ? schedule.missionStation._id
      : schedule.missionStation;
    
    // Convert dayOfWeek to lowercase for form (backend expects lowercase)
    const dayOfWeekLower = schedule.dayOfWeek.toLowerCase() as typeof DAYS_OF_WEEK[number];
    
    setFormData({
      missionStation: stationId,
      dayOfWeek: dayOfWeekLower,
      time: convertTo12Hour(schedule.time), // Convert 24-hour to 12-hour for display
      type: schedule.type as MassScheduleType,
      description: schedule.description || '',
      isActive: schedule.isActive || true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await massScheduleAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  if (!user) return null;

  // Helper to get mission station ID
  const getStationId = (schedule: MassSchedule): string => {
    if (typeof schedule.missionStation === 'object' && schedule.missionStation !== null) {
      return schedule.missionStation._id;
    }
    return typeof schedule.missionStation === 'string' ? schedule.missionStation : '';
  };

  // Helper to get mission station name
  const getStationName = (schedule: MassSchedule): string => {
    if (typeof schedule.missionStation === 'object' && schedule.missionStation !== null) {
      return schedule.missionStation.name;
    }
    return 'Unknown Station';
  };

  // Group schedules by mission station
  const stationMap = new Map<string, { name: string; schedules: MassSchedule[] }>();
  
  schedules.forEach(schedule => {
    const stationId = getStationId(schedule);
    const stationName = getStationName(schedule);
    
    if (!stationMap.has(stationId)) {
      stationMap.set(stationId, { name: stationName, schedules: [] });
    }
    stationMap.get(stationId)!.schedules.push(schedule);
  });

  const groupedSchedules = Array.from(stationMap.entries())
    .map(([stationId, { name, schedules: stationSchedules }]) => ({
      stationId,
      stationName: name,
      schedules: stationSchedules,
    }))
    .sort((a, b) => a.stationName.localeCompare(b.stationName));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">⛪</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Mass Schedule</h1>
                <p className="text-sm text-gray-500">Manage mass schedules by mission station</p>
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
              {showForm ? (editing ? 'Edit Schedule' : 'Create New Schedule') : 'Mass Schedules'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {schedules.length} {schedules.length === 1 ? 'schedule' : 'schedules'} across {groupedSchedules.length} {groupedSchedules.length === 1 ? 'station' : 'stations'}
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setFormData({
                  missionStation: '',
                  dayOfWeek: DAYS_OF_WEEK[0],
                  time: '',
                  type: MASS_SCHEDULE_TYPES[0],
                  description: '',
                  isActive: true,
                });
              }}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Schedule
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Edit Schedule' : 'Create New Schedule'}
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
                  Mission Station <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.missionStation}
                  onChange={(e) => setFormData({ ...formData, missionStation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a mission station</option>
                  {missionStations.map(station => (
                    <option key={station._id} value={station._id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Day of Week <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as typeof DAYS_OF_WEEK[number] })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 8:00 AM"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MassScheduleType })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  {MASS_SCHEDULE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {editing ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading schedules...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No schedules found</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by creating a new mass schedule.</p>
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setFormData({
                  missionStation: '',
                  dayOfWeek: DAYS_OF_WEEK[0],
                  time: '',
                  type: MASS_SCHEDULE_TYPES[0],
                  description: '',
                  isActive: true,
                });
              }}
              className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedSchedules.map(({ stationId, stationName, schedules: stationSchedules }) => (
              <div key={stationId} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {stationName}
                  </h2>
                  <p className="text-sm text-indigo-100 mt-1">
                    {stationSchedules.length} {stationSchedules.length === 1 ? 'schedule' : 'schedules'}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Description
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
                      {stationSchedules.map((schedule) => (
                        <tr key={schedule._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {schedule.dayOfWeek.charAt(0).toUpperCase() + schedule.dayOfWeek.slice(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {convertTo12Hour(schedule.time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{schedule.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {schedule.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                schedule.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {schedule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(schedule)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(schedule._id)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

