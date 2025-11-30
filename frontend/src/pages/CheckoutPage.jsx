import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, Lock, MapPin, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

const CheckoutPage = ({ cartItems: propCartItems, clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated, BACKEND_URL } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get cart items from navigation state or props
    const items = location.state?.cartItems || propCartItems || [];
    if (items.length === 0) {
      navigate('/');
    }
    setCartItems(items);
    
    // Fetch saved addresses if user is logged in
    if (isAuthenticated && token) {
      fetchSavedAddresses();
      // Pre-fill user info
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }));
    }
  }, [location.state, navigate, isAuthenticated, token, user]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses);
        // Select primary address by default
        const primary = addresses.find(a => a.is_primary);
        if (primary) {
          setSelectedAddressId(primary.id);
          applyAddress(primary);
        } else if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          applyAddress(addresses[0]);
        } else {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const applyAddress = (address) => {
    setFormData(prev => ({
      ...prev,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Remove leading 0 from phone number
    if (name === 'phone' && value.startsWith('0')) {
      processedValue = value.substring(1);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (razorpayResponse = null) => {
    if (!validateForm()) {
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

    // If Razorpay is selected and no payment response yet, initiate Razorpay payment
    if (paymentMethod === 'RAZORPAY' && !razorpayResponse) {
      setLoading(true);
      try {
        // Load Razorpay script
        await loadRazorpayScript();

        // Create Razorpay order on backend
        const orderResponse = await fetch(`${backendUrl}/api/razorpay/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR'
          }),
        });

        if (!orderResponse.ok) {
          throw new Error('Failed to create Razorpay order');
        }

        const razorpayOrder = await orderResponse.json();

        // Open Razorpay checkout
        const options = {
          key: razorpayOrder.razorpay_key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Dheerghayush Naturals',
          description: 'Order Payment',
          order_id: razorpayOrder.razorpay_order_id,
          handler: async function (response) {
            // Verify payment on backend
            try {
              const verifyResponse = await fetch(`${backendUrl}/api/razorpay/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyResponse.ok) {
                // Payment verified, create order
                handlePlaceOrder({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                });
              } else {
                alert('Payment verification failed. Please contact support.');
                setLoading(false);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          },
          theme: {
            color: '#4CAF50',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
          alert(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        razorpay.open();

      } catch (error) {
        console.error('Error initiating Razorpay:', error);
        alert('Failed to initiate payment. Please try again.');
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        user_id: isAuthenticated ? user?.id : null,
        customer_info: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
          image: item.image
        })),
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total: total,
        payment_method: paymentMethod,
        razorpay_payment_id: razorpayResponse?.razorpay_payment_id || null,
        razorpay_order_id: razorpayResponse?.razorpay_order_id || null,
        razorpay_signature: razorpayResponse?.razorpay_signature || null
      };

      const response = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      // Clear the cart after successful order
      if (clearCart) {
        clearCart();
      }
      
      // Navigate to order confirmation page
      navigate(`/order-confirmation/${order.order_id}`, {
        state: { order }
      });

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-[#4CAF50]" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setUseNewAddress(false);
                        applyAddress(addr);
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr.id && !useNewAddress
                          ? 'border-[#4CAF50] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{addr.name}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                        </div>
                        {selectedAddressId === addr.id && !useNewAddress && (
                          <Check className="text-[#4CAF50]" size={20} />
                        )}
                      </div>
                      {addr.is_primary && (
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setUseNewAddress(true);
                    setSelectedAddressId(null);
                    setFormData(prev => ({
                      ...prev,
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: '',
                      city: '',
                      state: '',
                      pincode: ''
                    }));
                  }}
                  className={`text-sm font-medium ${useNewAddress ? 'text-[#4CAF50]' : 'text-gray-600 hover:text-[#4CAF50]'}`}
                >
                  + Use a different address
                </button>
              </div>
            )}

            {/* Customer Information */}
            <div className={`bg-white rounded-lg shadow-sm p-6 ${isAuthenticated && savedAddresses.length > 0 && !useNewAddress ? 'hidden' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-semibold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAuthenticated && savedAddresses.length > 0 ? 'New Delivery Address' : 'Customer Information'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="House no., Building name, Street"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent`}
                    placeholder="6-digit pincode"
                    maxLength="6"
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-semibold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-4">
                {/* COD Option */}
                <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#4CAF50] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="text-[#4CAF50]" size={20} />
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay with cash when your order is delivered</p>
                  </div>
                </label>

                {/* Razorpay Option */}
                <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'border-[#4CAF50] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-[#4CAF50]" size={20} />
                      <span className="font-semibold text-gray-900">Pay Online</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay securely using UPI, Credit/Debit Card, Net Banking, or Wallets</p>
                    <div className="flex items-center gap-2 mt-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="Amex" className="h-4 object-contain" />
                    </div>
                  </div>
                </label>

                {/* Razorpay Info */}
                {paymentMethod === 'RAZORPAY' && (
                  <div className="ml-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="text-blue-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-gray-900">Secure Payment via Razorpay</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your payment information is encrypted and secure. Click &quot;Pay&quot; to proceed with payment.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Lock size={14} className="text-green-600" />
                          <span className="text-xs text-green-700">256-bit SSL Encrypted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.weight}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(500 - subtotal).toFixed(2)} more for FREE shipping
                  </p>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#4CAF50]">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={() => handlePlaceOrder()}
                disabled={loading}
                className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : paymentMethod === 'RAZORPAY' 
                      ? 'bg-[#072654] hover:bg-[#0a3a7d]'
                      : 'bg-[#4CAF50] hover:bg-[#43A047]'
                }`}
              >
                {loading ? 'Processing...' : paymentMethod === 'RAZORPAY' ? `Pay ₹${total.toFixed(2)}` : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
