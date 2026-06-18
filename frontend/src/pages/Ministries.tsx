import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { ministriesAPI } from '../services/api';
import type { Ministry } from '../types';

export default function Ministries() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const data = await ministriesAPI.getAll();
        setMinistries(data);
      } catch (error) {
        console.error('Error fetching ministries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMinistries();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Ministries & Groups</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get involved in our parish community through various ministries and groups.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Loading ministries...</p>
            </div>
          </div>
        ) : ministries.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 text-lg font-medium">No ministries listed at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ministries.map((ministry) => (
              <div
                key={ministry._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
              >
                {ministry.photo && (
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={ministry.photo}
                      alt={ministry.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">{ministry.name}</h2>
                  {ministry.leader && (
                    <p className="text-sm text-primary-600 mb-4 font-semibold">
                      Leader: <span className="text-gray-700">{ministry.leader}</span>
                    </p>
                  )}
                  <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                    {ministry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Common Ministries Info */}
        <section className="mt-16 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 p-8 md:p-10 rounded-2xl border-2 border-primary-200 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
              ⛪
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Common Ministries</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">Choir</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Enhance our worship through music and song.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">CWA (Catholic Women Association)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Women's group focused on service and fellowship.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">Youth Group</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Engaging young people in faith and community.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-primary-700 text-lg">Legion of Mary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Dedicated to prayer and apostolic work.</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-800 font-semibold text-center">
            For more information about joining any ministry, please contact the parish office.
          </p>
        </section>
      </div>
    </Layout>
  );
}

