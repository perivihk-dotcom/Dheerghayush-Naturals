import React from 'react';
import ProductCard from './ProductCard';

const ProductSection = ({ title, products, onAddToCart, id }) => {
  return (
    <section id={id} className="py-10 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
