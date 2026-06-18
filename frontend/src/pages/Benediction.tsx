import { useState } from 'react';
import Layout from '../components/Layout';
import { hymns, prayers } from '../data/benedictionData';

export default function Benediction() {
  const [expandedHymns, setExpandedHymns] = useState<Set<string>>(new Set());
  const [expandedPrayers, setExpandedPrayers] = useState<Set<string>>(new Set());

  const toggleHymn = (title: string) => {
    const newExpanded = new Set(expandedHymns);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedHymns(newExpanded);
  };

  const togglePrayer = (title: string) => {
    const newExpanded = new Set(expandedPrayers);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedPrayers(newExpanded);
  };
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Benediction</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn about the Benediction of the Blessed Sacrament.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Benediction?</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Benediction of the Blessed Sacrament is a devotional ceremony in the Catholic Church 
              in which the Blessed Sacrament is exposed and adored by the faithful, and then blessed 
              with the sign of the cross using the monstrance containing the consecrated host.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              This beautiful devotion allows us to spend time in adoration before the Real Presence 
              of Jesus Christ in the Eucharist, offering our prayers and receiving His blessing.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order of Benediction</h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">1.</span>
                <span>Exposition of the Blessed Sacrament</span>
              </li>
              <li className="flex flex-col">
                <button
                  onClick={() => toggleHymn('O Salutaris Hostia')}
                  className="flex items-center text-left hover:text-primary-600 transition-colors"
                >
                  <span className="text-primary-600 mr-3">2.</span>
                  <span className="flex-1">O Salutaris Hostia (hymn)</span>
                  <svg
                    className={`w-5 h-5 ml-3 transition-transform ${expandedHymns.has('O Salutaris Hostia') ? 'rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedHymns.has('O Salutaris Hostia') && (
                  <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                      <p className="text-base leading-relaxed whitespace-pre-line">{hymns['O Salutaris Hostia'].english}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                      <p className="text-base leading-relaxed italic whitespace-pre-line">{hymns['O Salutaris Hostia'].latin}</p>
                    </div>
                  </div>
                )}
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">3.</span>
                <span>Period of Adoration and Silent Prayer</span>
              </li>
              <li className="flex flex-col">
                <button
                  onClick={() => toggleHymn('Tantum Ergo')}
                  className="flex items-center text-left hover:text-primary-600 transition-colors"
                >
                  <span className="text-primary-600 mr-3">4.</span>
                  <span className="flex-1">Tantum Ergo (hymn)</span>
                  <svg
                    className={`w-5 h-5 ml-3 transition-transform ${expandedHymns.has('Tantum Ergo') ? 'rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedHymns.has('Tantum Ergo') && (
                  <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                      <p className="text-base leading-relaxed whitespace-pre-line">{hymns['Tantum Ergo'].english}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                      <p className="text-base leading-relaxed italic whitespace-pre-line">{hymns['Tantum Ergo'].latin}</p>
                    </div>
                  </div>
                )}
              </li>
              <li className="flex flex-col">
                <button
                  onClick={() => togglePrayer('Prayer')}
                  className="flex items-center text-left hover:text-primary-600 transition-colors"
                >
                  <span className="text-primary-600 mr-3">5.</span>
                  <span className="flex-1">Prayer</span>
                  <svg
                    className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Prayer') ? 'rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedPrayers.has('Prayer') && (
                  <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                      <p className="text-base leading-relaxed">{prayers['Prayer'].english}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                      <p className="text-base leading-relaxed italic">{prayers['Prayer'].latin}</p>
                    </div>
                  </div>
                )}
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">6.</span>
                <span>Benediction (Blessing with the Blessed Sacrament)</span>
              </li>
              <li className="flex flex-col">
                <button
                  onClick={() => togglePrayer('Divine Praises')}
                  className="flex items-center text-left hover:text-primary-600 transition-colors"
                >
                  <span className="text-primary-600 mr-3">7.</span>
                  <span className="flex-1">Divine Praises</span>
                  <svg
                    className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Divine Praises') ? 'rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedPrayers.has('Divine Praises') && (
                  <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                      <p className="text-base leading-relaxed whitespace-pre-line">{prayers['Divine Praises'].english}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                      <p className="text-base leading-relaxed italic whitespace-pre-line">{prayers['Divine Praises'].latin}</p>
                    </div>
                  </div>
                )}
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">8.</span>
                <span>Reposition of the Blessed Sacrament</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Prayer of St. Thomas Aquinas</h2>
            <button
              onClick={() => togglePrayer('Prayer of St. Thomas Aquinas')}
              className="w-full flex items-center justify-between text-left hover:text-primary-600 transition-colors mb-4"
            >
              <span className="text-gray-700 text-lg">Click to view full prayer</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Prayer of St. Thomas Aquinas') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Prayer of St. Thomas Aquinas') && (
              <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-gray-700 text-lg leading-relaxed">{prayers['Prayer of St. Thomas Aquinas'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-gray-700 text-lg leading-relaxed italic">{prayers['Prayer of St. Thomas Aquinas'].latin}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

