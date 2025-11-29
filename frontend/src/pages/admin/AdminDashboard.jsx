import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  LayoutDashboard, Package, ShoppingCart, Tag, LogOut, Menu, X,
  TrendingUp, DollarSign, Clock, CheckCircle, Leaf, Image
} from 'lucide-react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCategories from './AdminCategories';
import AdminBanners from './AdminBanners';

const AdminDashboard = () => {
  const { admin, logout, token, BACKEND_URL } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'banners', label: 'Banners', icon: Image },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

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
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-500 mt-1">Welcome back, {admin?.name}!</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Orders"
                    value={stats.total_orders}
                    icon={ShoppingCart}
                    color="bg-blue-500"
                  />
                  <StatCard
                    title="Total Revenue"
                    value={`₹${stats.total_revenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                  />
                  <StatCard
                    title="Pending Orders"
                    value={stats.pending_orders}
                    icon={Clock}
                    color="bg-orange-500"
                  />
                  <StatCard
                    title="Delivered"
                    value={stats.delivered_orders}
                    icon={CheckCircle}
                    color="bg-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard
                    title="Total Products"
                    value={stats.total_products}
                    icon={Package}
                    color="bg-purple-500"
                    subtext="Active products in store"
                  />
                  <StatCard
                    title="Total Categories"
                    value={stats.total_categories}
                    icon={Tag}
                    color="bg-pink-500"
                    subtext="Product categories"
                  />
                </div>
              </>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
                >
                  <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Add Product</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
                >
                  <ShoppingCart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <Tag className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Manage Categories</span>
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('This will seed the database with default products and categories. Continue?')) {
                      try {
                        const response = await fetch(`${BACKEND_URL}/api/admin/seed-data`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                          alert('Database seeded successfully!');
                          fetchDashboardStats();
                        } else {
                          alert('Failed to seed database');
                        }
                      } catch (error) {
                        alert('Error seeding database');
                      }
                    }
                  }}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Seed Data</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="font-semibold text-green-600">
                  {admin?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{admin?.name}</p>
                <p className="text-xs text-gray-500">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="font-bold text-gray-900">Admin Panel</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
