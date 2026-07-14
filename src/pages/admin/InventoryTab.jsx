import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Save, AlertTriangle, ArrowUpDown, RefreshCcw, Image as ImageIcon } from 'lucide-react';
const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const InventoryTab = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirtyItems, setDirtyItems] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data);
      setDirtyItems({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (productId, field, value) => {
    const parsedValue = field === 'stock_quantity' ? parseInt(value) || 0 : parseFloat(value) || 0;
    
    // Update local state for immediate feedback
    setProducts(prev => prev.map(p => 
      p._id === productId ? { ...p, [field]: parsedValue } : p
    ));

    // Track dirty state
    setDirtyItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parsedValue
      }
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(dirtyItems).length === 0) return;
    
    setSaving(true);
    try {
      const updatePromises = Object.keys(dirtyItems).map(productId => {
        // We only send the fields that changed + required fields.
        // But for simplicity in this REST API, we might need to send the full object or use a PATCH.
        // Assuming the backend PUT requires full object, we find the current product:
        const product = products.find(p => p._id === productId);
        if (!product) return Promise.resolve();
        
        return axios.put(`${API}/products/${productId}`, product, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });

      await Promise.all(updatePromises);
      setDirtyItems({});
    } catch (error) {
      console.error('Failed to save inventory:', error);
      alert('Failed to save some changes. Please try again.');
    } finally {
      setSaving(false);
      fetchProducts(); // Refresh to ensure sync
    }
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const totalLowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length;
  const totalOutOfStock = products.filter(p => p.stock_quantity === 0).length;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Management</h2>
          <p className="text-sm text-slate-500 mt-1">Quickly update stock levels and pricing across all products</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
            />
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={saving || Object.keys(dirtyItems).length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              Object.keys(dirtyItems).length > 0 
                ? 'bg-primary hover:bg-primary-600 text-white shadow-primary/20 hover:shadow-md hover:shadow-primary/30' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : `Save Changes ${Object.keys(dirtyItems).length > 0 ? `(${Object.keys(dirtyItems).length})` : ''}`}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{products.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Search size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock (≤10)</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{totalLowStock}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalOutOfStock}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Price (₹)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Stock Qty</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isDirty = !!dirtyItems[product._id];
                  return (
                    <tr key={product._id} className={`hover:bg-slate-50 transition-colors ${isDirty ? 'bg-primary/5 hover:bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                          {product.image_urls?.[0] ? (
                            <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : <ImageIcon size={20} className="text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 line-clamp-1">{product.title}</span>
                          <span className="text-xs text-slate-500 mt-0.5 font-mono">ID: {product._id.substring(product._id.length - 6)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock_quantity === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
                          </span>
                        ) : product.stock_quantity <= 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                          <input
                            type="number"
                            value={product.price === 0 ? '' : product.price}
                            onChange={(e) => handleInputChange(product._id, 'price', e.target.value)}
                            className={`w-full pl-7 pr-3 py-2 text-sm font-medium text-slate-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                              dirtyItems[product._id]?.price !== undefined ? 'border-primary shadow-sm bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={product.stock_quantity === 0 && !dirtyItems[product._id] ? '0' : product.stock_quantity}
                          onChange={(e) => handleInputChange(product._id, 'stock_quantity', e.target.value)}
                          className={`w-full px-3 py-2 text-sm font-bold text-slate-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                            dirtyItems[product._id]?.stock_quantity !== undefined ? 'border-primary shadow-sm bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                          min="0"
                          step="1"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
