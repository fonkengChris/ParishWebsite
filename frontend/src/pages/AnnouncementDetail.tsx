import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { announcementsAPI } from '../services/api';
import type { Announcement } from '../types';

export default function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;
      try {
        const data = await announcementsAPI.getById(id);
        setAnnouncement(data);
      } catch (error) {
        console.error('Error fetching announcement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!announcement) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 text-center shadow-lg">
            <p className="text-red-800 font-semibold text-lg mb-6">Announcement not found.</p>
            <Link to="/announcements" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Announcements
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/announcements"
          className="text-primary-600 hover:text-primary-700 mb-8 inline-flex items-center gap-2 font-semibold group px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Announcements
        </Link>

        {announcement.image && (
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-8 border-2 border-gray-200">
            <img
              src={announcement.image}
              alt={announcement.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{announcement.title}</h1>
          <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="text-primary-600 font-semibold text-lg">
                {new Date(announcement.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
              {announcement.content}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

