import React from 'react';
import { Leaf, Award, Truck, ShieldCheck, Heart, Users, Target, Sparkles } from 'lucide-react';
import { businessInfo } from '../data/mock';
import CertificationBadges from '../components/CertificationBadges';

const features = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'All our products are pure, natural and free from chemicals and preservatives'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'We source only the finest quality products from trusted farmers across India'
  },
  {
    icon: Truck,
    title: 'Pan India Delivery',
    description: 'We deliver to every corner of India with care and proper packaging'
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Secure',
    description: 'Your transactions and personal data are completely secure with us'
  }
];

const values = [
  {
    icon: Heart,
    title: 'Health First',
    description: 'We believe in promoting health through natural, chemical-free products that nourish your body.'
  },
  {
    icon: Users,
    title: 'Farmer Partnerships',
    description: 'We work directly with farmers, ensuring fair prices and sustainable farming practices.'
  },
  {
    icon: Target,
    title: 'Quality Assurance',
    description: 'Every product undergoes strict quality checks to ensure you receive only the best.'
  },
  {
    icon: Sparkles,
    title: 'Traditional Methods',
    description: 'We preserve traditional processing methods like wood-pressing and bilona churning.'
  }
];

const OurStoryPage = () => {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Story
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Bringing the goodness of nature directly from farms to your table since 2020.
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={businessInfo.logo}
                  alt={businessInfo.name}
                  className="w-16 h-16 rounded-full bg-white p-1 object-contain"
                />
                <div>
                  <p className="font-semibold text-lg">Dheerghayush Naturals</p>
                  <p className="text-white/80">Farm to Table, Naturally!</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwZm9vZHxlbnwwfHx8fDE3NjQzMTI4Njd8MA&ixlib=rb-4.1.0&q=85"
                  alt="Organic Food"
                  className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                  <p className="text-3xl font-bold text-[#4CAF50]">5000+</p>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Badges Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Our Certifications</h2>
          <p className="text-gray-600 text-sm">Quality you can trust</p>
        </div>
        <CertificationBadges />
      </section>

      {/* Story Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              How It All Began
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At <span className="font-semibold text-[#4CAF50]">{businessInfo.name}</span>, 
              our journey began with a simple question: "Why is it so hard to find pure, authentic food products?" 
              In an era of processed foods and artificial additives, we set out to reconnect people with 
              the wholesome, natural products our grandparents grew up with.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Founded in 2020 in Hyderabad, we started by sourcing organic millets from small-scale farmers 
              in rural Telangana. What began as a small operation quickly grew as more and more families 
              discovered the difference that truly natural products make in their daily lives.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Today, we offer a wide range of products including organic pulses, traditional millets, 
              wood-pressed oils extracted using the ancient "ghani" method, raw wild honey collected 
              from forests, and pure A2 desi cow ghee made using the traditional bilona process.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mb-6">
                <Target className="text-[#4CAF50]" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To make pure, natural, and chemical-free food products accessible to every Indian household. 
                We aim to revive traditional food processing methods and support local farmers while 
                promoting a healthier lifestyle for all.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="text-[#4CAF50]" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become India's most trusted brand for natural and organic food products. We envision 
                a future where every family has access to wholesome, unprocessed foods that nourish 
                both body and soul.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-[#4CAF50]" size={32} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-[#4CAF50]/5 to-[#8BC34A]/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            Why Choose Dheerghayush Naturals?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <feature.icon className="text-[#4CAF50] mb-4" size={32} />
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#4CAF50] to-[#8BC34A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-white/90 mb-8">
            Join thousands of families who have made the switch to natural, healthy eating.
          </p>
          <a 
            href="/products" 
            className="inline-block bg-white text-[#4CAF50] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore Our Products
          </a>
        </div>
      </section>
    </main>
  );
};

export default OurStoryPage;
