import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Image as ImageIcon,
  ChevronDown, ChevronUp, Loader2, CheckCircle2,
  Plus, X, Edit2, Tag, Package, ShoppingCart, Users, MapPin,
  Save, AlertCircle, LayoutDashboard
} from 'lucide-react';
import axios from 'axios';
import { DashboardTab } from './admin/DashboardTab';
import { UsersTab } from './admin/UsersTab';
import { OrdersTab } from './admin/OrdersTab';
import { TodayOrdersTab } from './admin/TodayOrdersTab';
import { SettingsTab } from './admin/SettingsTab';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const API = 'http://localhost:8000';

// ─── Image Upload Zone ──────────────────────────────────────────────────────
const ImageUploadZone = ({ productId, token, onUploaded }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
    setPreview(URL.createObjectURL(file));
    setUploading(true); setError(null); setSuccess(false);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${API}/api/products/${productId}/image`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(res.data.image_url);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setPreview(null); }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
      setPreview(null);
    } finally { setUploading(false); }
  };

  return (
    <div className="mt-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
          dragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-300 hover:border-primary hover:bg-slate-50'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {uploading ? <Loader2 className="animate-spin text-primary" size={28} />
          : success ? <CheckCircle2 className="text-green-500" size={28} />
          : preview ? <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-lg" />
          : <Upload className="text-slate-400" size={28} />}
        <p className="text-sm text-slate-500 font-medium">
          {uploading ? 'Uploading image…' : success ? 'Uploaded successfully!' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-slate-400">PNG, JPG, WEBP formats supported</p>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ─── Product Image Manager ──────────────────────────────────────────────────
const ProductImageManager = ({ product, token, onImageDeleted, onImageUploaded }) => {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (url) => {
    setDeleting(url);
    try {
      await axios.delete(`${API}/api/products/${product._id}/image`, {
        params: { image_url: url },
        headers: { Authorization: `Bearer ${token}` },
      });
      onImageDeleted(product._id, url);
    } catch (err) { console.error('Delete failed:', err.response?.data?.detail); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Product Images
      </p>
      {product.image_urls?.length > 0 ? (
        <div className="flex flex-wrap gap-3 mb-3">
          {product.image_urls.map((url) => (
            <div key={url} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={url} alt="product" className="w-full h-full object-cover" />
              <button
                onClick={() => handleDelete(url)}
                disabled={deleting === url}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                {deleting === url ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
          <ImageIcon size={16} /><span>No images uploaded yet</span>
        </div>
      )}
      <ImageUploadZone
        productId={product._id}
        token={token}
        onUploaded={(url) => onImageUploaded(product._id, url)}
      />
    </div>
  );
};

// ─── Product Form Modal ───────────────────────────────────────────────────
const ProductFormModal = ({ token, categories, initialData, onSaved, onClose }) => {
  const [form, setForm] = useState(initialData ? {
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price || '',
    original_price: initialData.original_price || '',
    rating: initialData.rating || '0',
    warranty: initialData.warranty || '',
    returns_policy: initialData.returns_policy || '',
    stock_quantity: initialData.stock_quantity || '',
    category_id: initialData.category_id || '',
    is_published: initialData.is_published ?? true,
  } : {
    title: '', description: '', price: '', original_price: '',
    rating: '0', warranty: 'No Warranty', returns_policy: '7 days',
    stock_quantity: '', category_id: '', is_published: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: parseFloat(form.original_price || form.price),
        rating: parseFloat(form.rating || 0),
        stock_quantity: parseInt(form.stock_quantity, 10),
      };
      let res;
      if (initialData) {
        res = await axios.put(`${API}/api/products/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(`${API}/api/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSaved(res.data, !!initialData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  const fields = [
    { name: 'title', label: 'Product Title', type: 'text', placeholder: 'e.g. Amul Butter 500g', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description…' },
    { name: 'price', label: 'Selling Price (₹)', type: 'number', placeholder: '0.00', required: true, min: 0 },
    { name: 'original_price', label: 'MRP (₹)', type: 'number', placeholder: '0.00', required: true, min: 0 },
    { name: 'stock_quantity', label: 'Stock Quantity', type: 'number', placeholder: '0', required: true, min: 0 },
    { name: 'rating', label: 'Initial Rating', type: 'number', placeholder: '0.0', required: false, min: 0 },
    { name: 'warranty', label: 'Warranty', type: 'text', placeholder: 'e.g. 1 Year, No Warranty', required: false },
    { name: 'returns_policy', label: 'Returns Policy', type: 'text', placeholder: 'e.g. 7 days', required: false },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {initialData ? <Edit2 size={18} className="text-primary" /> : <Plus size={18} className="text-primary" />} 
            {initialData ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                  min={f.min}
                  step={f.type === 'number' ? 'any' : undefined}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              )}
            </div>
          ))}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Published toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_published: !form.is_published })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_published ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-slate-700">Published (visible to customers)</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : (initialData ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Categories Tab ─────────────────────────────────────────────────────────
const CategoriesTab = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/categories/`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch { } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true); setError('');
    try {
      const slug = newSlug.trim() || newName.toLowerCase().replace(/\s+/g, '-');
      const res = await axios.post(`${API}/api/categories/`,
        { name: newName.trim(), slug, is_active: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories((prev) => [...prev, res.data]);
      setNewName(''); setNewSlug('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create category.');
    } finally { setCreating(false); }
  };

  const handleDelete = (id) => {
    setCategoryToDelete(id);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleting(categoryToDelete);
    try {
      await axios.delete(`${API}/api/categories/${categoryToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories((prev) => prev.filter((c) => c._id !== categoryToDelete));
    } catch { } finally { setDeleting(null); setCategoryToDelete(null); }
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Add New Category
        </h3>
        <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="flex-1 min-w-[160px] border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            required
          />
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="slug (auto-generated)"
            className="flex-1 min-w-[160px] border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:bg-slate-300"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Tag size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No categories yet. Add one above.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={deleting === cat._id}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    >
                      {deleting === cat._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};

// ─── Main Admin Component ───────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'users', label: 'Users & Partners', icon: Users },
  { id: 'settings', label: 'Express Delivery', icon: MapPin },
];

const Admin = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== 'admin') navigate('/');
  }, [token, user, navigate]);

  useEffect(() => {
    if (activeTab !== 'categories') fetchData();
    // Pre-fetch categories for the create product modal
    axios.get(`${API}/api/categories/`).then(r => setCategories(r.data)).catch(() => {});
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab !== 'products') return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch { } finally { setLoading(false); }
  };

  const handleImageUploaded = (productId, url) =>
    setData((prev) => prev.map((p) => (p._id || p.id) === productId ? { ...p, image_urls: [...(p.image_urls || []), url] } : p));

  const handleImageDeleted = (productId, url) =>
    setData((prev) => prev.map((p) => (p._id || p.id) === productId ? { ...p, image_urls: (p.image_urls || []).filter((u) => u !== url) } : p));

  const handleProductSaved = (savedProduct, isEdit) => {
    if (isEdit) {
      setData((prev) => prev.map((p) => (p._id || p.id) === (savedProduct._id || savedProduct.id) ? savedProduct : p));
    } else {
      setData((prev) => [savedProduct, ...prev]);
    }
  };

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${API}/api/products/${productToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      setData((prev) => prev.filter((p) => p._id !== productToDelete));
    } catch {}
    finally { setProductToDelete(null); }
  };

  return (
    <div className="flex h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent" />
          <span className="text-lg font-bold text-gray-900">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors flex items-center gap-2.5 ${
                activeTab === id ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <p className="text-xs font-semibold text-primary capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6 gap-3 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab.replace('_', ' ')} Management</h1>
          <div className="ml-auto flex gap-2">
            {activeTab === 'products' && (
              <button
                onClick={() => { setProductToEdit(null); setShowProductModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                <Plus size={16} /> New Product
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardTab token={token} onNavigate={setActiveTab} />}
              {activeTab === 'categories' && <CategoriesTab token={token} />}
              {activeTab === 'orders' && <OrdersTab token={token} />}
              {activeTab === 'today_orders' && <TodayOrdersTab token={token} />}
              {activeTab === 'users' && <UsersTab token={token} />}
              {activeTab === 'settings' && <SettingsTab token={token} />}

              {/* Products Tab */}
              {activeTab === 'products' && (
                loading ? (
                  <div className="flex justify-center mt-10">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-100">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, idx) => (
                          <React.Fragment key={item._id || idx}>
                            <tr
                              className="cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => setExpandedProduct(expandedProduct === item._id ? null : item._id)}
                            >
                              <td className="px-6 py-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  {item.image_urls?.[0] ? (
                                    <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                                  ) : <ImageIcon size={16} className="text-slate-400" />}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.stock_quantity > 0 ? (
                                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">{item.stock_quantity} in stock</span>
                                ) : (
                                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Out of Stock</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {item.image_urls?.length || 0} photo{item.image_urls?.length !== 1 ? 's' : ''}
                                  </span>
                                  {expandedProduct === item._id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setProductToEdit(item); setShowProductModal(true); }}
                                    className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
                                    title="Edit product"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(item._id); }}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                                    title="Delete product"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expandable Image Manager */}
                            {expandedProduct === item._id && (
                              <tr>
                                <td colSpan={6} className="p-0">
                                  <AnimatePresence>
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      style={{ overflow: 'hidden' }}
                                    >
                                      <ProductImageManager
                                        product={item}
                                        token={token}
                                        onImageUploaded={handleImageUploaded}
                                        onImageDeleted={handleImageDeleted}
                                      />
                                    </motion.div>
                                  </AnimatePresence>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    {data.length === 0 && (
                      <div className="p-10 text-center text-gray-400">
                        <Package size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No products found.</p>
                        <button onClick={() => { setProductToEdit(null); setShowProductModal(true); }} className="mt-3 text-primary text-sm font-semibold hover:underline">
                          + Create your first product
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductModal && (
          <ProductFormModal
            token={token}
            categories={categories}
            initialData={productToEdit}
            onSaved={handleProductSaved}
            onClose={() => { setShowProductModal(false); setProductToEdit(null); }}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? All images and data will be permanently removed."
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};

export default Admin;
