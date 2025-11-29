import React from 'react';
import { Truck, RefreshCcw, Headphones, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹499'
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    description: '7-day return policy'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We are here to help'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    description: '100% secure checkout'
  }
];

const FeatureStrip = () => {
  return (
    <section className="py-6 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <feature.icon size={22} className="text-[#4CAF50]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureStrip;
