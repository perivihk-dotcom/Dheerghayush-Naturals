import React, { useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import ProductSection from '../components/ProductSection';

import Testimonials from '../components/Testimonials';
import FeatureStrip from '../components/FeatureStrip';
import CertificationBadges from '../components/CertificationBadges';
import useBackgroundRefresh from '../hooks/useBackgroundRefresh';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = ({ onAddToCart }) => {
  // Fetch function for background refresh
  const fetchProductsData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/products`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch products');
  }, []);

  // Use background refresh - refreshes every 30 seconds silently
  const { data: productsData, loading } = useBackgroundRefresh(fetchProductsData, {
    interval: 30000,
    enabled: true,
  });

  const products = productsData || [];
  const bestsellers = products.filter(p => p.is_bestseller);
  const newArrivals = products.slice(-6).reverse();

  if (loading) {
    return (
      <main className="bg-background">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6d4c]"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background">
      <HeroSection />
      <FeatureStrip />
      
      {/* Certification Badges Section */}
      <section className="bg-gradient-to-b from-background to-background">
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
      

      
      {newArrivals.length > 0 && (
        <ProductSection 
          id="newarrivals"
          title="New Arrivals" 
          products={newArrivals} 
          onAddToCart={onAddToCart} 
        />
      )}
      
      <Testimonials />
    </main>
  );
};

export default HomePage;
