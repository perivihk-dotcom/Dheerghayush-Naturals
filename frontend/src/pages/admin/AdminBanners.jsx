import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit, Trash2, X, Save, Image, Eye, EyeOff, GripVertical, Layers, Monitor } from 'lucide-react';

const AdminBanners = () => {
  const { token, BACKEND_URL } = useAdmin();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', description: '', bg_color: '#4CAF50',
    image: '', button_text: 'Shop Now', button_link: '/products', order: 0
  });

  const colorOptions = [
    { value: '#4CAF50', label: 'Green' }, { value: '#FF9800', label: 'Orange' },
    { value: '#8BC34A', label: 'Light Green' }, { value: '#2196F3', label: 'Blue' },
    { value: '#9C27B0', label: 'Purple' }, { value: '#E91E63', label: 'Pink' },
    { value: '#795548', label: 'Brown' }, { value: '#607D8B', label: 'Blue Grey' },
  ];

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setBanners(await response.json());
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

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
      else { const error = await response.json(); alert(error.detail || 'Failed to save banner'); }
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/banners/${bannerId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
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
        title: '', subtitle: '', description: '', bg_color: '#4CAF50',
        image: '', button_text: 'Shop Now', button_link: '/products', order: banners.length
      });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingBanner(null); };

  const activeBanners = banners.filter(b => b.is_active).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Banner Management</h2>
            <p className="text-indigo-100 mt-1 text-sm md:text-base">Manage hero section banners</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition font-medium shadow-lg shadow-indigo-700/20">
            <Plus className="w-5 h-5" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-gray-500 text-xs md:text-sm">Total Banners</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{banners.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
            <Monitor className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-gray-500 text-xs md:text-sm">Active</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{activeBanners}</p>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No banners found</p>
            <p className="text-gray-500 text-sm mt-1">Create your first banner</p>
            <button onClick={() => openModal()} className="mt-4 text-indigo-600 font-medium hover:text-indigo-700">
              + Create your first banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <GripVertical className="w-5 h-5" />
                    <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded-lg">#{banner.order + 1}</span>
                  </div>
                  
                  <div className="w-36 h-20 rounded-xl overflow-hidden flex-shrink-0 relative shadow-md" style={{ backgroundColor: banner.bg_color }}>
                    <img src={banner.image} alt={banner.title} className="absolute right-0 top-0 h-full w-auto object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center p-3">
                      <div className="text-white">
                        <p className="text-[10px] font-bold truncate">{banner.title}</p>
                        <p className="text-[8px] truncate opacity-90">{banner.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{banner.subtitle}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{banner.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg shadow-inner border border-gray-200" style={{ backgroundColor: banner.bg_color }} title={banner.bg_color} />
                    {banner.is_active ? (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
                    ) : (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Inactive</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggleActive(banner)} className={`p-2 rounded-xl transition ${banner.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={banner.is_active ? 'Deactivate' : 'Activate'}>
                      {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openModal(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Monitor className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-900">How banners work</p>
          <p className="text-sm text-indigo-700 mt-1">Banners are displayed in the hero section of the homepage and rotate automatically. Use the order field to control the sequence.</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
                <p className="text-sm text-gray-500 mt-1">{editingBanner ? 'Update banner details' : 'Create a new hero banner'}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Preview */}
              {formData.image && (
                <div className="w-full h-40 rounded-xl overflow-hidden relative shadow-lg" style={{ backgroundColor: formData.bg_color }}>
                  <img src={formData.image} alt="Preview" className="absolute right-0 top-0 h-full w-auto object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center p-6">
                    <div className="text-white">
                      <p className="text-2xl font-bold">{formData.title || 'Title'}</p>
                      <p className="text-xl">{formData.subtitle || 'Subtitle'}</p>
                      <p className="text-sm opacity-90 mt-2 max-w-md">{formData.description || 'Description'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" placeholder="e.g., Pure & Natural" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle *</label>
                  <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" placeholder="e.g., Wood Pressed Oils" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" rows="2" placeholder="Brief description" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" placeholder="https://..." required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={formData.bg_color} onChange={(e) => setFormData({...formData, bg_color: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                    <select value={formData.bg_color} onChange={(e) => setFormData({...formData, bg_color: e.target.value})} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50">
                      {colorOptions.map(color => <option key={color.value} value={color.value}>{color.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <input type="text" value={formData.button_text} onChange={(e) => setFormData({...formData, button_text: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" placeholder="Shop Now" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" min="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                <input type="text" value={formData.button_link} onChange={(e) => setFormData({...formData, button_link: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50" placeholder="/products" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-600/20">
                  <Save className="w-4 h-4" />
                  {editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
