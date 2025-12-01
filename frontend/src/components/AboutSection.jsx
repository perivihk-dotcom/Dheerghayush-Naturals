import React from 'react';
import { businessInfo } from '../data/mock';
import { Leaf, Award, Truck, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'All our products are pure, natural and free from chemicals'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'We source only the finest quality products from trusted farmers'
  },
  {
    icon: Truck,
    title: 'Pan India Delivery',
    description: 'We deliver to every corner of India with care'
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Secure',
    description: 'Your transactions and data are completely secure with us'
  }
];

const AboutSection = () => {
  return (
    <section id="ourstory" className="py-12 bg-gradient-to-br from-[#2d6d4c]/5 to-[#3d8b66]/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At <span className="font-semibold text-[#2d6d4c]">{businessInfo.name}</span>, 
              we believe in bringing the purest and most natural products directly from farms to your table. 
              Our mission is to promote a healthier lifestyle through traditional, chemical-free food products 
              that our ancestors trusted for generations.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We work directly with farmers across India to source authentic millets, organic pulses, 
              wood-pressed oils, wild honey, and traditional desi ghee. Every product is carefully 
              selected to ensure you get nothing but the best quality for your family.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <feature.icon className="text-[#2d6d4c] mb-2" size={28} />
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwZm9vZHxlbnwwfHx8fDE3NjQzMTI4Njd8MA&ixlib=rb-4.1.0&q=85"
                alt="Organic Food"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <img 
                    src={businessInfo.logo}
                    alt={businessInfo.name}
                    className="w-12 h-12 rounded-full object-contain"
                  />
                  <div>
                    <p className="font-bold text-gray-800">Dheerghayush Naturals</p>
                    <p className="text-sm text-[#2d6d4c]">Farm to Table, Naturally!</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#2d6d4c]/10 rounded-full -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#3d8b66]/10 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
