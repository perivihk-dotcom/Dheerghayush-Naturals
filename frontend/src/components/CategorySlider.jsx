import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '../data/mock';

const CategorySlider = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/products?category=${slug}`);
  };

  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className="flex-shrink-0 group text-left"
              >
                <div className="w-28 md:w-36 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#4CAF50] transition-colors">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-[#4CAF50] transition-colors line-clamp-2">
                    {category.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
