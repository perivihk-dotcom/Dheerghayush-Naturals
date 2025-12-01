import React, { useState, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import useBackgroundRefresh from '../../hooks/useBackgroundRefresh';
import { Plus, Edit, Trash2, X, Save, Tag, Grid, FolderOpen } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const AdminCategories = () => {
  const { token, BACKEND_URL } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: ''
  });

  // Fetch function for background refresh
  const fetchCategoriesData = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/admin/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch categories');
  }, [BACKEND_URL, token]);

  // Use background refresh - refreshes every 30 seconds silently
  const { data: categoriesData, loading, refresh: refreshCategories } = useBackgroundRefresh(fetchCategoriesData, {
    interval: 30000,
    enabled: true,
  });

  const categories = categoriesData || [];

  // Legacy fetchCategories for manual refresh after mutations
  const fetchCategories = () => refreshCategories();

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `${BACKEND_URL}/api/admin/categories/${editingCategory.id}`
        : `${BACKEND_URL}/api/admin/categories`;
      const method = editingCategory ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchCategories();
        closeModal();
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.detail || 'Failed to save category', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCategories();
      else toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug, image: category.image });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', image: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const activeCategories = categories.filter(c => c.is_active).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Categories</h2>
            <p className="text-pink-100 mt-1 text-sm md:text-base">Organize your products</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-white text-pink-600 px-4 py-2.5 rounded-xl hover:bg-pink-50 transition font-medium shadow-lg shadow-pink-700/20">
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-2">
            <Grid className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-gray-500 text-xs md:text-sm">Total Categories</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-[#2d6d4c]/20 rounded-xl flex items-center justify-center mb-2">
            <FolderOpen className="w-5 h-5 text-[#2d6d4c]" />
          </div>
          <p className="text-gray-500 text-xs md:text-sm">Active</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{activeCategories}</p>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-gray-100">
              <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">No categories found</p>
          <p className="text-gray-500 text-sm mt-1">Create your first category</p>
          <button onClick={() => openModal()} className="mt-4 text-pink-600 font-medium hover:text-pink-700">
            + Add your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all group ${category.is_active ? 'border-gray-100' : 'border-red-200 opacity-70'}`}>
              <div className="aspect-video relative overflow-hidden">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {!category.is_active && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium">Inactive</div>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-white text-lg">{category.name}</h3>
                  <p className="text-white/80 text-sm">/{category.slug}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${category.is_active ? 'bg-[#2d6d4c]' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-500">{category.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <p className="text-sm text-gray-500 mt-1">{editingCategory ? 'Update category details' : 'Create a new category'}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input type="text" value={formData.name} onChange={(e) => { const name = e.target.value; setFormData({ ...formData, name, slug: editingCategory ? formData.slug : generateSlug(name) }); }} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50" placeholder="e.g., Wood Pressed Oils" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-1">/</span>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50" placeholder="wood-pressed-oils" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50" placeholder="https://..." required />
                {formData.image && <img src={formData.image} alt="Preview" className="mt-3 w-full h-32 object-cover rounded-xl" />}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 font-medium shadow-lg shadow-pink-600/20">
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
