import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { businessInfo } from '../data/mock';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have questions about our products? We'd love to hear from you. 
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-[#4CAF50]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                      <a href={`tel:${businessInfo.phone}`} className="text-gray-600 hover:text-[#4CAF50] block">
                        {businessInfo.phone}
                      </a>
                      <a href={`tel:${businessInfo.phone2}`} className="text-gray-600 hover:text-[#4CAF50] block">
                        {businessInfo.phone2}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="text-[#4CAF50]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                      <a href={`mailto:${businessInfo.email}`} className="text-gray-600 hover:text-[#4CAF50]">
                        {businessInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#4CAF50]" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                      <p className="text-gray-600">{businessInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-[#4CAF50]" size={22} />
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
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#4CAF50] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Facebook size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#4CAF50] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Instagram size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#4CAF50] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
                      <Twitter size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#4CAF50] hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-600">
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
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="product-inquiry">Product Inquiry</option>
                        <option value="order-status">Order Status</option>
                        <option value="bulk-order">Bulk Order</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full md:w-auto bg-[#4CAF50] hover:bg-[#43A047] text-white py-3 px-8 rounded-lg font-semibold transition-colors"
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

      {/* FAQ Section */}
      <section className="py-16 bg-white">
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
              <div key={index} className="bg-gray-50 rounded-xl p-6">
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
