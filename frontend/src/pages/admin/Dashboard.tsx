import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { announcementsAPI, eventsAPI } from '../../services/api';
import { getStoredUser, clearStoredAuth } from '../../utils/auth';

interface QuickLink {
  to: string;
  icon: string;
  label: string;
  description: string;
  color: string;
}

const quickLinks: QuickLink[] = [
  { to: '/admin/announcements', icon: '📢', label: 'Announcements', description: 'Manage parish announcements', color: 'from-blue-500 to-blue-600' },
  { to: '/admin/events', icon: '📅', label: 'Events', description: 'Schedule and manage events', color: 'from-purple-500 to-purple-600' },
  { to: '/admin/mass-schedule', icon: '⛪', label: 'Mass Schedule', description: 'Update mass times', color: 'from-indigo-500 to-indigo-600' },
  { to: '/admin/ministries', icon: '👥', label: 'Ministries', description: 'Manage parish ministries', color: 'from-green-500 to-green-600' },
  { to: '/admin/gallery', icon: '🖼️', label: 'Gallery', description: 'Manage photo gallery', color: 'from-pink-500 to-pink-600' },
  { to: '/admin/prayers', icon: '🙏', label: 'Prayers', description: 'Manage prayer resources', color: 'from-yellow-500 to-yellow-600' },
  { to: '/admin/sermons', icon: '📖', label: 'Sermons', description: 'Manage sermon content', color: 'from-teal-500 to-teal-600' },
  { to: '/admin/mission-stations', icon: '📍', label: 'Mission Stations', description: 'Manage mission stations', color: 'from-orange-500 to-orange-600' },
  { to: '/admin/liturgical-colors', icon: '🎨', label: 'Liturgical Colors', description: 'Configure liturgical colors', color: 'from-rose-500 to-rose-600' },
  { to: '/admin/donations', icon: '💰', label: 'Donations', description: 'View and manage donations', color: 'from-emerald-500 to-emerald-600' },
];

const adminOnlyLinks: QuickLink[] = [
  { to: '/admin/users', icon: '👤', label: 'Users', description: 'Manage user roles and permissions', color: 'from-purple-500 to-purple-600' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [stats, setStats] = useState({
    announcements: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [announcements, events] = await Promise.all([
        announcementsAPI.getAllAdmin(),
        eventsAPI.getAllAdmin(),
      ]);
      setStats({
        announcements: announcements.length,
        events: events.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchStats();
    }
  }, [navigate, fetchStats]);

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Parish Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">Welcome back</span>
                <span className="text-sm text-gray-600">{user.username}</span>
              </div>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h2>
          <p className="text-gray-600">
            Manage your parish content and settings from this dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Link
            to="/admin/announcements"
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📢</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Announcements</h3>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-blue-600 mb-2">{stats.announcements}</p>
              )}
              <p className="text-sm text-gray-500">Total active announcements</p>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📅</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Events</h3>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-purple-600 mb-2">{stats.events}</p>
              )}
              <p className="text-sm text-gray-500">Total scheduled events</p>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
              <p className="text-sm text-gray-500 mt-1">Manage all parish content sections</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group relative p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-transparent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300`}></div>
                <div className="relative flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300 transform group-hover:scale-110`}>
                    <span className="text-2xl">{link.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-1">
                      {link.label}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {link.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Manage
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {/* Admin/Parish-Priest Only Links */}
            {(user.role === 'admin' || user.role === 'parish-priest') && adminOnlyLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group relative p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-transparent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300`}></div>
                <div className="relative flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300 transform group-hover:scale-110`}>
                    <span className="text-2xl">{link.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-1">
                      {link.label}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {link.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Manage
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-primary-100 text-sm">
                If you need assistance managing content or have questions about the admin panel, please contact your system administrator.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

