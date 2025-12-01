import React from 'react';
import { Salad, Heart, Scale, Shield, Sparkles } from 'lucide-react';

const iconMap = {
  Salad: Salad,
  Heart: Heart,
  Scale: Scale,
  Shield: Shield,
  Sparkles: Sparkles
};

const healthBenefits = [
  { id: 1, name: "Digestive Health", icon: "Salad", color: "#2d6d4c" },
  { id: 2, name: "Heart Health", icon: "Heart", color: "#E91E63" },
  { id: 3, name: "Weight Management", icon: "Scale", color: "#FF9800" },
  { id: 4, name: "Immunity Boost", icon: "Shield", color: "#2196F3" },
  { id: 5, name: "Skin & Hair", icon: "Sparkles", color: "#9C27B0" }
];

const HealthBenefits = () => {
  return (
    <section className="py-10 bg-gradient-to-br from-background to-muted">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          Health Benefits
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {healthBenefits.map((benefit) => {
            const IconComponent = iconMap[benefit.icon];
            return (
              <div 
                key={benefit.id}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${benefit.color}15` }}
                >
                  <IconComponent size={36} style={{ color: benefit.color }} />
                </div>
                <p className="text-sm md:text-base font-medium text-gray-700 text-center">
                  {benefit.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HealthBenefits;
