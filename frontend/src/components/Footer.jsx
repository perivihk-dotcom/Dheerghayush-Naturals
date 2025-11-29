import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Leaf } from 'lucide-react';
import { businessInfo, categories } from '../data/mock';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img 
                src={businessInfo.logo} 
                alt={businessInfo.name}
                className="h-14 w-14 rounded-full bg-white p-1 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Dheerghayush</h3>
                <p className="text-sm text-[#4CAF50]">Naturals</p>
              </div>
            </Link>
            <p className="text-sm mb-4 leading-relaxed">
              Your trusted source for pure and natural products. We bring farm-fresh goodness directly to your table.
            </p>
            <div className="flex items-center gap-2 text-[#4CAF50]">
              <Leaf size={16} />
              <span className="text-sm font-medium">100% Natural & Organic</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link 
                    to={`/products?category=${cat.slug}`}
                    className="text-sm hover:text-[#4CAF50] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Pages */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-[#4CAF50] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-sm hover:text-[#4CAF50] transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/combos" className="text-sm hover:text-[#4CAF50] transition-colors">Combo Offers</Link>
              </li>
              <li>
                <Link to="/our-story" className="text-sm hover:text-[#4CAF50] transition-colors">Our Story</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-[#4CAF50] transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a href={`tel:${businessInfo.phone}`} className="flex items-center gap-3 text-sm hover:text-[#4CAF50] transition-colors">
                <Phone size={16} />
                <span>{businessInfo.phone}</span>
              </a>
              <a href={`tel:${businessInfo.phone2}`} className="flex items-center gap-3 text-sm hover:text-[#4CAF50] transition-colors">
                <Phone size={16} />
                <span>{businessInfo.phone2}</span>
              </a>
              <a href={`mailto:${businessInfo.email}`} className="flex items-center gap-3 text-sm hover:text-[#4CAF50] transition-colors">
                <Mail size={16} />
                <span>{businessInfo.email}</span>
              </a>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>{businessInfo.address}</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#4CAF50] rounded-full flex items-center justify-center transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#4CAF50] rounded-full flex items-center justify-center transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#4CAF50] rounded-full flex items-center justify-center transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#4CAF50] rounded-full flex items-center justify-center transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>GSTIN: {businessInfo.gstin}</p>
            <p>&copy; 2024 {businessInfo.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#4CAF50] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#4CAF50] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
