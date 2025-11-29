import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react';

const ProductListCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex flex-row">
        {/* Product Image - Left Side */}
        <div className="relative w-[140px] sm:w-[180px] md:w-[220px] lg:w-[280px] flex-shrink-0">
          <div className="aspect-square overflow-hidden bg-gray-50 h-full">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {discount}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="absolute top-2 right-2 bg-[#4CAF50] text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              Bestseller
            </span>
          )}
        </div>
        
        {/* Product Details - Right Side */}
        <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-between min-w-0">
          <div>
            {/* Product Name */}
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl mb-1 sm:mb-2 line-clamp-2 hover:text-[#4CAF50] transition-colors">
              {product.name}
            </h3>
            
            {/* Weight */}
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{product.weight}</p>
            
            {/* Product Description for larger screens */}
            {product.description && (
              <p className="hidden md:block text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            
            {/* Rating placeholder */}
            <div className="hidden sm:flex items-center gap-1 mb-2 md:mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={`${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">(4.0)</span>
            </div>
          </div>
          
          {/* Price and Actions */}
          <div className="mt-auto">
            {/* Price */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm md:text-base text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            
            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
                >
                  <Minus size={12} className="sm:w-[14px] sm:h-[14px]" />
                </button>
                <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium min-w-[24px] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white py-1.5 sm:py-2 px-3 sm:px-4 md:px-6 rounded-lg font-medium transition-colors text-xs sm:text-sm md:text-base"
              >
                <span>Add</span>
                <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;
