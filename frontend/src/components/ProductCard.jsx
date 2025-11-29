import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {discount > 0 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {discount}% OFF
          </span>
        )}
        {product.isBestseller && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#4CAF50] text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            Bestseller
          </span>
        )}
      </div>
      
      <div className="p-2.5 sm:p-4">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 line-clamp-2 min-h-[32px] sm:min-h-[48px] group-hover:text-[#4CAF50] transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-sm text-gray-500 mb-2 sm:mb-3">{product.weight}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mb-2 sm:mb-4">
          <span className="text-sm sm:text-lg font-bold text-gray-800">₹{product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] sm:text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        
        {/* Mobile: Compact layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center justify-center border border-gray-200 rounded-lg">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
            >
              <Minus size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
            <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
            >
              <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg font-medium transition-colors text-xs sm:text-sm"
          >
            <span>Add</span>
            <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
