import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, ExternalLink } from 'lucide-react';
import { testimonials, googleRating } from '../data/mock';

// Star Rating Component with half-star support
const StarRating = ({ rating, size = 16, showHalf = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = showHalf && (rating % 1 >= 0.5);
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= fullStars) {
          return (
            <Star
              key={star}
              size={size}
              className="text-yellow-400 fill-yellow-400"
            />
          );
        } else if (star === fullStars + 1 && hasHalfStar) {
          return (
            <div key={star} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="text-gray-300 absolute" />
              <div className="overflow-hidden absolute" style={{ width: `${size / 2}px` }}>
                <Star size={size} className="text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          );
        } else {
          return (
            <Star
              key={star}
              size={size}
              className="text-gray-300"
            />
          );
        }
      })}
    </div>
  );
};

// Google Profile Avatar Component
const GoogleAvatar = ({ name, rating }) => {
  const colors = rating === 5 
    ? ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6']
    : ['#9E9E9E', '#607D8B', '#795548', '#78909C'];
  const randomColor = colors[name.length % colors.length];
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div 
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg"
      style={{ backgroundColor: randomColor }}
    >
      {initials}
    </div>
  );
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  // Separate 5-star and 4-star reviews for display
  const fiveStarReviews = testimonials.filter(t => t.rating === 5);
  const fourStarReviews = testimonials.filter(t => t.rating === 4);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Google Rating */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            What People Think About Us
          </h2>
          
          {/* Google Rating Badge */}
          <a 
            href={googleRating.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{googleRating.rating}</span>
              <StarRating rating={parseFloat(googleRating.rating)} size={18} showHalf={true} />
            </div>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        </div>
        
        {/* Reviews Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="min-w-full px-4"
                >
                  <div className={`max-w-3xl mx-auto rounded-2xl p-8 md:p-10 ${
                    testimonial.rating === 5 
                      ? 'bg-gradient-to-br from-[#4CAF50]/5 to-[#8BC34A]/5' 
                      : 'bg-gradient-to-br from-blue-50 to-gray-50'
                  }`}>
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="flex-shrink-0">
                        <GoogleAvatar name={testimonial.name} rating={testimonial.rating} />
                      </div>
                      <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{testimonial.name}</h3>
                          {testimonial.isGoogleReview && (
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                          <StarRating rating={testimonial.rating} size={16} />
                          <span className="text-sm text-gray-500">{testimonial.timeAgo}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Quote size={20} className="text-[#4CAF50] rotate-180 flex-shrink-0 mt-1 hidden md:block" />
                          <p className="text-gray-600 leading-relaxed">{testimonial.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-[#4CAF50] transition-all shadow-md"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-[#4CAF50] transition-all shadow-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((review, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? `w-8 ${review.rating === 5 ? 'bg-[#4CAF50]' : 'bg-blue-500'}` 
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* View All Reviews Link */}
        <div className="mt-6 text-center">
          <a 
            href={googleRating.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#4CAF50] hover:text-[#43A047] font-medium transition-colors"
          >
            View all reviews on Google
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
