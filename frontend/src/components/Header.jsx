import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Phone, ShoppingCart, Menu, X, ChevronDown, User } from 'lucide-react';
import { categories, businessInfo } from '../data/mock';
import { useUser } from '../context/UserContext';

const Header = ({ cartItems, setShowCart, setShowAuth }) => {
  const { isAuthenticated, user } = useUser();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  const handleCategoryClick = (slug) => {
    setShowCategories(false);
    setShowMobileMenu(false);
    navigate(`/products?category=${slug}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#4CAF50] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <a href={`tel:${businessInfo.phone}`} className="hover:underline">{businessInfo.phone}</a>
          </div>
          <div className="hidden md:block">
            <span>We Deliver Across India</span>
          </div>
          <button 
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-1 hover:underline"
          >
            <User size={14} />
            <span>{isAuthenticated && user ? user.name.split(' ')[0] : 'Sign In'}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={businessInfo.logo} 
              alt={businessInfo.name}
              className="h-12 w-12 object-contain rounded-full"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800 leading-tight">Dheerghayush</h1>
              <p className="text-xs text-[#4CAF50] font-medium">Naturals</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Cart & Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="relative">
                <ShoppingCart size={22} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700">My Basket</span>
            </button>

            <button 
              className="md:hidden p-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-8">
            <li className="relative">
              <button 
                className="flex items-center gap-1 py-3 px-4 bg-[#4CAF50] text-white font-medium rounded-t-lg -mb-px"
                onClick={() => setShowCategories(!showCategories)}
                onMouseEnter={() => setShowCategories(true)}
              >
                Shop by Categories
                <ChevronDown size={16} className={`transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategories && (
                <div 
                  className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg rounded-r-lg py-2 min-w-[200px] z-50"
                  onMouseLeave={() => setShowCategories(false)}
                >
                  <button
                    onClick={() => { navigate('/products'); setShowCategories(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <span className="text-gray-700 font-medium">All Products</span>
                  </button>
                  {categories.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-gray-700">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </li>
            <li>
              <Link 
                to="/" 
                className={`py-3 font-medium transition-colors ${
                  isActive('/') ? 'text-[#4CAF50]' : 'text-gray-700 hover:text-[#4CAF50]'
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/products" 
                className={`py-3 font-medium transition-colors ${
                  isActive('/products') ? 'text-[#4CAF50]' : 'text-gray-700 hover:text-[#4CAF50]'
                }`}
              >
                All Products
              </Link>
            </li>
            <li>
              <Link 
                to="/combos" 
                className={`py-3 font-medium transition-colors ${
                  isActive('/combos') ? 'text-[#4CAF50]' : 'text-gray-700 hover:text-[#4CAF50]'
                }`}
              >
                Combos
              </Link>
            </li>
            <li>
              <Link 
                to="/our-story" 
                className={`py-3 font-medium transition-colors ${
                  isActive('/our-story') ? 'text-[#4CAF50]' : 'text-gray-700 hover:text-[#4CAF50]'
                }`}
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`py-3 font-medium transition-colors ${
                  isActive('/contact') ? 'text-[#4CAF50]' : 'text-gray-700 hover:text-[#4CAF50]'
                }`}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t">
          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <div className="space-y-1">
              <p className="font-semibold text-gray-800 px-3 py-2">Categories</p>
              <button
                onClick={() => { navigate('/products'); setShowMobileMenu(false); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg w-full text-left"
              >
                <span className="text-gray-700 font-medium">All Products</span>
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg w-full text-left"
                >
                  <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-gray-700">{cat.name}</span>
                </button>
              ))}
            </div>
            
            <div className="border-t mt-4 pt-4 space-y-2">
              <Link 
                to="/" 
                className={`block px-3 py-2 hover:bg-gray-50 rounded-lg ${isActive('/') ? 'text-[#4CAF50] bg-green-50' : 'text-gray-700'}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`block px-3 py-2 hover:bg-gray-50 rounded-lg ${isActive('/products') ? 'text-[#4CAF50] bg-green-50' : 'text-gray-700'}`}
                onClick={() => setShowMobileMenu(false)}
              >
                All Products
              </Link>
              <Link 
                to="/combos" 
                className={`block px-3 py-2 hover:bg-gray-50 rounded-lg ${isActive('/combos') ? 'text-[#4CAF50] bg-green-50' : 'text-gray-700'}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Combos
              </Link>
              <Link 
                to="/our-story" 
                className={`block px-3 py-2 hover:bg-gray-50 rounded-lg ${isActive('/our-story') ? 'text-[#4CAF50] bg-green-50' : 'text-gray-700'}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Our Story
              </Link>
              <Link 
                to="/contact" 
                className={`block px-3 py-2 hover:bg-gray-50 rounded-lg ${isActive('/contact') ? 'text-[#4CAF50] bg-green-50' : 'text-gray-700'}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
