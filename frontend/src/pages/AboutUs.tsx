import Layout from '../components/Layout';
import { PARISH_NAME, PARISH_DIOCESE } from '../components/Map';

export default function AboutUs() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-gray-900">{PARISH_NAME}</h1>
          <p className="text-2xl font-semibold mb-4 text-primary-700">{PARISH_DIOCESE}</p>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Learn more about our parish community</p>
        </div>

        {/* History Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl shadow-lg">
                📜
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-700">Our History</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                {PARISH_NAME} was established with a mission to serve the community and spread
                the message of faith, hope, and love. Over the years, we have grown into a
                vibrant community dedicated to worship, service, and fellowship.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                As part of {PARISH_DIOCESE}, we continue to build on the foundation laid by our founders, embracing
                both tradition and innovation in our ministry to serve God and our neighbors.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 p-8 md:p-10 rounded-2xl border-2 border-primary-200 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                ✨
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-700">Our Mission</h2>
            </div>
            <p className="text-gray-800 leading-relaxed mb-6 text-lg font-semibold">
              Our mission is to:
            </p>
            <ul className="space-y-4 text-gray-700 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl mt-1">•</span>
                <span className="leading-relaxed">Provide a welcoming community for all who seek God</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl mt-1">•</span>
                <span className="leading-relaxed">Celebrate the sacraments with reverence and joy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl mt-1">•</span>
                <span className="leading-relaxed">Serve those in need through acts of charity and compassion</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl mt-1">•</span>
                <span className="leading-relaxed">Educate and form disciples of Christ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-xl mt-1">•</span>
                <span className="leading-relaxed">Build bridges of understanding and unity</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Pastoral Team Section */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
              👥
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700">Pastoral Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                ⛪
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Parish Priest</h3>
              <p className="text-gray-600 leading-relaxed">
                Leading our community in faith and service.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                👔
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Associate Priests</h3>
              <p className="text-gray-600 leading-relaxed">
                Supporting the pastoral care of our parish.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                🙏
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Deacons</h3>
              <p className="text-gray-600 leading-relaxed">
                Assisting in liturgy and pastoral ministry.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                💼
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Parish Staff</h3>
              <p className="text-gray-600 leading-relaxed">
                Dedicated team supporting parish operations.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8 md:p-10 rounded-2xl border-2 border-gray-200 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg">
              📞
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Get in Touch</h2>
          </div>
          <p className="text-gray-700 mb-4 text-lg leading-relaxed">
            For more information about our parish, please visit our{' '}
            <a href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2 transition-colors">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </Layout>
  );
}

