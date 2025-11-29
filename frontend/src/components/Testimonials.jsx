import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, ExternalLink } from 'lucide-react';
import { testimonials, googleRating } from '../data/mock';

// Star Rating Component
const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
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
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

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
            <img 
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
              alt="Google" 
              className="h-5 object-contain"
            />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{googleRating.rating}</span>
              <div className="flex flex-col items-start">
                <StarRating rating={5} size={14} />
                <span className="text-xs text-gray-500">{googleRating.totalReviews} reviews</span>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        </div>
        
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
                  <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#4CAF50]/5 to-[#8BC34A]/5 rounded-2xl p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="flex-shrink-0">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      </div>
                      <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{testimonial.name}</h3>
                          {testimonial.isGoogleReview && (
                            <img 
                              src="https://www.google.com/favicon.ico" 
                              alt="Google Review" 
                              className="w-4 h-4"
                            />
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
        
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-[#4CAF50]' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
