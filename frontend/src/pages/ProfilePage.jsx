import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, Plus, Edit2, Trash2, Check, ChevronRight, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

const ProfilePage = () => {
  const { user, token, logout, isAuthenticated, BACKEND_URL } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', is_primary: false
  });

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'orders';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'orders') {
      await fetchOrders();
    } else {
      await fetchAddresses();
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

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
      delivered: 'bg-green-100 text-green-800',
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-green-600" />
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
                ? 'bg-green-600 text-white' 
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
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin size={20} />
            My Addresses
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.order_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium text-gray-800">{order.order_id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                          {order.order_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{order.items.length} item(s)</p>
                        <p className="text-green-600 font-bold">₹{order.total.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/orders/${order.order_id}`)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        View Details
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
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
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-4"
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
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({...addressForm, email: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
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
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  />
                  <textarea
                    placeholder="Address"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                    className="md:col-span-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    rows={2}
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addressForm.is_primary}
                      onChange={(e) => setAddressForm({...addressForm, is_primary: e.target.checked})}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700">Set as primary address</span>
                  </label>
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                      addr.is_primary ? 'border-green-500' : 'border-transparent'
                    }`}
                  >
                    {addr.is_primary && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded mb-2">
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
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
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
