import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Image as ImageIcon,
  ChevronDown, ChevronUp, Loader2, CheckCircle2,
  Plus, X, Edit2, Package, Save, AlertCircle
} from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

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
      const res = await axios.post(`${API}/products/${productId}/image`, form, {
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

const ProductImageManager = ({ product, token, onImageDeleted, onImageUploaded }) => {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (url) => {
    setDeleting(url);
    try {
      await axios.delete(`${API}/products/${product._id}`, {
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

const ProductFormModal = ({ token, categories, brands, initialData, onSaved, onClose }) => {
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
    brand_id: initialData.brand_id || '',
    is_published: initialData.is_published ?? true,
  } : {
    title: '', description: '', price: '', original_price: '',
    rating: '0', warranty: 'No Warranty', returns_policy: '7 days',
    stock_quantity: '', category_id: '', brand_id: '', is_published: true
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
        res = await axios.put(`${API}/products/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(`${API}/products`, payload, {
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
            <select
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

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

export const ProductsTab = ({ token }) => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchData();
    axios.get(`${API}/categories/`).then(r => setCategories(r.data)).catch(() => {});
    axios.get(`${API}/brands/`).then(r => setBrands(r.data)).catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } });
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

  const handleDeleteProduct = (productId) => setProductToDelete(productId);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${API}/products/${productToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      setData((prev) => prev.filter((p) => p._id !== productToDelete));
    } catch {}
    finally { setProductToDelete(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => { setProductToEdit(null); setShowProductModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-100">
          <div className="w-full overflow-x-auto">
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
</div>
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
      )}

      <AnimatePresence>
        {showProductModal && (
          <ProductFormModal
            token={token}
            categories={categories}
            brands={brands}
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
