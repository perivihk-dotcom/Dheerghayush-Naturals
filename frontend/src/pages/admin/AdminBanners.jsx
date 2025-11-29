import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit, Trash2, X, Save, Image, Eye, EyeOff, GripVertical } from 'lucide-react';

const AdminBanners = () => {
  const { token, BACKEND_URL } = useAdmin();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    bg_color: '#4CAF50',
    image: '',
    button_text: 'Shop Now',
    button_link: '/products',
    order: 0
  });

  const colorOptions = [
    { value: '#4CAF50', label: 'Green' },
    { value: '#FF9800', label: 'Orange' },
    { value: '#8BC34A', label: 'Light Green' },
    { value: '#2196F3', label: 'Blue' },
    { value: '#9C27B0', label: 'Purple' },
    { value: '#E91E63', label: 'Pink' },
    { value: '#795548', label: 'Brown' },
    { value: '#607D8B', label: 'Blue Grey' },
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBanner
        ? `${BACKEND_URL}/api/admin/banners/${editingBanner.id}`
        : `${BACKEND_URL}/api/admin/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order)
        })
      });

      if (response.ok) {
        fetchBanners();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchBanners();
      } else {
        alert('Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !banner.is_active })
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        bg_color: banner.bg_color,
        image: banner.image,
        button_text: banner.button_text || 'Shop Now',
        button_link: banner.button_link || '/products',
        order: banner.order || 0
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        bg_color: '#4CAF50',
        image: '',
        button_text: 'Shop Now',
        button_link: '/products',
        order: banners.length
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banner Management</h2>
          <p className="text-gray-500">Manage hero section banners/slides</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No banners found</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Create your first banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner, index) => (
              <div key={banner.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {/* Order indicator */}
                  <div className="flex items-center gap-2 text-gray-400">
                    <GripVertical className="w-5 h-5" />
                    <span className="font-mono text-sm">#{banner.order + 1}</span>
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 relative"
                    style={{ backgroundColor: banner.bg_color }}
                  >
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="absolute right-0 top-0 h-full w-auto object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center p-2">
                      <div className="text-white">
                        <p className="text-[8px] font-bold truncate">{banner.title}</p>
                        <p className="text-[6px] truncate">{banner.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{banner.subtitle}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{banner.description}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: banner.bg_color }}
                      title={`Color: ${banner.bg_color}`}
                    />
                    {banner.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`p-2 rounded-lg transition ${
                        banner.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={banner.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openModal(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Banners are displayed in the hero section of the homepage. 
          They rotate automatically. Use the order field to control the sequence.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Preview */}
              {formData.image && (
                <div 
                  className="w-full h-40 rounded-lg overflow-hidden relative"
                  style={{ backgroundColor: formData.bg_color }}
                >
                  <img 
                    src={formData.image} 
                    alt="Preview"
                    className="absolute right-0 top-0 h-full w-auto object-cover opacity-80"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Pure & Natural"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle *</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Wood Pressed Oils"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                  placeholder="Brief description for the banner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.bg_color}
                      onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <select
                      value={formData.bg_color}
                      onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={formData.button_link}
                  onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="/products"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
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
