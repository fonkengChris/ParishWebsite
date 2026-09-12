import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LazyImage from '../components/LazyImage';
import { useParish } from '../contexts/ParishContext';
import { useSiteContent } from '../contexts/SiteContentContext';
import { fillParishTokens } from '../data/defaultSiteContent';
import { galleryAPI } from '../services/api';
import { cache, CACHE_KEYS } from '../utils/cache';
import type { GalleryItem } from '../types';

export default function AboutUs() {
  const { parish } = useParish();
  const { content } = useSiteContent();
  const about = content.about;
  const t = (s: string) => fillParishTokens(s, parish);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const cachedData = cache.get<GalleryItem[]>(CACHE_KEYS.GALLERY);
        if (cachedData) {
          setGalleryItems(cachedData);
          setGalleryLoading(false);
          return;
        }
        const data = await galleryAPI.getAll();
        setGalleryItems(data);
        cache.set(CACHE_KEYS.GALLERY, data, 5 * 60 * 1000);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      } finally {
        setGalleryLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mb-3">
            {parish.diocese}
          </p>
          <h1 className="font-serif font-medium text-ink text-5xl md:text-6xl leading-tight">
            {parish.name}
          </h1>
          <p className="text-ink-soft text-lg max-w-2xl mx-auto mt-4">{about.subHero}</p>
        </div>

        {/* History */}
        <section className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-2">Our Story</p>
          <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl mb-6">Our History</h2>
          <div className="bg-white border border-line rounded-3xl p-8 md:p-10 space-y-4">
            {about.historyParagraphs.map((para, i) => (
              <p key={i} className="text-ink-soft leading-relaxed text-lg">
                {t(para)}
              </p>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-2">What Drives Us</p>
          <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl mb-6">Our Mission</h2>
          <div className="lit-soft-panel rounded-3xl p-8 md:p-10">
            <p className="text-ink font-semibold text-lg mb-6">{about.missionIntro}</p>
            <ul className="space-y-4 text-ink-soft text-lg">
              {about.missionPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-primary-600 font-serif text-xl mt-0.5" aria-hidden="true">
                    ✝
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pastoral Team */}
        <section className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-2">Those Who Serve</p>
          <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl mb-6">Pastoral Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.pastoralTeam.map((member, i) => {
              const label = member.name || member.role;
              const initials = label
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();
              return (
                <div
                  key={i}
                  className="bg-white border border-line rounded-2xl p-7 text-center flex flex-col items-center hover:border-primary-600 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={label}
                      className="w-28 h-28 rounded-full object-cover border border-line mb-5"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-ivory-2 border border-line flex items-center justify-center mb-5">
                      <span className="font-display text-2xl text-primary-700">{initials || '✝'}</span>
                    </div>
                  )}
                  {member.name ? (
                    <>
                      <h3 className="font-serif font-semibold text-xl text-ink">{member.name}</h3>
                      <p className="text-xs tracking-[0.15em] uppercase font-bold text-gold mt-1 mb-3">{member.role}</p>
                    </>
                  ) : (
                    <h3 className="font-serif font-semibold text-xl text-ink mb-3">{member.role}</h3>
                  )}
                  <p className="text-ink-soft leading-relaxed text-sm">{member.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="mb-16 scroll-mt-24">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-2">In Pictures</p>
          <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl mb-6">Parish Gallery</h2>

          {galleryLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                <p className="text-ink-soft font-medium">Loading gallery…</p>
              </div>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-16 bg-ivory-2 rounded-3xl border border-line">
              <p className="text-4xl text-gold mb-3" aria-hidden="true">✝</p>
              <p className="text-ink-soft font-medium">No gallery images at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="group text-left bg-white border border-line rounded-2xl overflow-hidden hover:border-primary-600 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  <div className="relative overflow-hidden">
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-ink group-hover:text-primary-700 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Get in Touch */}
        <section className="bg-stone text-stone-ivory rounded-3xl p-8 md:p-10 text-center">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-3">Get in Touch</p>
          <p className="text-stone-ivory text-lg leading-relaxed max-w-xl mx-auto">
            {t(about.getInTouch)}
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-stone bg-primary-400 hover:brightness-110 transition-all duration-200"
          >
            Contact the Office <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      {/* Lightbox modal for full-size gallery image */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div className="max-w-5xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="bg-white p-6 rounded-b-2xl shadow-lg">
              <h3 className="font-serif text-2xl font-semibold text-ink">{selectedItem.title}</h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/75 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
