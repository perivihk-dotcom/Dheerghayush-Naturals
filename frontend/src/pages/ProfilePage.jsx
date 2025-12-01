import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, Plus, Edit2, Trash2, Check, ChevronRight, LogOut, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import useBackgroundRefresh from '../hooks/useBackgroundRefresh';

const ProfilePage = () => {
  const { user, token, logout, isAuthenticated, BACKEND_URL } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', is_primary: false
  });

  // Fetch functions for background refresh
  const fetchOrdersData = useCallback(async () => {
    if (!token) return [];
    const response = await fetch(`${BACKEND_URL}/api/user/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch orders');
  }, [BACKEND_URL, token]);

  const fetchAddressesData = useCallback(async () => {
    if (!token) return [];
    const response = await fetch(`${BACKEND_URL}/api/user/addresses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch addresses');
  }, [BACKEND_URL, token]);

  // Use background refresh - refreshes every 20 seconds silently
  const { data: ordersData, loading: ordersLoading, refresh: refreshOrders } = useBackgroundRefresh(fetchOrdersData, {
    interval: 20000,
    enabled: isAuthenticated && activeTab === 'orders',
    deps: [token],
  });

  const { data: addressesData, loading: addressesLoading, refresh: refreshAddresses } = useBackgroundRefresh(fetchAddressesData, {
    interval: 30000,
    enabled: isAuthenticated && activeTab === 'addresses',
    deps: [token],
  });

  const orders = ordersData || [];
  const addresses = addressesData || [];
  const loading = activeTab === 'orders' ? ordersLoading : addressesLoading;

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'orders';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Legacy functions for manual refresh after mutations
  const fetchAddresses = () => refreshAddresses();
  const fetchOrders = () => refreshOrders();

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAddress 
        ? `${BACKEND_URL}/api/user/addresses/${editingAddress.id}`
        : `${BACKEND_URL}/api/user/addresses`;
      
      const response = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });

      if (response.ok) {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', is_primary: false });
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/addresses/${addressId}/primary`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting primary address:', error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      email: address.email || '',
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_primary: address.is_primary
    });
    setShowAddressForm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-[#2d6d4c]/20 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#2d6d4c]/20 rounded-full flex items-center justify-center">
                <User size={32} className="text-[#2d6d4c]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
                <p className="text-gray-500">{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'orders' 
                ? 'bg-[#2d6d4c] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package size={20} />
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'addresses' 
                ? 'bg-[#2d6d4c] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin size={20} />
            My Addresses
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6d4c]"></div>
          </div>
        ) : activeTab === 'orders' ? (
          /* Orders Tab */
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-[#2d6d4c] text-white px-6 py-2 rounded-lg hover:bg-[#245a3e] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const getStatusInfo = (status) => {
                  const statusMap = {
                    pending: { icon: Clock, color: 'yellow', label: 'Order Pending', progress: 10 },
                    confirmed: { icon: Check, color: 'blue', label: 'Confirmed', progress: 25 },
                    processing: { icon: Package, color: 'purple', label: 'Processing', progress: 40 },
                    shipped: { icon: Package, color: 'indigo', label: 'Shipped', progress: 60 },
                    out_for_delivery: { icon: Package, color: 'orange', label: 'Out for Delivery', progress: 80 },
                    delivered: { icon: Check, color: 'green', label: 'Delivered', progress: 100 },
                    cancelled: { icon: Package, color: 'red', label: 'Cancelled', progress: 0 }
                  };
                  return statusMap[status] || { icon: Package, color: 'gray', label: status, progress: 0 };
                };
                
                const statusInfo = getStatusInfo(order.order_status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div 
                    key={order.order_id} 
                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  >
                    {/* Order Header with Status Indicator */}
                    <div className={`px-4 py-3 border-b border-gray-100 ${
                      order.order_status === 'delivered' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                      order.order_status === 'cancelled' ? 'bg-gradient-to-r from-red-50 to-pink-50' :
                      order.order_status === 'out_for_delivery' ? 'bg-gradient-to-r from-orange-50 to-amber-50' :
                      'bg-gradient-to-r from-gray-50 to-slate-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            order.order_status === 'delivered' ? 'bg-[#2d6d4c]/20' :
                            order.order_status === 'cancelled' ? 'bg-red-100' :
                            order.order_status === 'out_for_delivery' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <StatusIcon size={18} className={`${
                              order.order_status === 'delivered' ? 'text-[#2d6d4c]' :
                              order.order_status === 'cancelled' ? 'text-red-600' :
                              order.order_status === 'out_for_delivery' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Order ID</p>
                            <p className="font-semibold text-gray-800">{order.order_id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                            {order.order_status === 'delivered' && <Check size={12} />}
                            {order.order_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Mini Progress Bar for active orders */}
                      {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Order Progress</span>
                            <span>{statusInfo.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                order.order_status === 'out_for_delivery' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                'bg-gradient-to-r from-green-400 to-[#3d8b66]'
                              }`}
                              style={{ width: `${statusInfo.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Order Items */}
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-sm"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-14 h-14 bg-gray-100 rounded-xl border-2 border-white flex items-center justify-center text-gray-500 text-sm font-medium shadow-sm">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                          <p className="text-[#2d6d4c] font-bold text-lg">₹{order.total.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/profile/orders/${order.order_id}`)}
                          className="flex items-center gap-2 bg-[#2d6d4c]/10 hover:bg-[#2d6d4c]/20 text-[#2d6d4c] px-4 py-2.5 rounded-xl font-medium transition-colors group"
                        >
                          <span className="hidden sm:inline">Track Order</span>
                          <span className="sm:hidden">Track</span>
                          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                      
                      {/* Quick Status Message */}
                      {order.order_status === 'out_for_delivery' && (
                        <div className="mt-3 flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <p className="text-sm text-orange-700 font-medium">Your order is on its way!</p>
                        </div>
                      )}
                      {order.order_status === 'delivered' && (
                        <div className="mt-3 flex items-center gap-2 p-2 bg-[#2d6d4c]/10 rounded-lg">
                          <Check size={14} className="text-[#2d6d4c]" />
                          <p className="text-sm text-[#2d6d4c] font-medium">Delivered successfully</p>
                        </div>
                      )}
                      {order.order_status === 'cancelled' && order.payment_method === 'RAZORPAY' && order.payment_status === 'paid' && (
                        <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <Clock size={14} className="text-blue-600" />
                          <p className="text-sm text-blue-700 font-medium">
                            {order.refund_status === 'completed' 
                              ? 'Refund completed' 
                              : 'Refund under process (1-2 business days)'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Addresses Tab */
          <div>
            <button
              onClick={() => {
                setEditingAddress(null);
                setAddressForm({ name: '', email: user?.email || '', phone: '', address: '', city: '', state: '', pincode: '', is_primary: false });
                setShowAddressForm(true);
              }}
              className="flex items-center gap-2 bg-[#2d6d4c] text-white px-4 py-2 rounded-lg hover:bg-[#245a3e] transition-colors mb-4"
            >
              <Plus size={20} />
              Add New Address
            </button>

            {showAddressForm && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({...addressForm, email: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={addressForm.phone}
                    onChange={(e) => {
                      let phone = e.target.value;
                      if (phone.startsWith('0')) {
                        phone = phone.substring(1);
                      }
                      setAddressForm({...addressForm, phone: phone});
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    required
                  />
                  <textarea
                    placeholder="Address"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                    className="md:col-span-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    rows={2}
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d6d4c]"
                    required
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addressForm.is_primary}
                      onChange={(e) => setAddressForm({...addressForm, is_primary: e.target.checked})}
                      className="w-4 h-4 text-[#2d6d4c]"
                    />
                    <span className="text-gray-700">Set as primary address</span>
                  </label>
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      className="bg-[#2d6d4c] text-white px-6 py-2 rounded-lg hover:bg-[#245a3e] transition-colors"
                    >
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.length === 0 ? (
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-12 text-center">
                  <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses saved</h3>
                  <p className="text-gray-500">Add an address for faster checkout</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-2xl shadow-sm p-4 border-2 ${
                      addr.is_primary ? 'border-[#2d6d4c]' : 'border-transparent'
                    }`}
                  >
                    {addr.is_primary && (
                      <span className="inline-flex items-center gap-1 bg-[#2d6d4c]/20 text-[#2d6d4c] text-xs font-medium px-2 py-1 rounded mb-2">
                        <Check size={14} />
                        Primary
                      </span>
                    )}
                    <h4 className="font-semibold text-gray-800">{addr.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                    <p className="text-gray-600 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-600 text-sm">Phone: {addr.phone}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                      {!addr.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(addr.id)}
                          className="flex items-center gap-1 text-[#2d6d4c] hover:text-[#2d6d4c] text-sm"
                        >
                          <Check size={14} />
                          Set Primary
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
