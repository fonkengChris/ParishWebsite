import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Map from '../components/Map';
import { contactAPI, parishionersAPI, authAPI } from '../services/api';
import { getStoredUser, isAuthenticated } from '../utils/auth';
import { useParish } from '../contexts/ParishContext';
import { useSiteContent } from '../contexts/SiteContentContext';

// Small inline SVG icon (replaces the previous emoji iconography per design system).
function ContactIcon({ path }: { path: string }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex-shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </span>
  );
}

export default function Contact() {
  const { parish } = useParish();
  const { content } = useSiteContent();
  const intro = content.pageIntros.contact;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="font-serif font-medium text-ink text-5xl md:text-6xl mb-4">{intro.heading}</h1>
          <p className="text-ink-soft text-lg max-w-2xl mx-auto">{intro.subhead}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mb-2">
              {parish.diocese}
            </p>
            <h2 className="font-serif font-medium text-ink text-3xl mb-8">{parish.name}</h2>
            <div className="space-y-5 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-line hover:border-primary-600 transition-all duration-200">
                <h3 className="font-serif font-semibold text-ink flex items-center gap-2.5 text-lg mb-3">
                  <ContactIcon path="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  Address
                </h3>
                {parish.contact.address && (
                  <p className="text-ink-soft leading-relaxed">{parish.contact.address}</p>
                )}
                <p className="text-ink-soft leading-relaxed">
                  {[parish.city, parish.region, parish.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-line hover:border-primary-600 transition-all duration-200">
                <h3 className="font-serif font-semibold text-ink flex items-center gap-2.5 text-lg mb-3">
                  <ContactIcon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  Phone
                </h3>
                <p className="text-ink font-medium">{parish.contact.phone}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-line hover:border-primary-600 transition-all duration-200">
                <h3 className="font-serif font-semibold text-ink flex items-center gap-2.5 text-lg mb-3">
                  <ContactIcon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  Email
                </h3>
                <a href={`mailto:${parish.contact.email}`} className="text-ink font-medium hover:text-primary-700 transition-colors">
                  {parish.contact.email}
                </a>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-line hover:border-primary-600 transition-all duration-200">
                <h3 className="font-serif font-semibold text-ink flex items-center gap-2.5 text-lg mb-3">
                  <ContactIcon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  Office Hours
                </h3>
                {parish.contact.officeHours.map((line, i) => (
                  <p key={i} className="text-ink-soft leading-relaxed">{line}</p>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-line">
              <Map height="256px" />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-serif font-medium text-ink text-3xl mb-8">Send us a Message</h2>
            {submitted ? (
              <div className="bg-white border border-line rounded-2xl p-10 text-center">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 text-primary-700 mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-ink font-semibold text-lg">
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

