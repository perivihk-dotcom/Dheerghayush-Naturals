import React from 'react';
import { ShoppingCart, Tag, Star, Package } from 'lucide-react';
import { combos, products } from '../data/mock';

const ComboCard = ({ combo, onAddToCart }) => {
  const comboProducts = combo.products.map(pid => products.find(p => p.id === pid)).filter(Boolean);
  const discount = Math.round(((combo.originalPrice - combo.comboPrice) / combo.originalPrice) * 100);

  const handleAddToCart = () => {
    // Add combo as a single item
    onAddToCart({
      id: combo.id,
      name: combo.name,
      price: combo.comboPrice,
      originalPrice: combo.originalPrice,
      image: combo.image,
      weight: `${comboProducts.length} items`,
      quantity: 1,
      isCombo: true
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <div className="aspect-[16/10] overflow-hidden bg-gray-50">
          <img 
            src={combo.image} 
            alt={combo.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {discount}% OFF
          </span>
          {combo.isBestseller && (
            <span className="bg-[#4CAF50] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Star size={12} fill="white" />
              Bestseller
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-semibold text-[#4CAF50]">Save ₹{combo.savings}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-800 mb-2">
          {combo.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{combo.description}</p>
        
        {/* Products in combo */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-[#4CAF50]" />
            <span className="text-sm font-medium text-gray-700">Includes:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {comboProducts.map((product) => (
              <span 
                key={product.id}
                className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
              >
                {product.name}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">₹{combo.comboPrice}</span>
              <span className="text-gray-400 line-through">₹{combo.originalPrice}</span>
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const CombosPage = ({ onAddToCart }) => {
  const bestsellerCombos = combos.filter(c => c.isBestseller);
  const otherCombos = combos.filter(c => !c.isBestseller);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6">
            <Tag size={18} />
            <span className="font-medium">Special Value Packs</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Combo Offers
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Save more with our curated combo packs. Get the best of natural products 
            at unbeatable prices.
          </p>
        </div>
      </section>

      {/* Bestseller Combos */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Star className="text-yellow-500" size={28} fill="#EAB308" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Bestselling Combos
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellerCombos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* All Combos */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
            All Combo Offers
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherCombos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-[#4CAF50]/5 to-[#8BC34A]/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            Why Choose Our Combos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-[#4CAF50]" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Great Savings</h3>
              <p className="text-gray-600">Save up to 25% compared to buying products individually</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-[#4CAF50]" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Curated Selection</h3>
              <p className="text-gray-600">Expert-picked products that complement each other perfectly</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-[#4CAF50]" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Same high-quality products, just bundled for better value</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CombosPage;
