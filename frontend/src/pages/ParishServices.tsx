import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { sacramentsAPI, parishServicesAPI } from '../services/api';
import { useParish } from '../contexts/ParishContext';
import type { Sacrament, ParishService } from '../types';

// Split a multi-line string into individual points.
const toLines = (value?: string): string[] =>
  (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export default function ParishServices() {
  const { parish } = useParish();
  const [sacraments, setSacraments] = useState<Sacrament[]>([]);
  const [services, setServices] = useState<ParishService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sacramentData, serviceData] = await Promise.all([
          sacramentsAPI.getAll(),
          parishServicesAPI.getAll(),
        ]);
        setSacraments(sacramentData);
        setServices(serviceData);
      } catch (error) {
        console.error('Error fetching parish services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mb-3">
          Parish Services
        </p>
        <h1 className="font-serif font-medium text-ink leading-[1.05] tracking-tight text-[2.5rem] sm:text-6xl mb-5">
          Services &amp; Formation
        </h1>
        <p className="text-ink-soft text-lg max-w-2xl mx-auto leading-relaxed">
          From the sacraments to youth formation and small Christian communities, here is how{' '}
          {parish.name} accompanies you at every step of your faith journey.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-ink-soft text-lg font-medium">Loading services…</p>
            </div>
          </div>
        ) : (
          <>
            {/* The Sacraments */}
            <section id="sacraments" className="scroll-mt-24 mb-16">
              <div className="mb-6">
                <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-2">
                  The Heart of Our Faith
                </p>
                <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl">
                  The Sacraments
                </h2>
              </div>

              {sacraments.length === 0 ? (
                <div className="text-center py-16 bg-ivory-2 rounded-3xl border border-line">
                  <p className="text-4xl text-gold mb-3" aria-hidden="true">✝</p>
                  <p className="text-ink-soft font-medium">
                    Sacrament information is being prepared. Please contact the parish office in
                    the meantime.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sacraments.map((sacrament) => {
                    const steps = toLines(sacrament.procedure);
                    return (
                      <article
                        key={sacrament._id}
                        className="bg-white border border-line rounded-2xl p-7 md:p-9"
                      >
                        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-3">
                          {sacrament.name}
                        </h3>
                        {sacrament.description && (
                          <p className="text-ink-soft text-lg leading-relaxed mb-6">
                            {sacrament.description}
                          </p>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          {sacrament.availability && (
                            <div className="lit-soft-panel rounded-xl p-5">
                              <p className="text-[0.68rem] tracking-[0.18em] uppercase font-bold text-primary-700 mb-2">
                                Availability
                              </p>
                              <p className="text-ink text-sm leading-relaxed whitespace-pre-line">
                                {sacrament.availability}
                              </p>
                            </div>
                          )}

                          {steps.length > 0 && (
                            <div className="bg-ivory-2 rounded-xl p-5 border border-line">
                              <p className="text-[0.68rem] tracking-[0.18em] uppercase font-bold text-primary-700 mb-3">
                                How to prepare
                              </p>
                              <ul className="space-y-2.5">
                                {steps.map((step, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm text-ink">
                                    <span className="text-gold font-bold mt-0.5" aria-hidden="true">
                                      ✦
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Formation & Community */}
            {services.length > 0 && (
              <section id="formation" className="scroll-mt-24 mb-16">
                <div className="mb-6">
                  <p className="text-xs tracking-[0.2em] uppercase font-bold text-gold mb-2">
                    Growing Together
                  </p>
                  <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl">
                    Formation &amp; Community
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {services.map((service) => {
                    const points = toLines(service.details);
                    return (
                      <article
                        key={service._id}
                        className="flex flex-col bg-white border border-line rounded-2xl p-7"
                      >
                        <h3 className="font-serif text-xl md:text-2xl font-semibold text-ink mb-2">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-ink-soft leading-relaxed mb-4">
                            {service.description}
                          </p>
                        )}
                        {points.length > 0 && (
                          <ul className="mt-auto space-y-2.5 pt-2">
                            {points.map((point, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                                <span className="text-gold font-bold mt-0.5" aria-hidden="true">
                                  ✦
                                </span>
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* Closing panel */}
        <section className="lit-soft-panel rounded-3xl p-8 md:p-10 mt-2">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mb-3">
            Need More Information?
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink mb-4">
            We are here to guide you
          </h2>
          <p className="text-ink-soft leading-relaxed max-w-2xl mb-6">
            To request a sacrament, join a group, or ask any question, please contact the parish
            office. We would be glad to walk with you through these important moments in your faith
            journey.
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
