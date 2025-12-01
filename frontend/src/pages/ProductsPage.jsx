import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, X, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductListCard from '../components/ProductListCard';
import useBackgroundRefresh from '../hooks/useBackgroundRefresh';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductsPage = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Fetch functions for background refresh
  const fetchProductsData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/products`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch products');
  }, []);

  const fetchCategoriesData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/categories`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch categories');
  }, []);

  // Use background refresh - refreshes every 30 seconds silently
  const { data: productsData, loading: productsLoading } = useBackgroundRefresh(fetchProductsData, {
    interval: 30000,
    enabled: true,
  });

  const { data: categoriesData, loading: categoriesLoading } = useBackgroundRefresh(fetchCategoriesData, {
    interval: 60000, // Categories change less frequently
    enabled: true,
  });

  const products = productsData || [];
  const categories = categoriesData || [];
  const loading = productsLoading || categoriesLoading;

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Filter by category first
  const categoryFilteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Then filter by search query
  const filteredProducts = searchQuery.trim()
    ? categoryFilteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryFilteredProducts;

  // Get search suggestions
  const searchSuggestions = searchQuery.trim().length > 0
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // Get IDs of latest 6 products (new arrivals)
  const newArrivalIds = products.slice(-6).map(p => p.id);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
    setShowFilters(false);
  };

  const getCategoryName = (slug) => {
    if (slug === 'all') return 'All Products';
    const category = categories.find(c => c.slug === slug);
    return category ? category.name : 'Products';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6d4c]"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl shadow-sm p-6 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2 overflow-y-auto flex-1 pr-2 categories-scroll">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#2d6d4c] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === cat.slug
                        ? 'bg-[#2d6d4c] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar, Filter & View Toggle */}
            <div className="flex items-center gap-3 mb-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-2 bg-white rounded-lg shadow-sm"
              >
                <Filter size={20} />
              </button>

              {/* Search Bar */}
              <div className="flex-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2d6d4c] focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                    {searchSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">₹{product.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-[#2d6d4c] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-[#2d6d4c] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                viewMode === 'grid' ? (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart}
                    isNewArrival={newArrivalIds.includes(product.id)}
                  />
                ) : (
                  <ProductListCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart}
                    isNewArrival={newArrivalIds.includes(product.id)}
                  />
                )
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? 'No products found matching your search.' : 'No products found in this category.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-80 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4 flex flex-col h-[calc(100%-60px)]">
              <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
              <div className="space-y-2 overflow-y-auto flex-1 pr-2 categories-scroll">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#2d6d4c] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === cat.slug
                        ? 'bg-[#2d6d4c] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductsPage;
