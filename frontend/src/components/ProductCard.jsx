import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, AlertTriangle, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAuthModal } from '../context/AuthModalContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductCard = ({ product, onAddToCart, isNewArrival }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { openAuthModal } = useAuthModal();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState({ average_rating: 0, total_reviews: 0 });
  const originalPrice = product.original_price || product.originalPrice;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const stock = product.stock ?? 100;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;

  useEffect(() => {
    fetchRating();
  }, [product.id]);

  const fetchRating = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${product.id}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRating(data);
      }
    } catch (error) {
      // Silently fail - rating is optional
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    onAddToCart({ ...product, quantity: Math.min(quantity, stock) });
    setQuantity(1);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/product/${product.id}`);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <div 
      className="bg-card rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className={`aspect-square overflow-hidden bg-gray-50 ${isOutOfStock ? 'opacity-50' : ''}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-red-600 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
        {discount > 0 && !isOutOfStock && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {discount}% OFF
          </span>
        )}
        {(product.is_bestseller || product.isBestseller) && !isOutOfStock && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#2d6d4c] text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            Bestseller
          </span>
        )}
        {isNewArrival && !isOutOfStock && !(product.is_bestseller || product.isBestseller) && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            New Arrival
          </span>
        )}
      </div>
      
      <div className="p-2.5 sm:p-4 flex flex-col min-h-[160px] sm:min-h-[200px]">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 line-clamp-2 min-h-[2.5em] group-hover:text-[#2d6d4c] transition-colors leading-tight">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5">{product.weight}</p>
        
        {/* Rating - always show stars */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={10} 
                className={i < Math.round(rating.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
              />
            ))}
          </div>
          {rating.total_reviews > 0 && (
            <span className="text-[10px] text-gray-500">({rating.total_reviews})</span>
          )}
        </div>
        
        {/* Stock Status */}
        {isLowStock ? (
          <div className="flex items-center gap-1 text-red-500 mb-1">
            <AlertTriangle size={12} />
            <span className="text-[10px] sm:text-xs font-medium">Few left!</span>
          </div>
        ) : !isOutOfStock && (
          <div className="flex items-center gap-1 text-green-600 mb-1">
            <span className="text-[10px] sm:text-xs font-medium">Available</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 mt-auto">
          <span className="text-sm sm:text-base font-bold text-gray-800">₹{product.price.toFixed(2)}</span>
          {originalPrice > product.price && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{originalPrice}</span>
          )}
        </div>
        
        {isOutOfStock ? (
          <button 
            disabled
            className="w-full flex items-center justify-center gap-1 bg-gray-300 text-gray-500 py-2 px-3 rounded-lg font-medium cursor-not-allowed text-xs sm:text-sm"
          >
            <span>Out of Stock</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg flex-shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium min-w-[20px] text-center">{quantity}</span>
              <button 
                onClick={handleIncreaseQuantity}
                disabled={quantity >= stock}
                className={`p-1.5 sm:p-2 transition-colors ${quantity >= stock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <Plus size={14} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#2d6d4c] hover:bg-[#43A047] text-white py-2 px-3 rounded-lg font-medium transition-colors text-xs sm:text-sm"
            >
              <span>Add</span>
              <ShoppingCart size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
