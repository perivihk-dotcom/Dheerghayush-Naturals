import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Leaf, Shield, Truck } from 'lucide-react';
import useBackgroundRefresh from '../hooks/useBackgroundRefresh';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchBannersData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/banners`);
    if (response.ok) return await response.json();
    throw new Error('Failed to fetch banners');
  }, []);

  const { data: bannersData, loading } = useBackgroundRefresh(fetchBannersData, {
    interval: 60000,
    enabled: true,
  });

  const banners = bannersData || [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goNext = () => {
    if (banners.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const goPrev = () => {
    if (banners.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => setCurrentIndex(index);

  if (loading || banners.length === 0) {
    return (
      <section className="relative overflow-hidden h-[60vh] min-h-[350px] max-h-[500px] md:h-[calc(100vh-80px)] md:min-h-[500px] md:max-h-none bg-background">
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-gray-800">
              Welcome to <span className="text-[#2d6d4c]">Dheerghayush</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600">Pure & Natural Products</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden h-[60vh] min-h-[350px] max-h-[500px] md:h-[calc(100vh-80px)] md:min-h-[500px] md:max-h-none group">
      {banners.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* ===== MOBILE VIEW - Full Banner Style ===== */}
          <div className="absolute inset-0 md:hidden">
            {/* Background Image - Full size */}
            <img 
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-[90%] object-cover"
            />
            
            {/* Light overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            
            {/* Content at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-12">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full">
                  <Leaf size={12} className="text-[#2d6d4c]" />
                  <span className="text-xs font-medium text-[#2d6d4c]">100% Natural & Organic</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-white">{slide.title}</h2>
                <h3 className="text-lg sm:text-xl font-semibold text-white/90">{slide.subtitle}</h3>
                <p className="text-sm text-white/80 line-clamp-2">{slide.description}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Link to={slide.button_link || '/products'} className="inline-flex items-center gap-1.5 bg-[#2d6d4c] text-white px-4 py-2.5 rounded-full font-semibold text-sm">
                    {slide.button_text || 'Shop Now'} <ChevronRight size={14} />
                  </Link>
                  <Link to="/our-story" className="inline-flex items-center gap-1.5 bg-white/90 text-gray-800 px-4 py-2.5 rounded-full font-semibold text-sm">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>

          
          {/* ===== DESKTOP VIEW - Split Layout with Image on Right ===== */}
          <div className="hidden md:block absolute inset-0 bg-background">
            {/* Desktop Content */}
            <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8">
              <div className="h-full flex items-center">
                {/* Left Content */}
                <div className="w-[50%] lg:w-[45%] pr-8 lg:pr-12 z-10">
                  <div className="space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#2d6d4c]/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#2d6d4c]/30">
                      <Leaf size={16} className="text-[#2d6d4c]" />
                      <span className="text-sm font-medium tracking-wide text-[#2d6d4c]">100% Natural & Organic</span>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-gray-800">
                      {slide.title}
                    </h2>
                    
                    {/* Subtitle */}
                    <h3 className="text-2xl lg:text-3xl font-semibold text-[#2d6d4c]">
                      {slide.subtitle}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-md">
                      {slide.description}
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4 pt-2">
                      <Link 
                        to={slide.button_link || '/products'}
                        className="group inline-flex items-center gap-2 bg-[#2d6d4c] text-white px-8 py-4 rounded-full font-bold hover:bg-[#43A047] transition-all duration-300 hover:shadow-2xl hover:scale-105"
                      >
                        {slide.button_text || 'Shop Now'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link 
                        to="/our-story" 
                        className="inline-flex items-center gap-2 bg-transparent text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 border-2 border-gray-300 hover:border-gray-400"
                      >
                        Our Story
                      </Link>
                    </div>
                    
                    {/* Trust Badges */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-200 mt-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-10 h-10 rounded-full bg-[#2d6d4c]/10 flex items-center justify-center">
                          <Leaf size={18} className="text-[#2d6d4c]" />
                        </div>
                        <span className="text-sm font-medium">100% Natural</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <Shield size={18} className="text-blue-500" />
                        </div>
                        <span className="text-sm font-medium">Quality Assured</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                          <Truck size={18} className="text-amber-500" />
                        </div>
                        <span className="text-sm font-medium">Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Banner Image */}
                <div className="w-[50%] lg:w-[55%] relative h-full flex items-center justify-center">
                  {/* Image - Clean without box/shadow */}
                  <img 
                    src={slide.image}
                    alt={slide.title}
                    className={`w-full h-[90%] object-contain transition-transform duration-[6000ms] ease-out ${
                      index === currentIndex ? 'scale-100' : 'scale-95'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}




      {/* Dots - Mobile */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 md:hidden">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Dots - Desktop */}
      {banners.length > 1 && (
        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'w-12 bg-[#2d6d4c] shadow-lg' 
                  : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}


    </section>
  );
};

export default HeroSection;
