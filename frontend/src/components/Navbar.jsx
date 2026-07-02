import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, X, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-brand-400 font-bold text-xl tracking-wider">
              <BookOpen className="h-6 w-6" />
              <span>HARSIKA</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive(link.path) ? 'text-brand-400' : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Session Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-brand-400" />
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-950/80 border border-brand-800 text-brand-400 font-mono capitalize">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm bg-slate-800/80 border border-slate-700 hover:bg-red-950/40 hover:border-red-900/60 hover:text-red-400 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 rounded-lg shadow-md shadow-brand-900/20 hover:shadow-brand-900/40 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800 py-3 px-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-medium py-2 rounded-md ${
                isActive(link.path) ? 'text-brand-400 bg-slate-900/40 px-2' : 'text-slate-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-800 pt-3">
            {user ? (
              <div className="space-y-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-slate-300 py-2"
                >
                  <UserIcon className="h-4 w-4 text-brand-400" />
                  <span className="text-base font-medium">{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-400 font-mono capitalize">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-950/20 border border-red-900/40 text-red-400 py-2.5 rounded-lg font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-slate-300 hover:text-white py-2.5 rounded-lg border border-slate-800 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium shadow-lg shadow-brand-950"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
