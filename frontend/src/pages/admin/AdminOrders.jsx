import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, ChevronDown, ChevronUp, Package, Clock, Truck, CheckCircle, XCircle, ShoppingCart, MapPin, CreditCard, AlertCircle, PackageCheck, RotateCcw, RefreshCw } from 'lucide-react';

const AdminOrders = () => {
  const { token, BACKEND_URL } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStep, setActiveStep] = useState('pending');
  const [activeReplacementStep, setActiveReplacementStep] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [total, setTotal] = useState(0);

  const orderSteps = [
    { id: 'pending', label: 'New Orders', icon: Clock, color: 'yellow' },
    { id: 'confirmed', label: 'Confirmed', icon: PackageCheck, color: 'blue' },
    { id: 'shipped', label: 'Shipped', icon: Truck, color: 'indigo' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'cyan' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
    { id: 'replacement', label: 'Replacement', icon: RotateCcw, color: 'pink' },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
  ];

  const replacementSubSteps = [
    { id: 'all', label: 'All Requests', color: 'pink' },
    { id: 'replacement_requested', label: 'Pending', color: 'yellow' },
    { id: 'replacement_accepted', label: 'Accepted', color: 'green' },
    { id: 'replacement_rejected', label: 'Rejected', color: 'red' },
    { id: 'replacement_processing', label: 'Processing', color: 'blue' },
    { id: 'replacement_out_for_delivery', label: 'Out for Delivery', color: 'cyan' },
    { id: 'replacement_delivered', label: 'Delivered', color: 'green' },
  ];

  const replacementStatuses = [
    'replacement_requested',
    'replacement_accepted',
    'replacement_rejected',
    'replacement_processing',
    'replacement_out_for_delivery',
    'replacement_delivered'
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on active step
    let filtered;
    if (activeStep === 'replacement') {
      // Filter replacement orders based on sub-step
      if (activeReplacementStep === 'all') {
        filtered = allOrders.filter(order => replacementStatuses.includes(order.order_status));
      } else {
        filtered = allOrders.filter(order => order.order_status === activeReplacementStep);
      }
    } else {
      filtered = allOrders.filter(order => order.order_status === activeStep);
    }
    setOrders(filtered);
  }, [activeStep, activeReplacementStep, allOrders]);

  const fetchOrders = async () => {
    try {
      const url = `${BACKEND_URL}/api/admin/orders?limit=500`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllOrders(data.orders);
        setTotal(data.total);
        // Filter for initial active step
        let filtered;
        if (activeStep === 'replacement') {
          if (activeReplacementStep === 'all') {
            filtered = data.orders.filter(order => replacementStatuses.includes(order.order_status));
          } else {
            filtered = data.orders.filter(order => order.order_status === activeReplacementStep);
          }
        } else {
          filtered = data.orders.filter(order => order.order_status === activeStep);
        }
        setOrders(filtered);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepCount = (stepId) => {
    if (stepId === 'replacement') {
      return allOrders.filter(order => replacementStatuses.includes(order.order_status)).length;
    }
    return allOrders.filter(order => order.order_status === stepId).length;
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus = null) => {
    try {
      const body = { order_status: orderStatus };
      if (paymentStatus) body.payment_status = paymentStatus;

      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <Package className="w-4 h-4" />;

      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'refund_requested': return <RefreshCw className="w-4 h-4" />;
      case 'replacement_requested': return <RotateCcw className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'out_for_delivery': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';

      case 'replacement_requested': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'replacement_accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'replacement_rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'replacement_processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'replacement_completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
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

  // Get current step info
  const currentStep = orderSteps.find(s => s.id === activeStep);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Orders</h2>
            <p className="text-blue-100 mt-1 text-sm md:text-base">Manage and track customer orders</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{total} Total Orders</span>
          </div>
        </div>
      </div>

      {/* Order Status Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {orderSteps.map((step, index) => {
            const StepIcon = step.icon;
            const count = getStepCount(step.id);
            const isActive = activeStep === step.id;
            
            const colorClasses = {
              yellow: isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
              blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
              purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100',
              indigo: isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
              cyan: isActive ? 'bg-cyan-500 text-white' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
              green: isActive ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100',
              orange: isActive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100',
              pink: isActive ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100',
              red: isActive ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100',
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No orders found</p>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
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
                      {order.order_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                    <p className="font-bold text-gray-900 text-lg">₹{order.total.toLocaleString()}</p>
                    <div className={`p-2 rounded-xl transition ${expandedOrder === order.order_id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {expandedOrder === order.order_id ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
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
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-green-600" />
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
                    {order.replacement_status && (
                      <div className="mt-6 bg-pink-50 rounded-xl p-4 border border-pink-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-pink-600" />
                          <h4 className="font-semibold text-pink-800">Replacement Request</h4>
                        </div>
                        <p className="text-sm text-pink-700">
                          Customer has requested a replacement for this order.
                          {order.replacement_requested_at && (
                            <span className="block mt-1">Requested on: {formatDate(order.replacement_requested_at)}</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Non-refundable notice */}
                    <div className="mt-4 text-center py-2 px-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">
                        Products are non-refundable. Replacement available within 7 days of delivery.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {order.order_status === 'replacement_requested' ? 'Update Replacement Status' : 'Update Order Status'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {order.order_status === 'replacement_requested' ? (
                          // Replacement status options
                          ['replacement_accepted', 'replacement_rejected', 'replacement_processing', 'replacement_completed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.order_id, status)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                status === 'replacement_accepted' ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' :
                                status === 'replacement_rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' :
                                status === 'replacement_processing' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200' :
                                'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                              }`}
                            >
                              {status.replace(/replacement_/g, '').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                          ))
                        ) : (
                          // Normal order status options
                          ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.order_id, status, status === 'delivered' ? 'paid' : null)}
                              disabled={order.order_status === status}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                order.order_status === status
                                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-default'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                          ))
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
          Showing {filteredOrders.length} {currentStep?.label || ''} order{filteredOrders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default AdminOrders;
