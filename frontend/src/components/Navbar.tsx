import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getStoredUser, isAuthenticated, clearStoredAuth } from '../utils/auth';
import { PARISH_NAME } from './Map';
import type { User } from '../types';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCatholicFaithMenu, setShowCatholicFaithMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Get user on mount and when location changes (to update after login)
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getStoredUser());
    } else {
      setUser(null);
    }
  }, [location]);

  // Get user initials
  const getUserInitials = (user: User | null): string => {
    if (!user) return '?';
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  // Get user display name
  const getUserDisplayName = (user: User | null): string => {
    if (!user) return 'User';
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  // Handle logout
  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about-us', label: 'About' },
    { path: '/mass-schedule', label: 'Mass Times' },
    { path: '/announcements', label: 'News' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact' },
  ];

  const catholicFaithLinks = [
    { path: '/sermons', label: 'Sermons' },
    { path: '/prayers', label: 'Prayers' },
    { path: '/order-of-the-mass', label: 'Order of the Mass' },
    { path: '/benediction', label: 'Benediction' },
    { path: '/confession', label: 'Confession' },
  ];

  const isCatholicFaithActive = catholicFaithLinks.some(link =>
    location.pathname === link.path ||
    (link.path === '/prayers' && location.pathname.startsWith('/prayers'))
  );

  // Check if user has a role above parishioner
  const hasAdminAccess = (user: User | null): boolean => {
    if (!user) return false;
    return ['admin', 'parish-priest', 'priest', 'editor'].includes(user.role);
  };

  // Shared pill classes
  const pill = 'px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200';
  const pillIdle = 'text-ink-soft hover:text-ink hover:bg-ivory-2';
  const pillActive = 'bg-primary-600 text-white shadow-sm';

  return (
    <nav className="sticky top-0 z-50 bg-ivory/85 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px] gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 min-w-0 group">
            <span
              className="flex items-center justify-center w-10 h-10 text-white text-xl font-serif bg-primary-600 flex-shrink-0 transition-colors duration-300"
              style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
              aria-hidden="true"
            >
              ✝
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-lg md:text-xl font-semibold text-ink leading-none truncate">
                {PARISH_NAME}
              </span>
              <span className="block text-[0.58rem] tracking-[0.22em] uppercase font-bold text-ink-soft mt-1">
                Buea Diocese · Limbe
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${pill} ${isActive(link.path) ? pillActive : pillIdle}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Catholic Faith Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCatholicFaithMenu(!showCatholicFaithMenu)}
                className={`${pill} flex items-center gap-1 ${isCatholicFaithActive ? pillActive : pillIdle}`}
              >
                The Faith
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showCatholicFaithMenu ? 'rotate-180' : ''}`}
                  fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCatholicFaithMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCatholicFaithMenu(false)}></div>
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 z-20 border border-line">
                    {catholicFaithLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setShowCatholicFaithMenu(false)}
                        className={`block px-4 py-2.5 text-sm transition-all duration-200 ${
                          isActive(link.path)
                            ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600'
                            : 'text-ink-soft hover:bg-ivory-2 hover:text-ink hover:pl-5'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {user && hasAdminAccess(user) && (
              <Link
                to="/admin/dashboard"
                className={`${pill} ${
                  isActive('/admin/dashboard') || location.pathname.startsWith('/admin/') ? pillActive : pillIdle
                }`}
              >
                Dashboard
              </Link>
            )}

            {/* Give — primary action */}
            <Link
              to="/donations"
              className="ml-1 px-5 py-2 rounded-full text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow transition-all duration-200"
            >
              Give
            </Link>

            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-ivory transition-all duration-200 shadow-sm"
                  aria-label="User menu"
                >
                  {getUserInitials(user)}
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 z-20 border border-line">
                      <div className="px-4 py-3 border-b border-line bg-primary-50">
                        <p className="text-sm font-semibold text-ink">{getUserDisplayName(user)}</p>
                        <p className="text-xs text-primary-700 capitalize font-medium">{user.role}</p>
                      </div>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-ivory-2 hover:text-ink transition-colors duration-200">View Profile</Link>
                      <Link to="/profile/edit" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-ivory-2 hover:text-ink transition-colors duration-200">Edit Profile</Link>
                      <Link to="/profile/change-password" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-ivory-2 hover:text-ink transition-colors duration-200">Change Password</Link>
                      <div className="border-t border-line my-1"></div>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200 font-medium">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 px-4 py-2 rounded-full text-sm font-semibold text-ink bg-white border border-line hover:border-primary-600 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile/Tablet menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-ink hover:bg-ivory-2 transition-all duration-200 flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-1.5 bg-white rounded-2xl mt-1 mb-3 border border-line shadow-lg px-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActive(link.path) ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-ivory-2 hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Catholic Faith Mobile Menu */}
            <div>
              <button
                onClick={() => setShowCatholicFaithMenu(!showCatholicFaithMenu)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isCatholicFaithActive ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-ivory-2 hover:text-ink'
                }`}
              >
                The Faith
                <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${showCatholicFaithMenu ? 'rotate-180' : ''}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCatholicFaithMenu && (
                <div className="pl-3 mt-1 space-y-1">
                  {catholicFaithLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => { setIsOpen(false); setShowCatholicFaithMenu(false); }}
                      className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive(link.path) ? 'bg-primary-100 text-primary-800' : 'text-ink-soft hover:bg-ivory-2 hover:text-ink'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user && hasAdminAccess(user) && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActive('/admin/dashboard') || location.pathname.startsWith('/admin/') ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-ivory-2 hover:text-ink'
                }`}
              >
                Dashboard
              </Link>
            )}

            <Link
              to="/donations"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-semibold bg-primary-600 text-white text-center hover:bg-primary-700 transition-all duration-200"
            >
              Give
            </Link>

            {user ? (
              <div className="px-2 py-2 space-y-1 bg-ivory-2 rounded-xl">
                <div className="flex items-center space-x-3 px-2 py-2 border-b border-line">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white font-semibold text-sm">
                    {getUserInitials(user)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-ink-soft capitalize font-medium">{user.role}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-base font-medium text-ink-soft hover:bg-white hover:text-ink transition-all duration-200">View Profile</Link>
                <Link to="/profile/edit" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-base font-medium text-ink-soft hover:bg-white hover:text-ink transition-all duration-200">Edit Profile</Link>
                <Link to="/profile/change-password" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-base font-medium text-ink-soft hover:bg-white hover:text-ink transition-all duration-200">Change Password</Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold text-red-700 hover:bg-red-50 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-ink bg-white border border-line hover:border-primary-600 transition-all duration-200 text-center"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
