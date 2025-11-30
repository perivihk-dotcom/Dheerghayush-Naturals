import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductListCard from '../components/ProductListCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductsPage = ({ onAddToCart }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Get IDs of latest 6 products (new arrivals)
  const newArrivalIds = products.slice(-6).map(p => p.id);

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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {getCategoryName(selectedCategory)}
          </h1>
          <p className="text-white/90">
            {filteredProducts.length} products available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#4CAF50] text-white'
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
                        ? 'bg-[#4CAF50] text-white'
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
            {/* Mobile Filter Button & View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm"
              >
                <Filter size={18} />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-[#4CAF50] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-[#4CAF50] text-white' : 'bg-white text-gray-600'
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
                <p className="text-gray-500">No products found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#4CAF50] text-white'
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
                        ? 'bg-[#4CAF50] text-white'
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
