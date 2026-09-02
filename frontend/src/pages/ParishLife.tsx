import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { apostolatesAPI } from '../services/api';
import { useParish } from '../contexts/ParishContext';
import type { Apostolate, MeetingSchedule } from '../types';

export default function ParishLife() {
  const { parish } = useParish();
  const [apostolates, setApostolates] = useState<Apostolate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApostolates = async () => {
      try {
        const data = await apostolatesAPI.getAll();
        setApostolates(data);
      } catch (error) {
        console.error('Error fetching apostolates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApostolates();
  }, []);

  const formatSchedule = (s: MeetingSchedule) =>
    [s.day, s.time, s.location].filter(Boolean).join(' · ');

  return (
    <Layout>
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mb-3">
          Parish Life
        </p>
        <h1 className="font-serif font-medium text-ink leading-[1.05] tracking-tight text-[2.5rem] sm:text-6xl mb-5">
          Our Apostolates
        </h1>
        <p className="text-ink-soft text-lg max-w-2xl mx-auto leading-relaxed">
          {parish.name} is kept alive by its groups and apostolates — communities of prayer,
          service, and fellowship. Find one that speaks to you, and see when they gather.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-ink-soft text-lg font-medium">Loading apostolates…</p>
            </div>
          </div>
        ) : apostolates.length === 0 ? (
          <div className="text-center py-20 bg-ivory-2 rounded-3xl border border-line">
            <p className="text-4xl text-gold mb-4" aria-hidden="true">✝</p>
            <p className="text-ink-soft text-lg font-medium">
              No apostolates are listed at this time. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apostolates.map((apostolate) => (
              <article
                key={apostolate._id}
                className="flex flex-col bg-white border border-line rounded-2xl overflow-hidden hover:border-primary-600 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
              >
                {apostolate.photo && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={apostolate.photo}
                      alt={apostolate.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-6">
                  <h2 className="font-serif text-xl font-semibold text-ink mb-3">
                    {apostolate.name}
                  </h2>

                  <p className="text-ink-soft text-sm leading-relaxed">
                    {apostolate.description}
                  </p>

                  {apostolate.meetingSchedules && apostolate.meetingSchedules.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-line">
                      <p className="text-[0.68rem] tracking-[0.15em] uppercase font-bold text-primary-700 mb-2">
                        {apostolate.meetingSchedules.length > 1 ? 'Meeting Schedules' : 'Meeting Schedule'}
                      </p>
                      <ul className="space-y-1.5">
                        {apostolate.meetingSchedules.map((schedule, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ink">
                            <span className="text-gold mt-0.5" aria-hidden="true">✦</span>
                            <span className="leading-relaxed">{formatSchedule(schedule)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Closing panel */}
        <section className="lit-soft-panel rounded-3xl p-8 md:p-10 mt-14">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mb-3">
            Get Involved
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink mb-4">
            There is a place for you here
          </h2>
          <p className="text-ink-soft leading-relaxed max-w-2xl mb-6">
            Whether you are drawn to prayer, music, charity, or fellowship, you are warmly
            welcome to join. To learn more about any apostolate or how to take part, please
            reach out to the parish office.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all duration-200"
          >
            Contact the Parish Office
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </Layout>
  );
}
