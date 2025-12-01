import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose, cartItems, updateQuantity, removeItem }) => {
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#2d6d4c]" size={24} />
              <h2 className="text-lg font-semibold">My Basket</h2>
              <span className="bg-[#2d6d4c] text-white text-xs px-2 py-0.5 rounded-full">
                {itemCount} items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag size={64} strokeWidth={1} />
                <p className="mt-4 text-lg">Your basket is empty</p>
                <p className="text-sm">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-card rounded-xl p-3 shadow-sm">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.weight}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-800">
                          ₹ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-gray-800">₹ {total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout</p>
              <button 
                onClick={() => {
                  navigate('/checkout', { state: { cartItems } });
                  onClose();
                }}
                className="w-full bg-[#2d6d4c] hover:bg-[#43A047] text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={onClose}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
