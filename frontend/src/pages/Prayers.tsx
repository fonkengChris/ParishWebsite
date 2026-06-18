import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { PRAYER_FILTER_OPTIONS, PRAYER_CATEGORY_OPTIONS } from '../data/constants';
import { prayersAPI } from '../services/api';
import type { Prayer } from '../types';

export default function Prayers() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const data = await prayersAPI.getAll();
        setPrayers(data);
      } catch (error) {
        console.error('Error fetching prayers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrayers();
  }, []);

  const filteredPrayers = selectedCategory === 'all'
    ? prayers
    : prayers.filter(prayer => prayer.category === selectedCategory);

  const getCategoryLabel = (category?: string) => {
    const cat = PRAYER_CATEGORY_OPTIONS.find(c => c.value === category);
    return cat ? cat.label : 'Other';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Prayers</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find prayers for different times of day and occasions.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex justify-center">
          <div className="flex flex-wrap gap-3 justify-center">
            {PRAYER_FILTER_OPTIONS.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-300 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-300 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Loading prayers...</p>
            </div>
          </div>
        ) : filteredPrayers.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
            <div className="text-6xl mb-4">🙏</div>
            <p className="text-gray-600 text-lg font-medium">No prayers found in this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPrayers.map((prayer) => (
              <div
                key={prayer._id}
                className="bg-white rounded-2xl shadow-lg p-8 md:p-10 hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{prayer.title}</h2>
                  {prayer.category && (
                    <span className="px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full text-sm font-semibold whitespace-nowrap border border-primary-300">
                      {getCategoryLabel(prayer.category)}
                    </span>
                  )}
                </div>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                  {prayer.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

