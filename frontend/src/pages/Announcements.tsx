import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LazyImage from '../components/LazyImage';
import { announcementsAPI } from '../services/api';
import { cache, CACHE_KEYS } from '../utils/cache';
import type { Announcement } from '../types';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Check cache first
        const cachedData = cache.get<Announcement[]>(CACHE_KEYS.ANNOUNCEMENTS);
        if (cachedData) {
          setAnnouncements(cachedData);
          setLoading(false);
          return;
        }

        // Fetch from API
        const data = await announcementsAPI.getAll();
        setAnnouncements(data);
        
        // Cache the result (5 minutes)
        cache.set(CACHE_KEYS.ANNOUNCEMENTS, data, 5 * 60 * 1000);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">News & Announcements</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Stay informed about parish news and events</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Loading announcements...</p>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">No announcements at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((announcement) => (
              <Link
                key={announcement._id}
                to={`/announcements/${announcement._id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
              >
                {announcement.image && (
                  <div className="relative overflow-hidden h-56">
                    <LazyImage
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">{announcement.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-4 leading-relaxed">
                    {announcement.content}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-primary-600 text-xs font-semibold">
                      {new Date(announcement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <span className="text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read More <span>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

