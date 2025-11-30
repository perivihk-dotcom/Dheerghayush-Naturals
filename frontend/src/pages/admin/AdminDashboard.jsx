import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  LayoutDashboard, Package, ShoppingCart, Tag, LogOut,
  TrendingUp, DollarSign, Clock, CheckCircle, Leaf, Image, 
  ArrowUpRight, ArrowDownRight, Users, Activity
} from 'lucide-react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCategories from './AdminCategories';
import AdminBanners from './AdminBanners';

const AdminDashboard = () => {
  const { admin, logout, token, BACKEND_URL } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'banners', label: 'Banners', icon: Image },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'categories':
        return <AdminCategories />;
      case 'banners':
        return <AdminBanners />;
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-4 md:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Welcome back, {admin?.name?.split(' ')[0]}! 👋</h2>
                  <p className="text-green-100 mt-1 text-sm md:text-base">Here's what's happening with your store today.</p>
                </div>
                <div className="hidden md:block">
                  <Leaf className="w-16 h-16 text-white/20" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 md:p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                    <span className="flex items-center text-green-600 text-xs font-medium">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      12%
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Revenue</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">₹{stats.total_revenue.toLocaleString()}</p>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <span className="flex items-center text-green-600 text-xs font-medium">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      8%
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Orders</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
                </div>

                {/* Pending Orders */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                    </div>
                    {stats.pending_orders > 0 && (
                      <span className="flex items-center text-orange-600 text-xs font-medium">
                        Action needed
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Pending</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.pending_orders}</p>
                </div>

                {/* Delivered */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Delivered</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.delivered_orders}</p>
                </div>
              </div>
            )}

            {/* Second Row - Products & Categories */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 md:p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-xs md:text-sm">Products</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1">{stats.total_products}</p>
                      <p className="text-purple-200 text-xs mt-2">Active in store</p>
                    </div>
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-white/30" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-4 md:p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-200 text-xs md:text-sm">Categories</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1">{stats.total_categories}</p>
                      <p className="text-pink-200 text-xs mt-2">Product types</p>
                    </div>
                    <Tag className="w-10 h-10 md:w-12 md:h-12 text-white/30" />
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-green-600 text-sm font-medium hover:text-green-700"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  recentOrders.slice(0, 5).map((order) => (
                    <div key={order.order_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {order.customer_info?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{order.customer_info?.name}</p>
                            <p className="text-xs text-gray-500">#{order.order_id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">₹{order.total?.toFixed(2)}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile/tablet */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Dheerghayush Naturals</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-green-50 text-green-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="font-semibold text-white">
                  {admin?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{admin?.name}</p>
                <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="font-bold text-gray-900">Admin</h1>
          
          {/* Profile Button */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <span className="font-semibold text-white text-sm">
                {admin?.name?.charAt(0) || 'A'}
              </span>
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-12 right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{admin?.name}</p>
                  <p className="text-xs text-gray-500">{admin?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay for profile menu */}
      {showProfileMenu && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200">
        <div className="flex items-center justify-around py-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] mt-1 font-medium ${activeTab === item.id ? 'text-green-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
