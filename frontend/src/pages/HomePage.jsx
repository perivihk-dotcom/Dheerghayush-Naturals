import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CategorySlider from '../components/CategorySlider';
import ProductSection from '../components/ProductSection';
import HealthBenefits from '../components/HealthBenefits';
import Testimonials from '../components/Testimonials';
import FeatureStrip from '../components/FeatureStrip';
import CertificationBadges from '../components/CertificationBadges';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const bestsellers = products.filter(p => p.is_bestseller);
  const newArrivals = products.slice(-6).reverse();

  if (loading) {
    return (
      <main>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <HeroSection />
      <CategorySlider />
      <FeatureStrip />
      
      {/* Certification Badges Section */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="text-center pt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Our Certifications</h2>
          <p className="text-gray-600">Quality you can trust</p>
        </div>
        <CertificationBadges />
      </section>
      
      {bestsellers.length > 0 && (
        <ProductSection 
          id="bestsellers"
          title="Best Sellers" 
          products={bestsellers} 
          onAddToCart={onAddToCart} 
        />
      )}
      
      <HealthBenefits />
      
      {newArrivals.length > 0 && (
        <ProductSection 
          id="newarrivals"
          title="New Arrivals" 
          products={newArrivals} 
          onAddToCart={onAddToCart} 
        />
      )}
      
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-[#4CAF50] to-[#8BC34A]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Explore Our Complete Collection
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Discover our wide range of organic pulses, millets, wood-pressed oils, wild honey, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/products" 
              className="bg-white text-[#4CAF50] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View All Products
            </Link>
            <Link 
              to="/combos" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Shop Combos
            </Link>
          </div>
        </div>
      </section>
      
      <Testimonials />
    </main>
  );
};

export default HomePage;
