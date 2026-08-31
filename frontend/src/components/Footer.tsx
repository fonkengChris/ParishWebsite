import { Link } from 'react-router-dom';
import { useParish } from '../contexts/ParishContext';

export default function Footer() {
  const { parish } = useParish();
  const currentYear = new Date().getFullYear();

  const columns: { heading: string; links: { to: string; label: string }[] }[] = [
    {
      heading: 'Worship',
      links: [
        { to: '/mass-schedule', label: 'Mass Schedule' },
        { to: '/confession', label: 'Confession' },
        { to: '/benediction', label: 'Benediction' },
        { to: '/prayers', label: 'Prayers' },
      ],
    },
    {
      heading: 'Parish Life',
      links: [
        { to: '/announcements', label: 'Announcements' },
        { to: '/events', label: 'Events' },
        { to: '/ministries', label: 'Ministries' },
        { to: '/gallery', label: 'Gallery' },
      ],
    },
    {
      heading: 'Visit & Give',
      links: [
        { to: '/about-us', label: 'About the Parish' },
        { to: '/contact', label: 'Contact the Office' },
        { to: '/donations', label: 'Give Online' },
        { to: '/sacraments', label: 'Sacraments' },
      ],
    },
  ];

  return (
    <footer className="bg-ink text-stone-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row justify-between gap-12 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="flex items-center justify-center w-11 h-11 text-white text-xl font-serif bg-primary-600"
                style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
                aria-hidden="true"
              >
                ✝
              </span>
              <div>
                <h3 className="font-serif text-2xl text-white leading-none">{parish.name}</h3>
                <a
                  href={parish.dioceseUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.62rem] tracking-[0.2em] uppercase font-bold text-gold hover:text-white transition-colors mt-1 inline-block no-underline"
                >
                  {parish.diocese} · {parish.city}
                </a>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-stone-soft">
              Serving our community with faith, hope, and love. Join us in worship and fellowship
              on {parish.tagline}.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-14 gap-y-8">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-[0.64rem] tracking-[0.2em] uppercase font-bold text-gold mb-4">
                  {col.heading}
                </h4>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-stone-ivory/80 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-soft">
            &copy; {currentYear} {parish.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-stone-soft">{parish.diocese} · {parish.country}</span>
            <Link to="/privacy-policy" className="text-stone-ivory/80 hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
