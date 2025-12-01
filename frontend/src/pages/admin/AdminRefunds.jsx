import React, { useState, useCallback, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import useBackgroundRefresh from '../../hooks/useBackgroundRefresh';
import {
  DollarSign,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const AdminRefunds = ({ initialFilter, onFilterApplied }) => {
  const { token, BACKEND_URL } = useAdmin();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(null);
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');

  // Apply initial filter when it changes
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
      if (onFilterApplied) onFilterApplied();
    }
  }, [initialFilter, onFilterApplied]);

  // Fetch refund orders
  const fetchRefundOrders = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=500`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      // Filter orders that are cancelled, paid via Razorpay
      const refundOrders = (data.orders || []).filter(
        (order) =>
          order.order_status === 'cancelled' &&
          order.payment_method === 'RAZORPAY' &&
          order.payment_status === 'paid'
      );
      return refundOrders;
    }
    throw new Error('Failed to fetch orders');
  }, [BACKEND_URL, token]);

  const { data: orders, loading, refresh } = useBackgroundRefresh(fetchRefundOrders, {
    interval: 15000,
    enabled: true,
  });

  const refundOrders = orders || [];

  // Open verify modal for an order
  const openVerifyModal = (order) => {
    setSelectedOrder(order);
    setShowVerifyModal(true);
  };

  // Verify and process refund
  const handleVerifyAndTransfer = async () => {
    if (!selectedOrder) return;
    
    setVerifyingOrder(selectedOrder.order_id);
    setProcessingRefund(selectedOrder.order_id);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${selectedOrder.order_id}/process-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setShowVerifyModal(false);
        setSelectedOrder(null);
        refresh();
        // Show success message
        toast({ title: 'Refund Successful', description: `Refund ID: ${result.refund_id} - Amount: ₹${selectedOrder.total.toFixed(2)} transferred successfully.` });
      } else {
        // Refund failed - but customer will see "Payment under process" (not error)
        setShowVerifyModal(false);
        setSelectedOrder(null);
        refresh();
        toast({ title: 'Refund Issue', description: result.detail || 'There was an issue processing the refund. Please retry.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      setShowVerifyModal(false);
      setSelectedOrder(null);
      refresh();
      toast({ title: 'Connection Error', description: 'Connection issue while processing refund. Please retry.', variant: 'destructive' });
    } finally {
      setProcessingRefund(null);
      setVerifyingOrder(null);
    }
  };

  const handleRetryRefund = async (order) => {
    // Reset refund status to processing and open verify modal
    try {
      await fetch(`${BACKEND_URL}/api/admin/orders/${order.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refund_status: 'processing' }),
      });
      refresh();
      // Open verify modal for retry
      setTimeout(() => {
        openVerifyModal(order);
      }, 500);
    } catch (error) {
      console.error('Error resetting refund status:', error);
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRefundStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock size={16} className="text-yellow-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <DollarSign size={16} className="text-gray-600" />;
    }
  };

  const getRefundStatusLabel = (status) => {
    switch (status) {
      case 'processing':
        return 'Pending Refund';
      case 'completed':
        return 'Refund Completed';
      case 'failed':
        return 'Refund Failed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6d4c]"></div>
      </div>
    );
  }

  const pendingRefunds = refundOrders.filter((o) => o.refund_status === 'processing');
  const completedRefunds = refundOrders.filter((o) => o.refund_status === 'completed');
  const failedRefunds = refundOrders.filter((o) => o.refund_status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
          <p className="text-gray-500 mt-1">Process refunds for cancelled prepaid orders</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-yellow-100 px-4 py-2 rounded-lg border border-yellow-200">
            <span className="text-yellow-700 font-medium">{pendingRefunds.length} Pending</span>
          </div>
          <div className="bg-green-100 px-4 py-2 rounded-lg border border-green-200">
            <span className="text-green-700 font-medium">{completedRefunds.length} Completed</span>
          </div>
          {failedRefunds.length > 0 && (
            <div className="bg-red-100 px-4 py-2 rounded-lg border border-red-200">
              <span className="text-red-700 font-medium">{failedRefunds.length} Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Verify & Transfer Refund Process</p>
          <p className="mt-1">
            Click "Verify & Transfer Refund" to review order details and automatically transfer the payment back to the customer via Razorpay. 
            Once successful, the customer will see "Refund Completed" in their order tracking. If the transfer fails, they will see "Payment Failed" status.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({refundOrders.length})
          </button>
          <button
            onClick={() => setActiveFilter('processing')}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeFilter === 'processing' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
            }`}
          >
            Processing ({pendingRefunds.length})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            Completed ({completedRefunds.length})
          </button>
          <button
            onClick={() => setActiveFilter('failed')}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeFilter === 'failed' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Failed ({failedRefunds.length})
          </button>
        </div>
      </div>

      {/* Refund Orders List */}
      {(() => {
        const filteredOrders = activeFilter === 'all' 
          ? refundOrders 
          : refundOrders.filter(o => o.refund_status === activeFilter);
        
        return filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No refund requests</h3>
            <p className="text-gray-500">
              {activeFilter === 'all' 
                ? 'Refund requests for cancelled prepaid orders will appear here'
                : `No ${activeFilter} refunds found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            >
              {/* Order Header */}
              <div
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  order.refund_status === 'processing'
                    ? 'bg-yellow-50'
                    : order.refund_status === 'completed'
                      ? 'bg-green-50'
                      : order.refund_status === 'failed'
                        ? 'bg-red-50'
                        : 'bg-gray-50'
                }`}
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        order.refund_status === 'processing'
                          ? 'bg-yellow-100'
                          : order.refund_status === 'completed'
                            ? 'bg-green-100'
                            : order.refund_status === 'failed'
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                      }`}
                    >
                      {getRefundStatusIcon(order.refund_status)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.order_id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer_info?.name} •{' '}
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#2d6d4c]">₹{order.total.toFixed(2)}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRefundStatusColor(order.refund_status)}`}
                      >
                        {getRefundStatusIcon(order.refund_status)}
                        {getRefundStatusLabel(order.refund_status)}
                      </span>
                    </div>
                    {expandedOrder === order.order_id ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.order_id && (
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Customer Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          <span>{order.customer_info?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} />
                          <span>{order.customer_info?.email}</span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin size={14} className="mt-0.5" />
                          <span>
                            {order.customer_info?.address}, {order.customer_info?.city},{' '}
                            {order.customer_info?.state} - {order.customer_info?.pincode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="font-medium text-gray-800">{order.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status</span>
                          <span className="font-medium text-green-600">PAID</span>
                        </div>
                        {order.razorpay_payment_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID</span>
                            <span className="font-mono text-xs text-gray-800">
                              {order.razorpay_payment_id}
                            </span>
                          </div>
                        )}
                        {order.razorpay_refund_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Refund ID</span>
                            <span className="font-mono text-xs text-green-600">
                              {order.razorpay_refund_id}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Refund Amount</span>
                          <span className="font-bold text-[#2d6d4c]">₹{order.total.toFixed(2)}</span>
                        </div>
                        {order.cancelled_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cancelled On</span>
                            <span className="text-gray-800">
                              {new Date(order.cancelled_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.weight} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium text-gray-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  {order.cancel_reason && (
                    <div className="mt-6 bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle size={18} className="text-red-600" />
                        <h4 className="font-semibold text-red-800">Cancellation Reason</h4>
                      </div>
                      <p className="text-sm text-red-700 bg-white p-3 rounded-lg border border-red-100">
                        {order.cancel_reason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    {order.refund_status === 'processing' && (
                      <>
                        {/* Show internal error to admin if previous attempt failed */}
                        {order.refund_error_internal && (
                          <div className="flex items-start gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg mb-3">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Previous attempt failed (Admin only)</span>
                              <p className="text-xs text-orange-500 mt-1">Customer sees: "Payment Under Process"</p>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => openVerifyModal(order)}
                          disabled={processingRefund === order.order_id}
                          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#2d6d4c] hover:bg-[#245a3e] text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          {processingRefund === order.order_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={18} />
                              {order.refund_error_internal ? 'Retry Transfer' : 'Verify & Transfer'} (₹{order.total.toFixed(2)})
                            </>
                          )}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          {order.refund_error_internal 
                            ? 'Previous transfer failed. Click to retry the refund transfer.'
                            : `Click to verify order details and transfer ₹${order.total.toFixed(2)} back to the customer via Razorpay.`
                          }
                        </p>
                      </>
                    )}

                    {order.refund_status === 'completed' && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                        <CheckCircle size={20} />
                        <div>
                          <span className="font-medium">Refund Completed Successfully</span>
                          {order.razorpay_refund_id && (
                            <p className="text-sm text-green-500 mt-1">
                              Refund ID: {order.razorpay_refund_id}
                            </p>
                          )}
                          <p className="text-sm text-green-500 mt-1">
                            Customer can see "Refund Completed" in their order tracking.
                          </p>
                        </div>
                      </div>
                    )}

                    {order.refund_status === 'failed' && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                          <XCircle size={20} className="mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Refund Transfer Failed</span>
                            {order.refund_error && (
                              <p className="text-sm text-red-500 mt-1">{order.refund_error}</p>
                            )}
                            <p className="text-sm text-red-500 mt-1">
                              Customer can see "Payment Failed" status. Please retry the refund.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRetryRefund(order)}
                          className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          <RefreshCw size={16} />
                          Retry Refund Transfer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        );
      })()}

      {/* Verify & Transfer Modal */}
      {showVerifyModal && selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !verifyingOrder && setShowVerifyModal(false)} />
          <div className="relative z-[10000] shadow-xl max-w-lg w-full rounded-2xl overflow-hidden bg-[#2d6d4c]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2d6d4c] to-[#245a3e] p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Verify & Transfer Refund</h2>
                  <p className="text-white/80 text-sm">Order #{selectedOrder.order_id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Banknote size={18} className="text-[#2d6d4c]" />
                  Refund Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Name</span>
                    <span className="font-medium text-gray-800">{selectedOrder.customer_info?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-mono text-xs text-gray-800">{selectedOrder.razorpay_payment_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total</span>
                    <span className="font-bold text-[#2d6d4c]">₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Amount</span>
                    <span className="font-bold text-[#2d6d4c]">₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                      <span className="flex-1 text-gray-700">{item.name}</span>
                      <span className="text-gray-500">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Important</p>
                    <p className="mt-1">
                      This will transfer ₹{selectedOrder.total.toFixed(2)} from your Razorpay account to the customer's original payment method. 
                      The customer will automatically see "Refund Completed" in their order tracking.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  disabled={verifyingOrder}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndTransfer}
                  disabled={verifyingOrder}
                  className="flex-1 bg-[#2d6d4c] hover:bg-[#245a3e] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifyingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <Banknote size={18} />
                      Confirm & Transfer ₹{selectedOrder.total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
