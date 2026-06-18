import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LazyImage from '../components/LazyImage';
import { galleryAPI } from '../services/api';
import { cache, CACHE_KEYS } from '../utils/cache';
import type { GalleryItem } from '../types';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Check cache first
        const cachedData = cache.get<GalleryItem[]>(CACHE_KEYS.GALLERY);
        if (cachedData) {
          setItems(cachedData);
          setLoading(false);
          return;
        }

        // Fetch from API
        const data = await galleryAPI.getAll();
        setItems(data);
        
        // Cache the result (5 minutes)
        cache.set(CACHE_KEYS.GALLERY, data, 5 * 60 * 1000);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Gallery</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Photos and videos from our parish events and activities.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Loading gallery...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-600 text-lg font-medium">No gallery items at this time.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 group"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden">
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for full-size image */}
            {selectedItem && (
              <div
                className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                onClick={() => setSelectedItem(null)}
              >
                <div className="max-w-5xl w-full relative">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                  <div className="bg-white p-6 rounded-b-2xl shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/75 transition-all backdrop-blur-sm"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

