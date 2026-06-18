import { Link } from 'react-router-dom';
import { PARISH_NAME, PARISH_DIOCESE } from './Map';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-gray-200 border-t border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">⛪</span>
              <h3 className="text-white text-xl font-bold">{PARISH_NAME}</h3>
            </div>
            {/* <p className="text-sm text-primary-300 mb-4 font-medium">{PARISH_DIOCESE}</p> */}
            <a 
            href="https://bueadiocese.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg md:text-xl mb-2 drop-shadow-lg font-small text-primary-200 hover:text-primary-100 transition-colors duration-200 no-underline decoration-2 inline-block"
          >
            {PARISH_DIOCESE}
          </a>
            <p className="text-sm leading-relaxed text-gray-300">
              Serving our community with faith, hope, and love. Join us in worship and fellowship.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-5 pb-3 border-b-2 border-primary-600 flex items-center gap-2">
              <span className="text-xl">🔗</span>
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/mass-schedule" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Mass Schedule
                </Link>
              </li>
              <li>
                <Link 
                  to="/announcements" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Announcements
                </Link>
              </li>
              <li>
                <Link 
                  to="/events" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/prayers" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Prayers
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Gallery
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Ministries & Sacraments Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-5 pb-3 border-b-2 border-primary-600 flex items-center gap-2">
              <span className="text-xl">✨</span>
              Ministries & Sacraments
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/ministries" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Ministries
                </Link>
              </li>
              <li>
                <Link 
                  to="/sacraments" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  Sacraments
                </Link>
              </li>
              <li>
                <Link 
                  to="/about-us" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-300 group-hover:w-2.5 group-hover:h-2.5 transition-all"></span>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-5 pb-3 border-b-2 border-primary-600 flex items-center gap-2">
              <span className="text-xl">📞</span>
              Get In Touch
            </h3>
            <p className="text-sm leading-relaxed text-gray-300 mb-5">
              Visit our contact page for office hours, location information, and to reach out to us.
            </p>
            <Link 
              to="/contact"
              className="inline-block mt-4 px-5 py-2.5 bg-white text-primary-700 hover:bg-primary-50 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-primary-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-300 font-medium">
              &copy; {currentYear} {PARISH_NAME}. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/about-us" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                About
              </Link>
              <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

