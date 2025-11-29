import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides, businessInfo } from '../data/mock';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroSlides.map((slide) => (
          <div 
            key={slide.id}
            className="min-w-full h-[400px] md:h-[450px] relative"
            style={{ backgroundColor: slide.bgColor }}
          >
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
              <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                <div className="text-white z-10">
                  <h2 className="text-4xl md:text-5xl font-bold mb-2 opacity-90">{slide.title}</h2>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{slide.subtitle}</h3>
                  <p className="text-lg opacity-90 mb-6 max-w-md">{slide.description}</p>
                  <div className="flex items-center gap-4">
                    <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      Shop Now
                    </button>
                    <img 
                      src={businessInfo.logo} 
                      alt={businessInfo.name}
                      className="h-16 w-16 bg-white rounded-full p-1 object-contain"
                    />
                  </div>
                </div>
                <div className="hidden md:flex justify-end">
                  <div className="relative">
                    <div className="w-72 h-72 rounded-full overflow-hidden border-4 border-white/30">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
