import React, { useState, useCallback, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import useBackgroundRefresh from '../../hooks/useBackgroundRefresh';
import { 
  LayoutDashboard, Package, ShoppingCart, Tag, LogOut,
  TrendingUp, DollarSign, Clock, CheckCircle, Image, 
  ArrowUpRight, ArrowDownRight, Users, Activity, RefreshCw,
  Layers, AlertCircle, Truck, XCircle, Search, X
} from 'lucide-react';
import { businessInfo } from '../../data/mock';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminReplacements from './AdminReplacements';
import AdminRefunds from './AdminRefunds';
import AdminCategories from './AdminCategories';
import AdminBanners from './AdminBanners';

const AdminDashboard = () => {
  const { admin, logout, token, BACKEND_URL } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [initialFilter, setInitialFilter] = useState(null);
  const [targetOrderId, setTargetOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Helper function to navigate to a tab with a specific filter
  const navigateWithFilter = (tab, filter) => {
    setInitialFilter(filter);
    setTargetOrderId(null);
    setActiveTab(tab);
  };

  // Search orders by ID or customer name
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setSearchLoading(true);
    setShowSearchResults(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=500`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];
        const searchLower = query.toLowerCase();
        const filtered = orders.filter(order => 
          order.order_id.toLowerCase().includes(searchLower) ||
          order.customer_info?.name?.toLowerCase().includes(searchLower) ||
          order.customer_info?.phone?.includes(query)
        ).slice(0, 8);
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Navigate to order in AdminOrders with specific order ID
  const goToOrder = (order) => {
    setSearchQuery('');
    setShowSearchResults(false);
    setInitialFilter(order.order_status);
    setTargetOrderId(order.order_id);
    setActiveTab('orders');
  };

  // Fetch functions for background refresh
  const fetchDashboardStatsData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch stats');
  }, [BACKEND_URL, token]);

  const fetchRecentOrdersData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      return data.orders || [];
    }
    throw new Error('Failed to fetch orders');
  }, [BACKEND_URL, token]);

  const fetchNotificationCountsData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=500`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      const orders = data.orders || [];
      return {
        // Order Pipeline
        newOrdersCount: orders.filter(o => o.order_status === 'pending').length,
        confirmedCount: orders.filter(o => o.order_status === 'confirmed').length,
        shippedCount: orders.filter(o => o.order_status === 'shipped').length,
        outForDeliveryCount: orders.filter(o => o.order_status === 'out_for_delivery').length,
        deliveredCount: orders.filter(o => o.order_status === 'delivered').length,
        // Replacement Pipeline
        replacementRequestedCount: orders.filter(o => o.order_status === 'replacement_requested').length,
        replacementAcceptedCount: orders.filter(o => o.order_status === 'replacement_accepted').length,
        replacementProcessingCount: orders.filter(o => o.order_status === 'replacement_processing').length,
        replacementShippedCount: orders.filter(o => o.order_status === 'replacement_shipped').length,
        replacementOutForDeliveryCount: orders.filter(o => o.order_status === 'replacement_out_for_delivery').length,
        replacementDeliveredCount: orders.filter(o => o.order_status === 'replacement_delivered').length,
        replacementRejectedCount: orders.filter(o => o.order_status === 'replacement_rejected').length,
        totalReplacementsCount: orders.filter(o => o.order_status?.startsWith('replacement_')).length,
        // Refund Pipeline (only prepaid/RAZORPAY orders)
        refundProcessingCount: orders.filter(o => o.order_status === 'cancelled' && o.payment_method === 'RAZORPAY' && o.payment_status === 'paid' && o.refund_status === 'processing').length,
        refundCompletedCount: orders.filter(o => o.refund_status === 'completed').length,
        refundFailedCount: orders.filter(o => o.refund_status === 'failed').length,
        cancelledPrepaidCount: orders.filter(o => o.order_status === 'cancelled' && o.payment_method === 'RAZORPAY' && o.payment_status === 'paid').length
      };
    }
    throw new Error('Failed to fetch notification counts');
  }, [BACKEND_URL, token]);

  // Use background refresh - refreshes every 15 seconds silently
  const { data: stats, loading } = useBackgroundRefresh(fetchDashboardStatsData, {
    interval: 15000,
    enabled: activeTab === 'dashboard',
  });

  const { data: recentOrdersData } = useBackgroundRefresh(fetchRecentOrdersData, {
    interval: 15000,
    enabled: activeTab === 'dashboard',
  });

  const recentOrders = recentOrdersData || [];

  const { data: notificationCounts } = useBackgroundRefresh(fetchNotificationCountsData, {
    interval: 10000, // Check for new orders more frequently
    enabled: true,
  });

  // Order Pipeline counts
  const newOrdersCount = notificationCounts?.newOrdersCount || 0;
  const confirmedCount = notificationCounts?.confirmedCount || 0;
  const shippedCount = notificationCounts?.shippedCount || 0;
  const outForDeliveryCount = notificationCounts?.outForDeliveryCount || 0;
  const deliveredCount = notificationCounts?.deliveredCount || 0;
  
  // Replacement Pipeline counts
  const replacementRequestedCount = notificationCounts?.replacementRequestedCount || 0;
  const replacementAcceptedCount = notificationCounts?.replacementAcceptedCount || 0;
  const replacementProcessingCount = notificationCounts?.replacementProcessingCount || 0;
  const replacementShippedCount = notificationCounts?.replacementShippedCount || 0;
  const replacementOutForDeliveryCount = notificationCounts?.replacementOutForDeliveryCount || 0;
  const replacementDeliveredCount = notificationCounts?.replacementDeliveredCount || 0;
  const replacementRejectedCount = notificationCounts?.replacementRejectedCount || 0;
  const totalReplacementsCount = notificationCounts?.totalReplacementsCount || 0;
  
  // Refund Pipeline counts (only prepaid/RAZORPAY orders)
  const refundProcessingCount = notificationCounts?.refundProcessingCount || 0;
  const refundCompletedCount = notificationCounts?.refundCompletedCount || 0;
  const refundFailedCount = notificationCounts?.refundFailedCount || 0;
  const cancelledPrepaidCount = notificationCounts?.cancelledPrepaidCount || 0;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { id: 'products', label: 'Products', icon: Package, badge: 0 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: newOrdersCount },
    { id: 'replacements', label: 'Replacements', icon: Activity, badge: replacementRequestedCount },
    { id: 'refunds', label: 'Refunds', icon: DollarSign, badge: refundProcessingCount },
    { id: 'categories', label: 'Categories', icon: Tag, badge: 0 },
    { id: 'banners', label: 'Banners', icon: Image, badge: 0 },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-[#2d6d4c]/20 text-[#2d6d4c]',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders initialFilter={initialFilter} targetOrderId={targetOrderId} onFilterApplied={() => { setInitialFilter(null); setTargetOrderId(null); }} />;
      case 'replacements':
        return <AdminReplacements initialFilter={initialFilter} onFilterApplied={() => setInitialFilter(null)} />;
      case 'refunds':
        return <AdminRefunds initialFilter={initialFilter} onFilterApplied={() => setInitialFilter(null)} />;
      case 'categories':
        return <AdminCategories />;
      case 'banners':
        return <AdminBanners />;
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#2d6d4c] to-[#3d8b66] rounded-2xl p-4 md:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Welcome back, {admin?.name?.split(' ')[0]}! 👋</h2>
                  <p className="text-white/80 mt-1 text-sm md:text-base">Here's what's happening with your store today.</p>
                </div>
                <div className="hidden md:block">
                  <img 
                    src={businessInfo.logo} 
                    alt={businessInfo.name}
                    className="w-16 h-16 rounded-xl object-contain opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer name, or phone..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    className="w-full pl-12 pr-10 py-3 border-0 rounded-xl focus:ring-2 focus:ring-[#2d6d4c] bg-gray-50 text-gray-900 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d6d4c] mx-auto"></div>
                      <p className="text-gray-500 mt-2 text-sm">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center">
                      <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No orders found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((order) => (
                        <div
                          key={order.order_id}
                          onClick={() => goToOrder(order)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#2d6d4c]/20 to-[#2d6d4c]/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-[#2d6d4c]">
                                  {order.customer_info?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{order.customer_info?.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    #{order.order_id.slice(0, 8).toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-400">{order.customer_info?.phone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{order.total?.toLocaleString()}</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                {order.order_status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 bg-gray-50 text-center">
                        <button
                          onClick={() => { setActiveTab('orders'); setShowSearchResults(false); }}
                          className="text-[#2d6d4c] text-sm font-medium hover:underline"
                        >
                          View all orders →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close search results */}
            {showSearchResults && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSearchResults(false)}
              />
            )}

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
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2d6d4c]/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-[#2d6d4c]" />
                    </div>
                    <span className="flex items-center text-[#2d6d4c] text-xs font-medium">
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
                    <span className="flex items-center text-[#2d6d4c] text-xs font-medium">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      8%
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Orders</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
                </div>

                {/* Total Products */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('products')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Products</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total_products}</p>
                </div>

                {/* Total Categories */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('categories')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Categories</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total_categories}</p>
                </div>
              </div>
            )}

            {/* Order Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Order Pipeline</h3>
                </div>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-yellow-50 rounded-xl p-3 text-center cursor-pointer hover:bg-yellow-100 transition" onClick={() => navigateWithFilter('orders', 'pending')}>
                  <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-yellow-700">{newOrdersCount}</p>
                  <p className="text-xs text-yellow-600">New</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center cursor-pointer hover:bg-blue-100 transition" onClick={() => navigateWithFilter('orders', 'confirmed')}>
                  <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-700">{confirmedCount}</p>
                  <p className="text-xs text-blue-600">Confirmed</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-center cursor-pointer hover:bg-indigo-100 transition" onClick={() => navigateWithFilter('orders', 'shipped')}>
                  <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-indigo-700">{shippedCount}</p>
                  <p className="text-xs text-indigo-600">Shipped</p>
                </div>
                <div className="bg-cyan-50 rounded-xl p-3 text-center cursor-pointer hover:bg-cyan-100 transition" onClick={() => navigateWithFilter('orders', 'out_for_delivery')}>
                  <Truck className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-cyan-700">{outForDeliveryCount}</p>
                  <p className="text-xs text-cyan-600">Out for Delivery</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center cursor-pointer hover:bg-green-100 transition" onClick={() => navigateWithFilter('orders', 'delivered')}>
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-700">{deliveredCount}</p>
                  <p className="text-xs text-green-600">Delivered</p>
                </div>
              </div>
            </div>

            {/* Replacement Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Replacement Pipeline</h3>
                  {replacementRequestedCount > 0 && (
                    <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {replacementRequestedCount} New
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setActiveTab('replacements')}
                  className="text-pink-600 text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                <div className="bg-pink-50 rounded-xl p-3 text-center cursor-pointer hover:bg-pink-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_requested')}>
                  <AlertCircle className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-pink-700">{replacementRequestedCount}</p>
                  <p className="text-xs text-pink-600">Requested</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center cursor-pointer hover:bg-green-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_accepted')}>
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-700">{replacementAcceptedCount}</p>
                  <p className="text-xs text-green-600">Accepted</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center cursor-pointer hover:bg-blue-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_processing')}>
                  <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-700">{replacementProcessingCount}</p>
                  <p className="text-xs text-blue-600">Processing</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-center cursor-pointer hover:bg-indigo-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_shipped')}>
                  <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-indigo-700">{replacementShippedCount}</p>
                  <p className="text-xs text-indigo-600">Shipped</p>
                </div>
                <div className="bg-cyan-50 rounded-xl p-3 text-center cursor-pointer hover:bg-cyan-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_out_for_delivery')}>
                  <Truck className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-cyan-700">{replacementOutForDeliveryCount}</p>
                  <p className="text-xs text-cyan-600">Out for Delivery</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center cursor-pointer hover:bg-emerald-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_delivered')}>
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-emerald-700">{replacementDeliveredCount}</p>
                  <p className="text-xs text-emerald-600">Delivered</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center cursor-pointer hover:bg-red-100 transition" onClick={() => navigateWithFilter('replacements', 'replacement_rejected')}>
                  <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-red-700">{replacementRejectedCount}</p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>
              </div>
            </div>

            {/* Refund Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Refund Pipeline</h3>
                  {refundProcessingCount > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {refundProcessingCount} Pending
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setActiveTab('refunds')}
                  className="text-amber-600 text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-red-50 rounded-xl p-3 text-center cursor-pointer hover:bg-red-100 transition" onClick={() => navigateWithFilter('refunds', 'all')}>
                  <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-red-700">{cancelledPrepaidCount}</p>
                  <p className="text-xs text-red-600">Cancelled (Prepaid)</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center cursor-pointer hover:bg-amber-100 transition" onClick={() => navigateWithFilter('refunds', 'processing')}>
                  <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-700">{refundProcessingCount}</p>
                  <p className="text-xs text-amber-600">Processing</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center cursor-pointer hover:bg-green-100 transition" onClick={() => navigateWithFilter('refunds', 'completed')}>
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-700">{refundCompletedCount}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center cursor-pointer hover:bg-rose-100 transition" onClick={() => navigateWithFilter('refunds', 'failed')}>
                  <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-rose-700">{refundFailedCount}</p>
                  <p className="text-xs text-rose-600">Failed</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-[#2d6d4c] text-sm font-medium hover:text-[#2d6d4c]"
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
            <img 
              src={businessInfo.logo} 
              alt={businessInfo.name}
              className="w-10 h-10 rounded-xl object-contain shadow-lg"
            />
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
                    ? 'bg-[#2d6d4c]/10 text-[#2d6d4c] shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && activeTab !== item.id && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-[#2d6d4c] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-[#245a3e] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
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
            <img 
              src={businessInfo.logo} 
              alt={businessInfo.name}
              className="w-8 h-8 rounded-lg object-contain"
            />
          </div>
          
          <h1 className="font-bold text-gray-900">Admin</h1>
          
          {/* Profile Button */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-gradient-to-br from-green-400 to-[#245a3e] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
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
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all relative ${
                activeTab === item.id
                  ? 'bg-[#2d6d4c]/10 text-[#2d6d4c]'
                  : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#2d6d4c]' : 'text-gray-400'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${activeTab === item.id ? 'text-[#2d6d4c]' : 'text-gray-400'}`}>
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
