import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, ChevronDown, ChevronUp, Package, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminOrders = () => {
  const { token, BACKEND_URL } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      let url = `${BACKEND_URL}/api/admin/orders?limit=100`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
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
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-500">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm text-gray-500">#{order.order_id.slice(0, 8)}</p>
                      <p className="font-medium text-gray-900">{order.customer_info.name}</p>
                      <p className="text-sm text-gray-500">{order.customer_info.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                    <p className="font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                    {expandedOrder === order.order_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.order_id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Customer Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Email:</span> {order.customer_info.email}</p>
                        <p><span className="text-gray-500">Phone:</span> {order.customer_info.phone}</p>
                        <p><span className="text-gray-500">Address:</span> {order.customer_info.address}</p>
                        <p><span className="text-gray-500">City:</span> {order.customer_info.city}, {order.customer_info.state} - {order.customer_info.pincode}</p>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Payment Method:</span> {order.payment_method}</p>
                        <p><span className="text-gray-500">Order Date:</span> {formatDate(order.created_at)}</p>
                        <p><span className="text-gray-500">Subtotal:</span> ₹{order.subtotal}</p>
                        <p><span className="text-gray-500">Shipping:</span> ₹{order.shipping_fee}</p>
                        <p className="font-semibold"><span className="text-gray-500">Total:</span> ₹{order.total}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.weight} × {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.order_id, status, status === 'delivered' ? 'paid' : null)}
                          disabled={order.order_status === status}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            order.order_status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Total Count */}
      <p className="text-sm text-gray-500 text-center">Showing {filteredOrders.length} of {total} orders</p>
    </div>
  );
};

export default AdminOrders;
