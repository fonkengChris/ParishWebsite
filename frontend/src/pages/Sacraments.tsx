import Layout from '../components/Layout';
import { SACRAMENTS } from '../data/sacraments';

export default function Sacraments() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Sacraments Information</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn about the sacraments and their requirements.
          </p>
        </div>

        <div className="space-y-8">
          {SACRAMENTS.map((sacrament, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-10 hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-700">
                {sacrament.name}
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">{sacrament.description}</p>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 md:p-8 border-2 border-gray-200">
                <h3 className="font-bold mb-4 text-gray-900 text-lg flex items-center gap-2">
                  <span className="text-xl">📋</span> Requirements:
                </h3>
                <ul className="space-y-3 text-gray-700">
                  {sacrament.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="text-base leading-relaxed flex items-start gap-3">
                      <span className="text-primary-600 font-bold text-xl mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 p-8 md:p-10 rounded-2xl border-2 border-primary-200 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
              💬
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Need More Information?</h2>
          </div>
          <p className="text-gray-800 mb-6 text-lg leading-relaxed">
            For questions about any sacrament or to schedule a sacrament, please contact
            the parish office. We are here to help guide you through these important
            moments in your faith journey.
          </p>
          <a
            href="/contact"
            className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2 group text-lg px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Contact Us 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </section>
      </div>
    </Layout>
  );
}

