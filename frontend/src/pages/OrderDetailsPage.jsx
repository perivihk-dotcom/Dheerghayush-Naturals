import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Star, X, XCircle, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import useBackgroundRefresh from '../hooks/useBackgroundRefresh';
import { toast } from '../hooks/use-toast';

const GOOGLE_REVIEW_URL = 'https://www.google.com/search?sca_esv=fd3c45d4dd9c35da&sxsrf=AE3TifMWklCI7_Qve-AHTKUAhubmdqBMoQ:1764416722904&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E--Y3xp9D_rA9Hk44RffFseHRHOPeYMwXBhDkuhGmgiz6tIZrIiUJVGFI7dpUkwYmMPoq3KN1jlgTYN-JtMXuTeAnO2sYY2IT1GZBbuWthurFT4BmA%3D%3D&q=Dheerghayush+naturals+Reviews&sa=X&ved=2ahUKEwjFnoTApJeRAxWJRCoJHYXNO-sQ0bkNegQILRAD&biw=1590&bih=705&dpr=1.2#lrd=0x3a4cf3877a32464f:0x83e265bb829c59f8,3,,,,';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, BACKEND_URL } = useUser();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [showProductReviewModal, setShowProductReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRating, setProductRating] = useState(5);
  const [productReviewText, setProductReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [replaceReason, setReplaceReason] = useState('');

  // Fetch function for background refresh
  const fetchOrderData = useCallback(async () => {
    if (!token || !orderId) return null;
    
    const [orderRes, trackingRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/user/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${BACKEND_URL}/api/user/orders/${orderId}/track`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const orderData = orderRes.ok ? await orderRes.json() : null;
    const trackingData = trackingRes.ok ? await trackingRes.json() : null;
    
    return { order: orderData, tracking: trackingData };
  }, [BACKEND_URL, token, orderId]);

  // Use background refresh - refreshes every 20 seconds silently
  const { data, loading, refresh } = useBackgroundRefresh(fetchOrderData, {
    interval: 20000,
    enabled: isAuthenticated && !!orderId,
    deps: [orderId, token],
  });

  const order = data?.order || null;
  const tracking = data?.tracking || null;

  // Handle review dialog and reviewable products when order changes
  useEffect(() => {
    if (order) {
      // Show review dialog if order is delivered and not already dismissed
      const dismissedReviews = JSON.parse(localStorage.getItem('dismissedReviews') || '[]');
      if (order.order_status === 'delivered' && !dismissedReviews.includes(order.order_id) && !reviewDismissed) {
        setTimeout(() => setShowReviewDialog(true), 1000);
      }
      
      // Fetch reviewable products if delivered
      if (order.order_status === 'delivered') {
        fetchReviewableProducts();
      }
    }
  }, [order?.order_id, order?.order_status]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Legacy fetchOrderDetails for manual refresh after actions
  const fetchOrderDetails = () => refresh();

  const fetchReviewableProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/orders/${orderId}/reviewable-products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviewableProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching reviewable products:', error);
    }
  };

  const openProductReviewModal = (product) => {
    setSelectedProduct(product);
    setProductRating(5);
    setProductReviewText('');
    setShowProductReviewModal(true);
  };

  const submitProductReview = async () => {
    if (!selectedProduct) return;
    
    setSubmittingReview(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          order_id: orderId,
          rating: productRating,
          review_text: productReviewText
        })
      });

      if (response.ok) {
        setShowProductReviewModal(false);
        fetchReviewableProducts(); // Refresh to update reviewed status
        setShowThankYouDialog(true);
      } else {
        const error = await response.json();
        toast({ title: 'Review Failed', description: error.detail || 'Failed to submit review', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ title: 'Review Failed', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewClick = () => {
    window.open(GOOGLE_REVIEW_URL, '_blank');
    dismissReviewDialog();
  };

  const dismissReviewDialog = () => {
    setShowReviewDialog(false);
    setReviewDismissed(true);
    // Save to localStorage so it doesn't show again for this order
    const dismissedReviews = JSON.parse(localStorage.getItem('dismissedReviews') || '[]');
    if (order && !dismissedReviews.includes(order.order_id)) {
      dismissedReviews.push(order.order_id);
      localStorage.setItem('dismissedReviews', JSON.stringify(dismissedReviews));
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast({ title: 'Reason Required', description: 'Please provide a reason for cancellation', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason.trim() })
      });
      
      if (response.ok) {
        setShowCancelDialog(false);
        setCancelReason('');
        fetchOrderDetails();
      } else {
        const error = await response.json();
        toast({ title: 'Cancel Failed', description: error.detail || 'Failed to cancel order', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({ title: 'Cancel Failed', description: 'Failed to cancel order', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplaceRequest = async () => {
    if (!replaceReason.trim()) {
      toast({ title: 'Reason Required', description: 'Please provide a reason for replacement', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/orders/${orderId}/replace`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: replaceReason.trim() })
      });
      
      if (response.ok) {
        setShowReplaceDialog(false);
        setReplaceReason('');
        fetchOrderDetails();
        toast({ title: 'Success', description: 'Replacement request submitted successfully!' });
      } else {
        const error = await response.json();
        toast({ title: 'Request Failed', description: error.detail || 'Failed to request replacement', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error requesting replacement:', error);
      toast({ title: 'Request Failed', description: 'Failed to request replacement', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const canCancel = () => {
    const nonCancellableStatuses = [
      'delivered', 
      'cancelled', 
      'refund_requested', 
      'replacement_requested',
      'replacement_accepted',
      'replacement_rejected',
      'replacement_processing',
      'replacement_shipped',
      'replacement_out_for_delivery',
      'replacement_delivered'
    ];
    return !nonCancellableStatuses.includes(order?.order_status);
  };

  const canRequestReplacement = () => {
    if (order?.order_status !== 'delivered') return false;
    if (order?.replacement_status) return false;
    
    // Check if within 7 days of delivery
    let deliveredAt = null;
    for (const event of order?.tracking_events || []) {
      if (event.status === 'delivered' && event.timestamp) {
        deliveredAt = new Date(event.timestamp);
        break;
      }
    }
    if (!deliveredAt) {
      deliveredAt = new Date(order?.created_at);
    }
    
    const daysSinceDelivery = Math.floor((new Date() - deliveredAt) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 7;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-[#2d6d4c]/20 text-green-800',
      cancelled: 'bg-red-100 text-red-800',

      replacement_requested: 'bg-pink-100 text-pink-800',
      replacement_accepted: 'bg-[#2d6d4c]/20 text-green-800',
      replacement_rejected: 'bg-red-100 text-red-800',
      replacement_processing: 'bg-yellow-100 text-yellow-800',
      replacement_completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status, completed) => {
    if (status === 'delivered' && completed) {
      return <CheckCircle className="text-[#2d6d4c]" size={24} />;
    }
    if (status === 'shipped' || status === 'out_for_delivery') {
      return <Truck className={completed ? 'text-[#2d6d4c]' : 'text-gray-300'} size={24} />;
    }
    if (completed) {
      return <CheckCircle className="text-[#2d6d4c]" size={24} />;
    }
    return <Clock className="text-gray-300" size={24} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6d4c]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2d6d4c] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Orders</span>
        </button>

        {/* Order Header */}
        <div className="bg-card rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-xl font-bold text-gray-800">{order.order_id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                {order.order_status.replace('_', ' ').toUpperCase()}
              </span>
              {tracking?.estimated_delivery && order.order_status !== 'delivered' && (
                <p className="text-sm text-gray-600">
                  Expected by: <span className="font-medium">{tracking.estimated_delivery}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="bg-card rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Track Order</h2>
          <div className="relative">
            {tracking?.tracking_events?.map((event, index) => (
              <div key={index} className="flex gap-4 pb-8 last:pb-0">
                <div className="relative">
                  {getStatusIcon(event.status, event.completed)}
                  {index < tracking.tracking_events.length - 1 && (
                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full ${
                      event.completed ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${event.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                    {event.description}
                  </p>
                  {event.timestamp && (
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-500">{event.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-card rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => {
                const reviewableItem = reviewableProducts.find(p => p.id === item.id);
                const isReviewed = reviewableItem?.reviewed;
                
                return (
                  <div key={index} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.weight}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-medium text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      {order.order_status === 'delivered' && (
                        <div className="mt-2">
                          {isReviewed ? (
                            <span className="inline-flex items-center gap-1 text-[#2d6d4c] text-sm">
                              <CheckCircle size={14} />
                              Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => openProductReviewModal(item)}
                              className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                            >
                              <Star size={14} />
                              Write a Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Order Summary */}
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">₹{order.shipping_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#2d6d4c]">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Payment */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{order.customer_info.name}</p>
                    <p className="text-gray-600 text-sm">{order.customer_info.address}</p>
                    <p className="text-gray-600 text-sm">
                      {order.customer_info.city}, {order.customer_info.state} - {order.customer_info.pincode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <p className="text-gray-600 text-sm">{order.customer_info.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <p className="text-gray-600 text-sm">{order.customer_info.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-800">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.payment_status === 'paid' ? 'text-[#2d6d4c]' : 'text-yellow-600'
                  }`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Actions</h2>
              <div className="space-y-3">
                {canCancel() && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={18} />
                    Cancel Order
                  </button>
                )}
                
                {canRequestReplacement() && (
                  <button
                    onClick={() => setShowReplaceDialog(true)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Package size={18} />
                    Request Replacement
                  </button>
                )}
                
                {/* Non-refundable notice */}
                {order.order_status === 'delivered' && (
                  <div className="text-center py-2 px-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      This product is non-refundable. Replacement available within 7 days of delivery.
                    </p>
                  </div>
                )}
                
                {order.order_status === 'cancelled' && (
                  <div className="text-center py-3">
                    <XCircle size={24} className="mx-auto mb-2 text-red-600" />
                    <p className="font-medium text-red-600">Order Cancelled</p>
                    
                    {/* Refund status for prepaid orders */}
                    {order.payment_method === 'RAZORPAY' && order.payment_status === 'paid' && (
                      <>
                        {/* Refund Completed */}
                        {order.refund_status === 'completed' && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-center gap-2 text-green-700 mb-1">
                              <CheckCircle size={16} />
                              <span className="font-medium">Refund Completed</span>
                            </div>
                            <p className="text-sm text-green-600">
                              Your refund of ₹{order.total.toFixed(2)} has been successfully transferred to your original payment method.
                            </p>
                            {order.razorpay_refund_id && (
                              <p className="text-xs text-green-500 mt-1">
                                Refund ID: {order.razorpay_refund_id}
                              </p>
                            )}
                            <p className="text-xs text-green-500 mt-1">
                              Amount will be credited within 5-7 business days.
                            </p>
                          </div>
                        )}

                        {/* Refund Failed */}
                        {order.refund_status === 'failed' && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-center gap-2 text-red-700 mb-1">
                              <AlertTriangle size={16} />
                              <span className="font-medium">Payment Failed</span>
                            </div>
                            <p className="text-sm text-red-600">
                              We encountered an issue processing your refund. Our team is working on it.
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              Amount: ₹{order.total.toFixed(2)}
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              Please contact support if not resolved within 48 hours.
                            </p>
                          </div>
                        )}

                        {/* Refund Processing/Pending */}
                        {(order.refund_status === 'processing' || !order.refund_status) && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                              <Clock size={16} />
                              <span className="font-medium">Refund Under Process</span>
                            </div>
                            <p className="text-sm text-blue-600">
                              Your refund is being processed. Amount will be transferred within 1-2 business days.
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              Amount: ₹{order.total.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                

                {order.order_status?.startsWith('replacement_') && (
                  <div className={`text-center py-3 px-4 rounded-lg ${
                    order.order_status === 'replacement_requested' ? 'bg-pink-50 text-pink-600' :
                    order.order_status === 'replacement_accepted' ? 'bg-[#2d6d4c]/10 text-[#2d6d4c]' :
                    order.order_status === 'replacement_rejected' ? 'bg-red-50 text-red-600' :
                    order.order_status === 'replacement_processing' ? 'bg-yellow-50 text-yellow-600' :
                    order.order_status === 'replacement_completed' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    <Package size={24} className="mx-auto mb-2" />
                    <p className="font-medium">
                      {order.order_status === 'replacement_requested' ? 'Replacement Requested' :
                       order.order_status === 'replacement_accepted' ? 'Replacement Accepted' :
                       order.order_status === 'replacement_rejected' ? 'Replacement Rejected' :
                       order.order_status === 'replacement_processing' ? 'Replacement Processing' :
                       order.order_status === 'replacement_completed' ? 'Replacement Completed' : 'Replacement Status'}
                    </p>
                    <p className="text-sm mt-1 opacity-75">
                      {order.order_status === 'replacement_requested' ? 'Your replacement request is being reviewed' :
                       order.order_status === 'replacement_accepted' ? 'Your replacement has been approved' :
                       order.order_status === 'replacement_rejected' ? 'Your replacement request was not approved' :
                       order.order_status === 'replacement_processing' ? 'Your replacement is being processed' :
                       order.order_status === 'replacement_completed' ? 'Your replacement has been completed' : ''}
                    </p>
                  </div>
                )}
                
                {order.order_status === 'delivered' && !canRequestReplacement() && !order.replacement_status && (
                  <p className="text-sm text-gray-500 text-center">
                    Replacement period has expired (7 days)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Request Banner for Delivered Orders */}
        {order.order_status === 'delivered' && !reviewDismissed && !showReviewDialog && (
          <div className="mt-6 bg-gradient-to-r from-[#2d6d4c] to-[#245a3e] rounded-2xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Star size={24} className="text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enjoyed your order?</h3>
                  <p className="text-white/80 text-sm">Share your experience with others!</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewDialog(true)}
                className="bg-white text-[#2d6d4c] px-6 py-2 rounded-lg font-semibold hover:bg-[#2d6d4c]/10 transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Dialog Modal */}
      {showReviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={dismissReviewDialog} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2d6d4c] to-[#245a3e] p-6 text-white text-center">
              <button
                onClick={dismissReviewDialog}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-yellow-300" />
              </div>
              <h2 className="text-2xl font-bold">Share Your Review</h2>
              <p className="text-white/80 mt-2">Your feedback helps us improve!</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={32} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-center mb-6">
                We hope you loved your order from Dheerghayush Naturals! 
                Would you like to share your experience on Google? 
                Your review helps other customers discover our natural products.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleReviewClick}
                  className="w-full bg-[#2d6d4c] hover:bg-[#245a3e] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Star size={20} />
                  Write a Review on Google
                </button>
                <button
                  onClick={dismissReviewDialog}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Review Modal */}
      {showProductReviewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProductReviewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <button
                onClick={() => setShowProductReviewModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-gray-800 mb-4">Review Product</h2>
              
              {/* Product Info */}
              <div className="flex gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProduct.weight}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setProductRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= productRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
                <textarea
                  value={productReviewText}
                  onChange={(e) => setProductReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProductReviewModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitProductReview}
                  disabled={submittingReview}
                  className="flex-1 bg-[#2d6d4c] hover:bg-[#245a3e] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Dialog */}
      {showThankYouDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowThankYouDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden text-center">
            <div className="p-8">
              <div className="w-20 h-20 bg-[#2d6d4c]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-[#2d6d4c]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your review has been submitted successfully. We appreciate your feedback!
              </p>
              <button
                onClick={() => setShowThankYouDialog(false)}
                className="w-full bg-[#2d6d4c] hover:bg-[#245a3e] text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowCancelDialog(false); setCancelReason(''); }} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Cancel Order</h2>
              <p className="text-gray-600 mb-4 text-center">
                Please tell us why you want to cancel this order.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter your reason for cancellation..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-gray-50"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">This helps us improve our service</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowCancelDialog(false); setCancelReason(''); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  No, Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={actionLoading || !cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Request Dialog */}
      {showReplaceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowReplaceDialog(false); setReplaceReason(''); }} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Request Replacement</h2>
              <p className="text-gray-600 mb-4 text-center">
                Please tell us why you need a replacement.
              </p>
              <textarea
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
                placeholder="Describe the issue with your order (e.g., damaged product, wrong item, quality issue)..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">Our team will contact you to arrange the replacement</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowReplaceDialog(false); setReplaceReason(''); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplaceRequest}
                  disabled={actionLoading || !replaceReason.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Request Replacement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
