import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Twitter, Youtube, ChevronDown, Check } from 'lucide-react';
import { businessInfo } from '../data/mock';

const subjectOptions = [
  { value: 'product-inquiry', label: 'Product Inquiry' },
  { value: 'order-status', label: 'Order Status' },
  { value: 'bulk-order', label: 'Bulk Order' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main className="min-h-screen">
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2d6d4c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-[#2d6d4c]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                      <a href={`tel:${businessInfo.phone}`} className="text-gray-600 hover:text-[#2d6d4c] block">
                        {businessInfo.phone}
                      </a>
                      <a href={`tel:${businessInfo.phone2}`} className="text-gray-600 hover:text-[#2d6d4c] block">
                        {businessInfo.phone2}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2d6d4c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="text-[#2d6d4c]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                      <a href={`mailto:${businessInfo.email}`} className="text-gray-600 hover:text-[#2d6d4c]">
                        {businessInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2d6d4c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#2d6d4c]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                      <p className="text-gray-600">{businessInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2d6d4c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-[#2d6d4c]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                      <p className="text-gray-600">Monday - Saturday</p>
                      <p className="text-gray-600">9:00 AM - 7:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/+917032254736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#20BD5A] transition-colors"
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </a>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#2d6d4c] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Facebook size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#2d6d4c] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Instagram size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#2d6d4c] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Twitter size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#2d6d4c] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Youtube size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                
                {submitted && (
                  <div className="mb-6 p-4 bg-[#2d6d4c]/10 border border-[#2d6d4c]/30 rounded-lg">
                    <p className="text-[#2d6d4c] font-medium">
                      Thank you for your message! We'll get back to you soon.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all bg-white cursor-pointer text-left flex items-center justify-between ${
                            dropdownOpen 
                              ? 'border-[#2d6d4c] ring-2 ring-[#2d6d4c]/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className={formData.subject ? 'text-gray-800' : 'text-gray-400'}>
                            {formData.subject 
                              ? subjectOptions.find(opt => opt.value === formData.subject)?.label 
                              : 'Select a subject'}
                          </span>
                          <ChevronDown 
                            size={20} 
                            className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        {/* Custom Dropdown Menu */}
                        {dropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                            {subjectOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, subject: option.value });
                                  setDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#2d6d4c]/5 transition-colors ${
                                  formData.subject === option.value 
                                    ? 'bg-[#2d6d4c]/10 text-[#2d6d4c]' 
                                    : 'text-gray-700'
                                }`}
                              >
                                <span>{option.label}</span>
                                {formData.subject === option.value && (
                                  <Check size={18} className="text-[#2d6d4c]" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Hidden input for form validation */}
                        <input
                          type="hidden"
                          name="subject"
                          value={formData.subject}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] transition-colors resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full md:w-auto bg-[#2d6d4c] hover:bg-[#43A047] text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                  >
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Find Us Here
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit our store at Dheerghayush Naturals. We'd love to meet you in person!
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.3986877568694!2d79.96889!3d14.4291837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4cf3877a32464f%3A0x83e265bb829c59f8!2sDheerghayush%20naturals!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dheerghayush Naturals Location"
              className="w-full"
            ></iframe>
          </div>
          <div className="mt-6 text-center">
            <a
              href="https://www.google.com/maps/place/Dheerghayush+naturals/@14.4393297,79.9758369,14z/data=!4m6!3m5!1s0x3a4cf3877a32464f:0x83e265bb829c59f8!8m2!3d14.4291837!4d79.971481!16s%2Fg%2F11wmtbsd71?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2d6d4c] hover:bg-[#43A047] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              <MapPin size={18} />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'What are your delivery charges?',
                a: 'We offer free delivery on orders above ₹499. For orders below this amount, a delivery charge of ₹50 applies.'
              },
              {
                q: 'How long does delivery take?',
                a: 'Delivery typically takes 3-7 business days depending on your location. Metro cities usually receive orders within 3-4 days.'
              },
              {
                q: 'Do you offer bulk discounts?',
                a: 'Yes! We offer special discounts for bulk orders. Please contact us with your requirements and we\'ll provide you with a custom quote.'
              },
              {
                q: 'Are your products organic certified?',
                a: 'Our products are sourced from certified organic farms. We ensure all our products meet the highest quality standards.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
