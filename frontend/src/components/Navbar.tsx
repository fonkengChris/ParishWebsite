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
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Get user display name
  const getUserDisplayName = (user: User | null): string => {
    if (!user) return 'User';
    
    if (user.username) {
      return user.username;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
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
    { path: '/mass-schedule', label: 'MassTimes' },
    { path: '/announcements', label: 'News' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/donations', label: 'Donations' },
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

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 text-white shadow-xl border-b border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link 
            to="/" 
            className="text-xl md:text-2xl font-bold hover:text-primary-100 transition-colors duration-200 navbar-logo-container flex-shrink-0 min-w-0"
          >
            <span className="navbar-logo-icon" aria-hidden="true">
              ⛪
            </span>
            <span className="navbar-logo-text whitespace-nowrap">{PARISH_NAME}</span>
          </Link>

          {/* Desktop Navigation - Only show on large screens (lg and above) */}
          <div className="hidden lg:flex items-center space-x-1 flex-shrink">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Catholic Faith Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCatholicFaithMenu(!showCatholicFaithMenu)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
                  isCatholicFaithActive
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                }`}
              >
                Catholic Faith
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showCatholicFaithMenu ? 'rotate-180' : ''}`}
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
              {showCatholicFaithMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCatholicFaithMenu(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-20 border border-gray-100">
                    {catholicFaithLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setShowCatholicFaithMenu(false)}
                        className={`block px-4 py-3 text-sm transition-all duration-200 ${
                          isActive(link.path)
                            ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:pl-5'
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/admin/dashboard') || location.pathname.startsWith('/admin/')
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="User menu"
                >
                  {getUserInitials(user)}
                </button>
                
                {/* User dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-20 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
                        <p className="text-sm font-semibold text-gray-900">{getUserDisplayName(user)}</p>
                        <p className="text-xs text-primary-600 capitalize font-medium">{user.role}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/profile/edit"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Edit Profile
                      </Link>
                      <Link
                        to="/profile/change-password"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Change Password
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-primary-700 hover:bg-primary-50 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile/Tablet menu button - Show on screens smaller than lg (1024px) */}
          <button
            className="lg:hidden p-2 rounded-lg text-primary-100 hover:bg-primary-500/50 transition-all duration-200 flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 transition-transform duration-200"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Navigation - Show on screens smaller than lg (1024px) */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-2 bg-primary-800/50 rounded-lg mt-2 mb-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Catholic Faith Mobile Menu */}
            <div>
              <button
                onClick={() => setShowCatholicFaithMenu(!showCatholicFaithMenu)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  isCatholicFaithActive
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                }`}
              >
                CatholicFaith
                <svg
                  className={`w-5 h-5 ml-2 transition-transform duration-200 ${showCatholicFaithMenu ? 'rotate-180' : ''}`}
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
              {showCatholicFaithMenu && (
                <div className="pl-4 mt-2 space-y-1">
                  {catholicFaithLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => {
                        setIsOpen(false);
                        setShowCatholicFaithMenu(false);
                      }}
                      className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-primary-700 text-white'
                          : 'text-primary-200 hover:bg-primary-500/50 hover:text-white'
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
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  isActive('/admin/dashboard') || location.pathname.startsWith('/admin/')
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <div className="px-4 py-3 space-y-2 bg-primary-800/30 rounded-lg">
                <div className="flex items-center space-x-3 px-2 py-2 border-b border-primary-600">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-md">
                    {getUserInitials(user)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-primary-200 capitalize font-medium">{user.role}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-primary-100 hover:bg-primary-500/50 hover:text-white transition-all duration-200"
                >
                  View Profile
                </Link>
                <Link
                  to="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-primary-100 hover:bg-primary-500/50 hover:text-white transition-all duration-200"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/profile/change-password"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-primary-100 hover:bg-primary-500/50 hover:text-white transition-all duration-200"
                >
                  Change Password
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-semibold bg-primary-500 hover:bg-primary-400 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-semibold bg-white text-primary-700 hover:bg-primary-50 transition-all duration-200 shadow-md hover:shadow-lg text-center"
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

