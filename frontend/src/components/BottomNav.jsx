import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Grid, User, Package } from 'lucide-react';

const BottomNav = ({ setShowCart, cartItems, setShowAuth }) => {
  const location = useLocation();
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-secondary md:hidden z-40 shadow-lg">
      <div className="flex justify-around items-center py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive('/') ? 'text-[#2d6d4c]' : 'text-gray-500 hover:text-[#2d6d4c]'
          }`}
        >
          <Home size={22} />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link 
          to="/products" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive('/products') ? 'text-[#2d6d4c]' : 'text-gray-500 hover:text-[#2d6d4c]'
          }`}
        >
          <Grid size={22} />
          <span className="text-xs">Products</span>
        </Link>
        <button 
          onClick={() => setShowCart(true)}
          className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-[#2d6d4c] transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2d6d4c] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </button>

        <Link 
          to="/profile?tab=orders" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            location.pathname === '/profile' && location.search.includes('tab=orders') 
              ? 'text-[#2d6d4c]' 
              : 'text-gray-500 hover:text-[#2d6d4c]'
          }`}
        >
          <Package size={22} />
          <span className="text-xs">Orders</span>
        </Link>

        <button 
          onClick={() => setShowAuth(true)}
          className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-[#2d6d4c] transition-colors"
        >
          <User size={22} />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
