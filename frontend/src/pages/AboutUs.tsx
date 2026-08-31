import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useParish } from '../contexts/ParishContext';
import { useSiteContent } from '../contexts/SiteContentContext';
import { fillParishTokens } from '../data/defaultSiteContent';

export default function AboutUs() {
  const { parish } = useParish();
  const { content } = useSiteContent();
  const about = content.about;
  const t = (s: string) => fillParishTokens(s, parish);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {about.pastoralTeam.map((member, i) => (
              <div
                key={i}
                className="bg-white border border-line rounded-2xl p-7 hover:border-primary-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="font-serif font-semibold text-xl text-ink mb-2">{member.role}</h3>
                <p className="text-ink-soft leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
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
    </Layout>
  );
}
