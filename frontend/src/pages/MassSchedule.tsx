import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { massScheduleAPI, missionStationsAPI } from '../services/api';
import type { MassSchedule, MissionStation } from '../types';
import { DAYS_OF_WEEK } from '../data/constants';

export default function MassSchedulePage() {
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);
  const [missionStations, setMissionStations] = useState<MissionStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsData, schedulesData] = await Promise.all([
          missionStationsAPI.getAll(),
          massScheduleAPI.getAll(selectedStation || undefined),
        ]);
        setMissionStations(stationsData);
        setSchedules(schedulesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedStation]);

  // Helper to get mission station info from schedule
  const getStationInfo = (schedule: MassSchedule): { id: string; name: string } | null => {
    if (typeof schedule.missionStation === 'object' && schedule.missionStation !== null) {
      return {
        id: schedule.missionStation._id,
        name: schedule.missionStation.name,
      };
    }
    return null;
  };

  // Group schedules by mission station
  const stationMap = new Map<string, { name: string; schedules: MassSchedule[] }>();

  schedules.forEach((schedule) => {
    const stationInfo = getStationInfo(schedule);
    if (stationInfo) {
      if (!stationMap.has(stationInfo.id)) {
        stationMap.set(stationInfo.id, { name: stationInfo.name, schedules: [] });
      }
      stationMap.get(stationInfo.id)!.schedules.push(schedule);
    }
  });

  // Build cards data - one card per station
  type StationCard = {
    stationId: string;
    stationName: string;
    schedulesByDay: Array<{ day: typeof DAYS_OF_WEEK[number]; schedules: MassSchedule[] }>;
  };

  const stationCards = Array.from(stationMap.entries())
    .map(([stationId, { name: stationName, schedules: stationSchedules }]): StationCard | null => {
      // Filter by selected station if needed
      if (selectedStation && stationId !== selectedStation) {
        return null;
      }

      // Group schedules by day
      const schedulesByDay = DAYS_OF_WEEK.map(day => ({
        day: day as typeof DAYS_OF_WEEK[number],
        schedules: stationSchedules.filter(s => s.dayOfWeek === day),
      }));

      return {
        stationId,
        stationName,
        schedulesByDay,
      };
    })
    .filter((item): item is StationCard =>
      item !== null && item.schedulesByDay.some(d => d.schedules.length > 0)
    )
    .sort((a, b) => a.stationName.localeCompare(b.stationName));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Mass & Service Schedule</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Mass times for all mission stations in our parish.
          </p>
        </div>

        {/* Filter by Mission Station */}
        <div className="mb-10 max-w-md mx-auto">
          <label htmlFor="station-filter" className="block text-sm font-semibold text-gray-700 mb-3">
            Filter by Mission Station
          </label>
          <select
            id="station-filter"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-md hover:shadow-lg transition-all font-medium"
          >
            <option value="">All Mission Stations</option>
            {missionStations.map((station) => (
              <option key={station._id} value={station._id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Loading schedule...</p>
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-10 text-center shadow-xl">
            <div className="text-6xl mb-4">⏰</div>
            <p className="text-yellow-800 text-lg font-semibold">
              Schedule information will be posted here soon.
            </p>
          </div>
        ) : stationCards.length === 0 ? (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-10 shadow-xl">
            <div className="text-6xl mb-4 text-center">📍</div>
            <p className="text-yellow-800 mb-3 text-lg font-semibold text-center">
              No mission stations found. Please run the seed script to create mission stations and schedules.
            </p>
            <p className="text-sm text-yellow-700 text-center">
              Run: <code className="bg-yellow-200 px-3 py-1 rounded-lg font-mono">cd backend && npm run seed-schedules:clear</code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stationCards.map(({ stationId, stationName, schedulesByDay }) => (
              <div
                key={stationId}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-primary-700 to-primary-800 text-white px-6 py-5">
                  <h2 className="text-xl font-bold text-center">{stationName}</h2>
                  {missionStations.find(s => s._id === stationId)?.location && (
                    <p className="text-sm text-primary-100 text-center mt-2">
                      {missionStations.find(s => s._id === stationId)?.location}
                    </p>
                  )}
                </div>

                {/* Card Body - Schedules by Day */}
                <div className="p-6">
                  <div className="space-y-6">
                    {schedulesByDay.map(({ day, schedules: daySchedules }: { day: typeof DAYS_OF_WEEK[number]; schedules: MassSchedule[] }) => {
                      if (daySchedules.length === 0) return null;
                      
                      return (
                        <div key={day} className="border-b-2 border-gray-100 last:border-0 pb-5 last:pb-0">
                          <h3 className="text-base font-bold mb-4 text-primary-700 uppercase tracking-wider">
                            {day}
                          </h3>
                          <div className="space-y-3">
                            {daySchedules.map((schedule: MassSchedule) => (
                              <div
                                key={schedule._id}
                                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-gray-100"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-xl font-bold text-gray-900">
                                        {schedule.time}
                                      </span>
                                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                        schedule.type === 'Mass'
                                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                          : schedule.type === 'Confession'
                                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                          : schedule.type === 'Adoration'
                                          ? 'bg-green-100 text-green-700 border border-green-200'
                                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                                      }`}>
                                        {schedule.type}
                                      </span>
                                    </div>
                                    {schedule.description && (
                                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                        {schedule.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Information */}
        <section className="mt-16 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 p-8 md:p-10 rounded-2xl border-2 border-primary-200 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
              📅
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Additional Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">Confession</h3>
              <p className="text-gray-600 leading-relaxed">Please contact the parish office for confession schedule.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">Adoration</h3>
              <p className="text-gray-600 leading-relaxed">Please contact the parish office for adoration schedule.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">Special Services</h3>
              <p className="text-gray-600 leading-relaxed">
                For information about special services and events, please check our{' '}
                <a href="/announcements" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2 transition-colors">
                  announcements page
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
