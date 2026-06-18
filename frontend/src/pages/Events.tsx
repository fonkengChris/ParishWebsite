import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LazyImage from '../components/LazyImage';
import { eventsAPI } from '../services/api';
import { cache, CACHE_KEYS } from '../utils/cache';
import type { Event } from '../types';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Check cache first
        const cachedData = cache.get<Event[]>(CACHE_KEYS.EVENTS);
        if (cachedData) {
          setEvents(cachedData);
          setLoading(false);
          return;
        }

        // Fetch from API
        const data = await eventsAPI.getAll();
        setEvents(data);
        
        // Cache the result (5 minutes)
        cache.set(CACHE_KEYS.EVENTS, data, 5 * 60 * 1000);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (end && start.toDateString() !== end.toDateString()) {
      return `${start.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })} - ${end.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`;
    }
    
    return formatDate(startDate);
  };

  // Filter upcoming events (events with startDate >= today)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  // Filter past events
  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Upcoming Events</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join us for special celebrations, gatherings, and community events
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Scheduled</h2>
            <p className="text-gray-600 text-lg">Check back soon for upcoming parish events.</p>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
                    >
                      {event.image && (
                        <div className="relative overflow-hidden h-56">
                          <LazyImage
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Event+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {event.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                          <div className="flex items-start gap-2">
                            <span className="text-primary-600 text-sm font-semibold">📅</span>
                            <p className="text-primary-600 text-xs font-semibold flex-1">
                              {formatDateRange(event.startDate, event.endDate)}
                            </p>
                          </div>
                          {event.location && (
                            <div className="flex items-start gap-2">
                              <span className="text-primary-600 text-sm font-semibold">📍</span>
                              <p className="text-gray-600 text-xs flex-1">{event.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group opacity-75"
                    >
                      {event.image && (
                        <div className="relative overflow-hidden h-56">
                          <LazyImage
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Event+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {event.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                          <div className="flex items-start gap-2">
                            <span className="text-primary-600 text-sm font-semibold">📅</span>
                            <p className="text-primary-600 text-xs font-semibold flex-1">
                              {formatDateRange(event.startDate, event.endDate)}
                            </p>
                          </div>
                          {event.location && (
                            <div className="flex items-start gap-2">
                              <span className="text-primary-600 text-sm font-semibold">📍</span>
                              <p className="text-gray-600 text-xs flex-1">{event.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

