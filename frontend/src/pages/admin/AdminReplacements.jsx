import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import useBackgroundRefresh from '../../hooks/useBackgroundRefresh';
import { Search, ChevronDown, ChevronUp, Package, Clock, Truck, CheckCircle, XCircle, MapPin, CreditCard, AlertCircle, RotateCcw } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const AdminReplacements = ({ initialFilter, onFilterApplied }) => {
  const { token, BACKEND_URL } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStep, setActiveStep] = useState(initialFilter || 'replacement_requested');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [total, setTotal] = useState(0);

  // Apply initial filter when it changes
  useEffect(() => {
    if (initialFilter) {
      setActiveStep(initialFilter);
      if (onFilterApplied) onFilterApplied();
    }
  }, [initialFilter, onFilterApplied]);

  const replacementSteps = [
    { id: 'replacement_requested', label: 'New Requests', icon: RotateCcw, color: 'pink' },
    { id: 'replacement_accepted', label: 'Accepted', icon: CheckCircle, color: 'green' },
    { id: 'replacement_rejected', label: 'Rejected', icon: XCircle, color: 'red' },
    { id: 'replacement_processing', label: 'Processing', icon: Package, color: 'blue' },
    { id: 'replacement_shipped', label: 'Shipped', icon: Truck, color: 'indigo' },
    { id: 'replacement_out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'cyan' },
    { id: 'replacement_delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
  ];

  const replacementStatuses = [
    'replacement_requested',
    'replacement_accepted',
    'replacement_rejected',
    'replacement_processing',
    'replacement_shipped',
    'replacement_out_for_delivery',
    'replacement_delivered'
  ];

  // Fetch function for background refresh
  const fetchOrdersData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=500`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      return data.orders.filter(order => 
        replacementStatuses.includes(order.order_status)
      );
    }
    throw new Error('Failed to fetch orders');
  }, [BACKEND_URL, token]);

  // Use background refresh - refreshes every 15 seconds silently
  const { data: ordersData, loading, refresh } = useBackgroundRefresh(fetchOrdersData, {
    interval: 15000,
    enabled: true,
  });

  // Update local state when data changes
  useEffect(() => {
    if (ordersData) {
      setAllOrders(ordersData);
      setTotal(ordersData.length);
    }
  }, [ordersData]);

  useEffect(() => {
    const filtered = allOrders.filter(order => order.order_status === activeStep);
    setOrders(filtered);
  }, [activeStep, allOrders]);

  // Legacy fetchOrders for manual refresh after updates
  const fetchOrders = () => {
    refresh();
  };

  const getStepCount = (stepId) => {
    return allOrders.filter(order => order.order_status === stepId).length;
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_status: orderStatus })
      });

      if (response.ok) {
        fetchOrders();
      } else {
        toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'replacement_requested': return <RotateCcw className="w-4 h-4" />;
      case 'replacement_accepted': return <CheckCircle className="w-4 h-4" />;
      case 'replacement_rejected': return <XCircle className="w-4 h-4" />;
      case 'replacement_processing': return <Package className="w-4 h-4" />;
      case 'replacement_shipped': return <Truck className="w-4 h-4" />;
      case 'replacement_out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'replacement_delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'replacement_requested': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'replacement_accepted': return 'bg-[#2d6d4c]/20 text-[#2d6d4c] border-[#2d6d4c]/30';
      case 'replacement_rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'replacement_processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'replacement_shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'replacement_out_for_delivery': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'replacement_delivered': return 'bg-[#2d6d4c]/20 text-[#2d6d4c] border-[#2d6d4c]/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-[#2d6d4c]/20 text-[#2d6d4c]';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(searchLower) ||
      order.customer_info.name.toLowerCase().includes(searchLower) ||
      order.customer_info.email.toLowerCase().includes(searchLower) ||
      order.customer_info.phone.includes(searchTerm)
    );
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStep = replacementSteps.find(s => s.id === activeStep);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Replacements</h2>
            <p className="text-pink-100 mt-1 text-sm md:text-base">Manage replacement requests</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <RotateCcw className="w-5 h-5" />
            <span className="font-semibold">{total} Total Replacements</span>
          </div>
        </div>
      </div>


      {/* Replacement Status Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {replacementSteps.map((step) => {
            const StepIcon = step.icon;
            const count = getStepCount(step.id);
            const isActive = activeStep === step.id;
            
            const colorClasses = {
              pink: isActive ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100',
              green: isActive ? 'bg-[#2d6d4c] text-white' : 'bg-[#2d6d4c]/10 text-[#2d6d4c] hover:bg-[#2d6d4c]/20',
              red: isActive ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100',
              blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
              indigo: isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
              cyan: isActive ? 'bg-cyan-500 text-white' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
            };
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${colorClasses[step.color]} ${isActive ? 'shadow-lg' : ''}`}
              >
                <StepIcon className="w-4 h-4" />
                <span className="text-sm">{step.label}</span>
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-current/10'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading replacements...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No replacements found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-pink-600">
                        {order.customer_info?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer_info.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          #{order.order_id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{order.customer_info.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      {order.order_status.replace(/replacement_/g, '').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                    <p className="font-bold text-gray-900 text-lg">₹{order.total.toLocaleString()}</p>
                    <div className={`p-2 rounded-xl transition ${expandedOrder === order.order_id ? 'bg-pink-100' : 'bg-gray-100'}`}>
                      {expandedOrder === order.order_id ? (
                        <ChevronUp className="w-5 h-5 text-pink-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Expanded Details */}
              {expandedOrder === order.order_id && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Delivery Details</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600"><span className="text-gray-400">Email:</span> {order.customer_info.email}</p>
                          <p className="text-gray-600"><span className="text-gray-400">Phone:</span> {order.customer_info.phone}</p>
                          <p className="text-gray-600"><span className="text-gray-400">Address:</span> {order.customer_info.address}</p>
                          <p className="text-gray-600">{order.customer_info.city}, {order.customer_info.state} - {order.customer_info.pincode}</p>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-[#2d6d4c]/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-[#2d6d4c]" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Payment Details</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600"><span className="text-gray-400">Method:</span> {order.payment_method}</p>
                          <p className="text-gray-600"><span className="text-gray-400">Date:</span> {formatDate(order.created_at)}</p>
                          <div className="pt-2 mt-2 border-t border-gray-100">
                            <p className="text-gray-600"><span className="text-gray-400">Subtotal:</span> ₹{order.subtotal}</p>
                            <p className="text-gray-600"><span className="text-gray-400">Shipping:</span> ₹{order.shipping_fee}</p>
                            <p className="font-semibold text-gray-900 mt-1">Total: ₹{order.total}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Order Items ({order.items.length})</h4>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.weight} × {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Replacement Info */}
                    <div className="mt-6 bg-pink-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-pink-600" />
                        <h4 className="font-semibold text-pink-800">Replacement Request</h4>
                      </div>
                      {order.replacement_reason ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-pink-800">Customer's Reason:</p>
                          <p className="text-sm text-pink-700 bg-white p-3 rounded-lg border border-pink-100">
                            {order.replacement_reason}
                          </p>
                          {order.replacement_requested_at && (
                            <p className="text-xs text-pink-600 mt-2">
                              Requested on: {formatDate(order.replacement_requested_at)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-pink-700">
                          Customer has requested a replacement for this order.
                          {order.replacement_requested_at && (
                            <span className="block mt-1">Requested on: {formatDate(order.replacement_requested_at)}</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4">Update Replacement Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {/* Show Accepted/Rejected only for requested status */}
                        {order.order_status === 'replacement_requested' && (
                          <>
                            {['replacement_accepted', 'replacement_rejected'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(order.order_id, status)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                              >
                                {status.replace(/replacement_/g, '').replace(/\b\w/g, l => l.toUpperCase())}
                              </button>
                            ))}
                          </>
                        )}
                        {/* Show only Rejected for rejected status */}
                        {order.order_status === 'replacement_rejected' && (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white border-2 border-blue-600 cursor-default shadow-sm"
                          >
                            Rejected
                          </button>
                        )}
                        {/* Show delivery flow options only if status is accepted or beyond (not rejected) */}
                        {['replacement_accepted', 'replacement_processing', 'replacement_shipped', 'replacement_out_for_delivery', 'replacement_delivered'].includes(order.order_status) && (
                          <>
                            {['replacement_accepted', 'replacement_processing', 'replacement_shipped', 'replacement_out_for_delivery', 'replacement_delivered'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(order.order_id, status)}
                                disabled={order.order_status === status}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                  order.order_status === status
                                    ? 'bg-blue-500 text-white border-2 border-blue-600 cursor-default shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                              >
                                {status.replace(/replacement_/g, '').replace(/\b\w/g, l => l.toUpperCase())}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 text-center">
          Showing {filteredOrders.length} {currentStep?.label || ''} replacement{filteredOrders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default AdminReplacements;
