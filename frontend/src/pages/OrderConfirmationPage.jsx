import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, MapPin, Mail, Phone, Home } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, try to get order from navigation state
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
    } else if (orderId) {
      // If not in state, fetch from API
      fetchOrder();
    }
  }, [orderId, location.state]);

  const fetchOrder = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Order not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#43A047]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-[#4CAF50]" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="inline-block bg-gray-100 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{order.order_id}</p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
            <div className="absolute top-5 left-0 h-1 bg-[#4CAF50] w-1/4"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Order Placed</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Package className="text-gray-500" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-500">Processing</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Truck className="text-gray-500" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-500">Shipped</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Home className="text-gray-500" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-500">Delivered</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-[#4CAF50]" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customer_info.name}</p>
              <p className="text-gray-600">{order.customer_info.address}</p>
              <p className="text-gray-600">
                {order.customer_info.city}, {order.customer_info.state} - {order.customer_info.pincode}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Phone size={14} className="text-gray-500" />
                <span className="text-gray-600">{order.customer_info.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-500" />
                <span className="text-gray-600">{order.customer_info.email}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-[#4CAF50]" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium capitalize ${
                  order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_method === 'UPI' && order.buyer_upi_id && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Paid from UPI</span>
                  <span className="font-mono text-xs text-gray-900">{order.buyer_upi_id}</span>
                </div>
              )}
              {order.payment_method === 'COD' && (
                <div className="pt-2 border-t">
                  <p className="text-gray-600">
                    Please keep ₹{order.total.toFixed(2)} ready for payment on delivery
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.weight}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                    <span className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Fee</span>
              <span className="font-medium">
                {order.shipping_fee === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${order.shipping_fee.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-[#4CAF50]">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-6 border-2 border-[#4CAF50] text-[#4CAF50] rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-6 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors"
          >
            Print Order Details
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• You will receive an order confirmation email at {order.customer_info.email}</li>
            <li>• We'll notify you when your order is shipped</li>
            <li>• Expected delivery: 3-5 business days</li>
            <li>• For any queries, contact us at +91 7032254736</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
