import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tag, ShoppingBag, Grid, MessageCircle } from 'lucide-react';

const BottomNav = ({ setShowCart, cartItems }) => {
  const location = useLocation();
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around items-center py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive('/') ? 'text-[#4CAF50]' : 'text-gray-500 hover:text-[#4CAF50]'
          }`}
        >
          <Home size={22} />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link 
          to="/products" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive('/products') ? 'text-[#4CAF50]' : 'text-gray-500 hover:text-[#4CAF50]'
          }`}
        >
          <Grid size={22} />
          <span className="text-xs">Products</span>
        </Link>
        <button 
          onClick={() => setShowCart(true)}
          className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-[#4CAF50] transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </button>
        <Link 
          to="/combos" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive('/combos') ? 'text-[#4CAF50]' : 'text-gray-500 hover:text-[#4CAF50]'
          }`}
        >
          <Tag size={22} />
          <span className="text-xs">Combos</span>
        </Link>
        <a 
          href="https://wa.me/+917032254736" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-[#4CAF50] transition-colors"
        >
          <MessageCircle size={22} />
          <span className="text-xs">Chat</span>
        </a>
      </div>
    </nav>
  );
};

export default BottomNav;
