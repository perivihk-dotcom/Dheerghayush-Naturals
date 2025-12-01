import React, { useState, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import useBackgroundRefresh from '../../hooks/useBackgroundRefresh';
import { Plus, Edit, Trash2, X, Save, Image, Eye, EyeOff, Layers, Monitor, ChevronRight, Type, AlignLeft, Leaf, Shield, Truck, ArrowRight, Smartphone } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const AdminBanners = () => {
  const { token, BACKEND_URL } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, bannerId: null, bannerTitle: '' });
  const [formData, setFormData] = useState({
    title: '', subtitle: '', description: '', bg_color: '#2d6d4c',
    image: '', button_text: 'Shop Now', button_link: '/products', order: 0
  });

  const fetchBannersData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/banners`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) return await response.json();
    throw new Error('Failed to fetch banners');
  }, [BACKEND_URL, token]);

  const { data: bannersData, loading, refresh: refreshBanners } = useBackgroundRefresh(fetchBannersData, {
    interval: 30000,
    enabled: true,
  });

  const banners = bannersData || [];
  const fetchBanners = () => refreshBanners();
  const activeBanners = banners.filter(b => b.is_active).length;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBanner ? `${BACKEND_URL}/api/admin/banners/${editingBanner.id}` : `${BACKEND_URL}/api/admin/banners`;
      const method = editingBanner ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, order: parseInt(formData.order) })
      });
      if (response.ok) { fetchBanners(); closeModal(); }
      else { const error = await response.json(); toast({ title: 'Error', description: error.detail || 'Failed to save banner', variant: 'destructive' }); }
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleDeleteClick = (banner) => {
    setDeleteConfirm({ show: true, bannerId: banner.id, bannerTitle: banner.title });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/banners/${deleteConfirm.bannerId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
    setDeleteConfirm({ show: false, bannerId: null, bannerTitle: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, bannerId: null, bannerTitle: '' });
  };

  const handleToggleActive = async (banner) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !banner.is_active })
      });
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title, subtitle: banner.subtitle, description: banner.description,
        bg_color: banner.bg_color, image: banner.image, button_text: banner.button_text || 'Shop Now',
        button_link: banner.button_link || '/products', order: banner.order || 0
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '', subtitle: '', description: '', bg_color: '#2d6d4c',
        image: '', button_text: 'Shop Now', button_link: '/products', order: banners.length
      });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingBanner(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E")`
        }} />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Banner Management</h2>
            </div>
            <p className="text-indigo-100">Create stunning hero banners for your homepage</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-50 transition font-semibold shadow-lg">
            <Plus className="w-5 h-5" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Total Banners</p>
          <p className="text-3xl font-bold text-gray-900">{banners.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d6d4c] to-[#245a3e] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-3xl font-bold text-gray-900">{activeBanners}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <EyeOff className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Inactive</p>
          <p className="text-3xl font-bold text-gray-900">{banners.length - activeBanners}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Display Order</p>
          <p className="text-3xl font-bold text-gray-900">Auto</p>
        </div>
      </div>


      {/* Banners Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Banners</h3>
          <span className="text-sm text-gray-500">{banners.length} total</span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-gray-900 font-semibold text-lg">No banners yet</p>
            <p className="text-gray-500 mt-1">Create your first banner to get started</p>
            <button onClick={() => openModal()} className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700">
              <Plus className="w-4 h-4" />
              Create Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className={`group relative rounded-2xl overflow-hidden border-2 transition-all hover:shadow-xl ${
                  banner.is_active ? 'border-[#2d6d4c]/30 hover:border-[#2d6d4c]/40' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Banner Preview - Split Layout Style */}
                <div className="h-48 relative overflow-hidden bg-[#fafaf9]">
                  <div className="h-full flex items-center px-4">
                    {/* Left Content */}
                    <div className="w-[55%] pr-3 z-10">
                      <div className="space-y-1.5">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1 bg-[#2d6d4c]/10 px-2 py-0.5 rounded-full border border-[#2d6d4c]/30">
                          <Leaf size={10} className="text-[#2d6d4c]" />
                          <span className="text-[8px] font-medium text-[#2d6d4c]">100% Natural</span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-sm font-bold leading-tight text-gray-800 line-clamp-1">
                          {banner.title}
                        </h3>
                        
                        {/* Subtitle */}
                        <p className="text-xs font-semibold text-[#2d6d4c] line-clamp-1">
                          {banner.subtitle}
                        </p>
                        
                        {/* Description */}
                        <p className="text-[10px] text-gray-600 line-clamp-2">
                          {banner.description}
                        </p>
                        
                        {/* CTA Button */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="inline-flex items-center gap-0.5 bg-[#2d6d4c] text-white px-2.5 py-1 rounded-full font-semibold text-[10px]">
                            {banner.button_text || 'Shop Now'}
                            <ArrowRight size={10} />
                          </span>
                          <span className="inline-flex items-center gap-0.5 bg-transparent text-gray-600 px-2 py-1 rounded-full font-medium text-[10px] border border-gray-300">
                            Our Story
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Banner Image */}
                    <div className="w-[45%] h-full flex items-center justify-center">
                      <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="w-full h-[85%] object-contain group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  </div>
                  
                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <span className="bg-gray-800/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      #{banner.order + 1}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {banner.is_active ? (
                      <span className="flex items-center gap-1 bg-[#2d6d4c] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-lg">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="bg-gray-500/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions Bar */}
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg shadow-inner border border-gray-200" 
                      style={{ backgroundColor: banner.bg_color }} 
                      title={banner.bg_color}
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm truncate max-w-[150px]">{banner.title}</p>
                      <p className="text-xs text-gray-500">{banner.button_link}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleToggleActive(banner)} 
                      className={`p-2.5 rounded-xl transition ${banner.is_active ? 'text-[#2d6d4c] hover:bg-[#2d6d4c]/10' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={banner.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {banner.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => openModal(banner)} 
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(banner)} 
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  {editingBanner ? <Edit className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h3>
                  <p className="text-sm text-gray-500">{editingBanner ? 'Update banner details and preview' : 'Design a stunning hero banner'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Form Section */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 border-r border-gray-100">
                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Type className="w-4 h-4" />
                      Title *
                    </label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition" 
                      placeholder="e.g., Pure & Natural" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Type className="w-4 h-4" />
                      Subtitle *
                    </label>
                    <input 
                      type="text" 
                      value={formData.subtitle} 
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition" 
                      placeholder="e.g., Wood Pressed Oils" 
                      required 
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <AlignLeft className="w-4 h-4" />
                    Description *
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition resize-none" 
                    rows="2" 
                    placeholder="Brief description of the banner" 
                    required 
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4" />
                    Image URL *
                  </label>
                  <input 
                    type="url" 
                    value={formData.image} 
                    onChange={(e) => setFormData({...formData, image: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition" 
                    placeholder="https://example.com/image.jpg" 
                    required 
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-600/20 transition">
                    <Save className="w-5 h-5" />
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>


              {/* Live Preview Section */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Live Preview
                  </h4>
                  <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1 ${
                        previewMode === 'desktop' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1 ${
                        previewMode === 'mobile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Preview Container */}
                <div className={`mx-auto transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-[280px]' : 'w-full'}`}>
                  
                  {/* ===== MOBILE PREVIEW ===== */}
                  {previewMode === 'mobile' && (
                    <div className="relative overflow-hidden rounded-xl shadow-2xl h-[420px] bg-gray-100">
                      {/* Background Image - Full size */}
                      {formData.image && (
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="absolute inset-0 w-full h-[90%] object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                      
                      {/* Content at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-full">
                            <Leaf size={10} className="text-[#2d6d4c]" />
                            <span className="text-[10px] font-medium text-[#2d6d4c]">100% Natural & Organic</span>
                          </div>
                          <h3 className="text-lg font-bold leading-tight text-white">
                            {formData.title || 'Banner Title'}
                          </h3>
                          <h4 className="text-sm font-semibold text-white/90">
                            {formData.subtitle || 'Banner Subtitle'}
                          </h4>
                          <p className="text-xs text-white/80 line-clamp-2">
                            {formData.description || 'Banner description will appear here...'}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 bg-[#2d6d4c] text-white px-3 py-1.5 rounded-full font-semibold text-xs">
                              {formData.button_text || 'Shop Now'} <ChevronRight size={12} />
                            </span>
                            <span className="inline-flex items-center gap-1 bg-white/90 text-gray-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                              Learn More
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile dots indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        <span className="w-5 h-1.5 rounded-full bg-white" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      </div>
                    </div>
                  )}

                  {/* ===== DESKTOP PREVIEW - Split Layout ===== */}
                  {previewMode === 'desktop' && (
                    <div className="relative overflow-hidden rounded-xl shadow-2xl h-[320px] bg-[#fafaf9]">
                      <div className="h-full flex items-center px-5">
                        {/* Left Content */}
                        <div className="w-[55%] pr-4 z-10">
                          <div className="space-y-2.5">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-1.5 bg-[#2d6d4c]/10 px-2.5 py-1 rounded-full border border-[#2d6d4c]/30">
                              <Leaf size={12} className="text-[#2d6d4c]" />
                              <span className="text-[10px] font-medium tracking-wide text-[#2d6d4c]">100% Natural & Organic</span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl font-bold leading-tight tracking-tight text-gray-800">
                              {formData.title || 'Banner Title'}
                            </h3>
                            
                            {/* Subtitle */}
                            <h4 className="text-base font-semibold text-[#2d6d4c]">
                              {formData.subtitle || 'Banner Subtitle'}
                            </h4>
                            
                            {/* Description */}
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                              {formData.description || 'Banner description will appear here...'}
                            </p>
                            
                            {/* CTA Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="inline-flex items-center gap-1 bg-[#2d6d4c] text-white px-4 py-2 rounded-full font-bold text-xs">
                                {formData.button_text || 'Shop Now'}
                                <ArrowRight size={12} />
                              </span>
                              <span className="inline-flex items-center gap-1 bg-transparent text-gray-700 px-4 py-2 rounded-full font-semibold text-xs border border-gray-300">
                                Our Story
                              </span>
                            </div>
                            
                            {/* Trust Badges */}
                            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 mt-2">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <div className="w-6 h-6 rounded-full bg-[#2d6d4c]/10 flex items-center justify-center">
                                  <Leaf size={10} className="text-[#2d6d4c]" />
                                </div>
                                <span className="text-[9px] font-medium">Natural</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                  <Shield size={10} className="text-blue-500" />
                                </div>
                                <span className="text-[9px] font-medium">Quality</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                                  <Truck size={10} className="text-amber-500" />
                                </div>
                                <span className="text-[9px] font-medium">Fast Delivery</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right side - Banner Image */}
                        <div className="w-[45%] h-full flex items-center justify-center">
                          {formData.image ? (
                            <img 
                              src={formData.image}
                              alt="Preview"
                              className="w-full h-[85%] object-contain"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div className="w-full h-[85%] bg-gray-200 rounded-lg flex items-center justify-center">
                              <Image className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Desktop dots indicator */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <span className="w-8 h-2 rounded-full bg-[#2d6d4c]" />
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                      </div>
                    </div>
                  )}
                  
                  {/* Preview Info */}
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#2d6d4c]" />
                      {previewMode === 'desktop' ? '1920 × 600' : '375 × 600'}
                    </span>
                    <span>|</span>
                    <span>{previewMode === 'desktop' ? 'Desktop View' : 'Mobile View'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Banner</h3>
              <p className="text-gray-500 text-center">
                Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirm.bannerTitle}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-6 py-4 bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
