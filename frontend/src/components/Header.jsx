import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Package, MapPin } from 'lucide-react';
import { businessInfo } from '../data/mock';
import { useUser } from '../context/UserContext';

const Header = ({ cartItems, setShowCart, setShowAuth }) => {
  const { isAuthenticated, user } = useUser();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-lg shadow-md' 
          : 'bg-background/80 backdrop-blur-md'
      }`}
    >
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={businessInfo.logo} 
                alt={businessInfo.name}
                className="h-11 w-11 object-contain rounded-full ring-2 ring-[#2d6d4c]/20 group-hover:ring-[#2d6d4c]/40 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-[#2d6d4c]/10 group-hover:bg-[#2d6d4c]/20 transition-colors duration-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight group-hover:text-[#2d6d4c] transition-colors duration-300">
                Dheerghayush
              </h1>
              <p className="text-xs text-[#2d6d4c] font-semibold tracking-wide">Naturals</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { path: '/', label: 'Home' },
              { path: '/products', label: 'All Products' },
              { path: '/our-story', label: 'Our Story' },
              { path: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`relative px-4 py-2 font-medium text-sm transition-all duration-300 rounded-full ${
                  isActive(item.path) 
                    ? 'text-[#2d6d4c] bg-[#2d6d4c]/10' 
                    : 'text-gray-600 hover:text-[#2d6d4c] hover:bg-[#2d6d4c]/5'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#2d6d4c] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Profile, Location, Cart & Menu */}
          <div className="flex items-center gap-2">
            {/* Profile Icon & User Name */}
            <div className="hidden md:flex items-center">
              {isAuthenticated ? (
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary hover:bg-[#2d6d4c]/10 transition-all duration-300"
                >
                  <User size={20} className="text-[#2d6d4c]" />
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </Link>
              ) : (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-[#2d6d4c]/10 hover:text-[#2d6d4c] transition-all duration-300"
                >
                  <User size={20} className="text-gray-600" />
                </button>
              )}
            </div>

            {/* My Orders Icon */}
            <Link 
              to="/profile?tab=orders"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-[#2d6d4c]/10 transition-all duration-300 group"
              title="My Orders"
            >
              <Package size={20} className="text-gray-600 group-hover:text-[#2d6d4c] transition-colors duration-300" />
            </Link>

            {/* Location Icon */}
            <Link 
              to="/profile?tab=addresses"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-[#2d6d4c]/10 transition-all duration-300 group"
              title="My Addresses"
            >
              <MapPin size={20} className="text-gray-600 group-hover:text-[#2d6d4c] transition-colors duration-300" />
            </Link>

            {/* Cart */}
            <button 
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2 bg-secondary hover:bg-[#2d6d4c] px-4 py-2.5 rounded-full transition-all duration-300 group"
            >
              <div className="relative">
                <ShoppingCart size={20} className="text-gray-600 group-hover:text-white transition-colors duration-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#2d6d4c] group-hover:bg-white group-hover:text-[#2d6d4c] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold transition-colors duration-300">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-600 group-hover:text-white transition-colors duration-300">
                My Basket
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100/80 transition-colors duration-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-gray-100">
          <div className="p-4">
            <div className="space-y-1">
              {[
                { path: '/', label: 'Home' },
                { path: '/products', label: 'All Products' },
                { path: '/our-story', label: 'Our Story' },
                { path: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive(item.path) 
                      ? 'text-[#2d6d4c] bg-[#2d6d4c]/10' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Location & Orders */}
            <div className="flex gap-2 mt-4">
              <Link 
                to="/profile?tab=addresses"
                onClick={() => setShowMobileMenu(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <MapPin size={20} />
                <span>Location</span>
              </Link>
              <Link 
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <Package size={20} />
                <span>My Orders</span>
              </Link>
            </div>

            {/* Mobile Profile Button */}
            {isAuthenticated ? (
              <Link 
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#2d6d4c]/10 text-[#2d6d4c] rounded-xl font-medium hover:bg-[#2d6d4c]/20 transition-all duration-300"
              >
                <User size={20} />
                <span>{user?.name?.split(' ')[0] || 'My Account'}</span>
              </Link>
            ) : (
              <button 
                onClick={() => {
                  setShowAuth(true);
                  setShowMobileMenu(false);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#2d6d4c]/10 text-[#2d6d4c] rounded-xl font-medium hover:bg-[#2d6d4c]/20 transition-all duration-300"
              >
                <User size={20} />
                <span>My Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
