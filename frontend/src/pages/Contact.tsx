import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Map, { PARISH_LOCATION, PARISH_NAME, PARISH_DIOCESE } from '../components/Map';
import { contactAPI, parishionersAPI, authAPI } from '../services/api';
import { getStoredUser, isAuthenticated } from '../utils/auth';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form with logged-in user information
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!isAuthenticated()) {
        return;
      }

      const user = getStoredUser();
      if (!user) {
        return;
      }

      // Pre-fill email from user object
      if (user.email) {
        setFormData(prev => ({
          ...prev,
          email: user.email || prev.email,
        }));
      }

      // If user is a parishioner, try to get their name from profile
      if (user.role === 'parishioner' && user.email) {
        let parishioner = null;
        
        // Try to get parishionerId from localStorage first
        const parishionerId = localStorage.getItem('parishionerId');
        if (parishionerId) {
          try {
            parishioner = await parishionersAPI.getProfile(parishionerId);
          } catch (err) {
            console.log('Could not load parishioner profile by ID, trying email...');
          }
        }
        
        // If we don't have parishioner data yet, try fetching by email
        if (!parishioner && user.email) {
          try {
            parishioner = await authAPI.getProfileByEmail(user.email);
            // Store the parishionerId for future use
            if (parishioner?._id) {
              localStorage.setItem('parishionerId', parishioner._id);
            }
          } catch (err) {
            console.log('Could not load parishioner profile by email');
          }
        }
        
        // Set the name if we have parishioner data
        if (parishioner) {
          const fullName = `${parishioner.firstName || ''} ${parishioner.lastName || ''}`.trim();
          if (fullName) {
            setFormData(prev => ({
              ...prev,
              name: fullName,
            }));
          }
        }
      } else {
        // For admin/editor, use username if available, otherwise use email prefix as fallback
        const username = user.username;
        if (username) {
          setFormData(prev => ({
            ...prev,
            name: username,
          }));
        } else if (user.email) {
          // Extract name from email (part before @) as fallback
          const emailName = user.email.split('@')[0];
          // Capitalize first letter and replace dots/underscores with spaces
          const formattedName = emailName
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setFormData(prev => ({
            ...prev,
            name: formattedName,
          }));
        }
      }
    };

    loadUserInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contactAPI.submit(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Contact Us</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">{PARISH_NAME}</h2>
            <p className="text-xl font-semibold mb-8 text-primary-700">{PARISH_DIOCESE}</p>
            <div className="space-y-6 text-gray-700 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="font-bold mb-3 text-primary-700 flex items-center gap-2 text-lg">
                  <span className="text-2xl">📍</span> Address
                </h3>
                <p className="text-gray-600 leading-relaxed">{PARISH_NAME}, Bonadikombo, Limbe</p>
                <p className="text-gray-600 leading-relaxed">{PARISH_LOCATION.region}, {PARISH_LOCATION.country}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="font-bold mb-3 text-primary-700 flex items-center gap-2 text-lg">
                  <span className="text-2xl">📞</span> Phone
                </h3>
                <p className="text-gray-600 font-medium">+237 333 22 11 00</p>
                <p className="text-sm text-gray-500 mt-1">Cameroon (+237)</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="font-bold mb-3 text-primary-700 flex items-center gap-2 text-lg">
                  <span className="text-2xl">✉️</span> Email
                </h3>
                <p className="text-gray-600 font-medium">info@parishlimbe.cm</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="font-bold mb-3 text-primary-700 flex items-center gap-2 text-lg">
                  <span className="text-2xl">🕐</span> Office Hours
                </h3>
                <p className="text-gray-600 leading-relaxed">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-600 leading-relaxed">Saturday: 9:00 AM - 12:00 PM</p>
                <p className="text-gray-600 leading-relaxed">Sunday: Closed</p>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
              <Map height="256px" />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Send us a Message</h2>
            {submitted ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-10 text-center shadow-xl">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-green-800 font-semibold text-lg">
                  Thank you! Your message has been sent. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
                    <p className="text-red-800 font-semibold">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="sacraments">Sacraments</option>
                    <option value="ministries">Ministries</option>
                    <option value="events">Events</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

