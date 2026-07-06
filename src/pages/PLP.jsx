import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, ChevronDown, X,
  LayoutGrid, List, Mic, MicOff, Package2,
} from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com';

const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

const PLP = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const categorySlug = searchParams.get('category') || '';
  const categoryName = searchParams.get('name') || '';
  const queryParam   = searchParams.get('q') || '';

  const [allProducts, setAllProducts]   = useState([]);
  const [categories,  setCategories]    = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [searchText,  setSearchText]    = useState(queryParam);
  const [sortBy,      setSortBy]        = useState('');
  const [priceMax,    setPriceMax]      = useState('');
  const [isListening, setIsListening]   = useState(false);
  const [voiceOK,     setVoiceOK]       = useState(false);
  const [viewGrid,    setViewGrid]      = useState(true);
  const [showFilters, setShowFilters]   = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setVoiceOK(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch(`${API}/api/categories/`)
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(() => {});
  }, []);

  // Fetch products (by category if slug provided)
  useEffect(() => {
    setLoading(true);
    // Find category _id from slug
    const cat = categories.find(c => c.slug === categorySlug);
    const baseUrl = cat
      ? `${API}/api/products?category_id=${cat._id}`
      : `${API}/api/products`;
    
    // Append timestamp to bust browser cache
    const url = baseUrl.includes('?') ? `${baseUrl}&t=${Date.now()}` : `${baseUrl}?t=${Date.now()}`;

    fetch(url)
      .then(r => r.json())
      .then(data => setAllProducts(data.map(p => ({
        ...p, id: p._id, imageUrls: p.image_urls || [],
      }))))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [categorySlug, categories]);

  // Sync search text when URL param changes
  useEffect(() => { setSearchText(queryParam); }, [queryParam]);

  // Filter + sort client-side
  const filtered = allProducts
    .filter(p => {
      const q = searchText.toLowerCase();
      return !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    })
    .filter(p => !priceMax || p.price <= Number(priceMax))
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc')   return a.title.localeCompare(b.title);
      return 0;
    });

  // Voice search
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = 'en-IN';
    r.onstart = () => setIsListening(true);
    r.onend   = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setSearchText(transcript);
    };
    recognitionRef.current = r;
    r.start();
  }, [isListening]);

  const clearCategory = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('category'); p.delete('name');
    setSearchParams(p);
  };

  const pageTitle = categoryName || (queryParam ? `"${queryParam}"` : 'All Products');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-slate-600 font-medium">{pageTitle}</span>
          </div>

          {/* Title + count */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">{pageTitle}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-md">
              <div className={`flex items-center bg-slate-50 border-2 rounded-xl overflow-hidden transition-colors ${isListening ? 'border-red-400' : 'border-slate-200 focus-within:border-primary'}`}>
                <Search size={18} className="ml-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder={isListening ? '🎤 Listening…' : 'Search products…'}
                  className="flex-1 py-2.5 px-2 bg-transparent text-sm text-slate-700 outline-none"
                />
                {searchText && (
                  <button onClick={() => setSearchText('')} className="px-2 text-slate-300">
                    <X size={15} />
                  </button>
                )}
                {voiceOK && (
                  <button
                    onClick={startVoice}
                    className={`mr-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Active category chip */}
          {categorySlug && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-semibold">
              {categoryName || categorySlug}
              <button onClick={clearCategory} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:border-primary cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Price filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-400 font-medium">Max ₹</span>
            <input
              type="number"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="Any"
              className="w-20 text-sm outline-none bg-transparent text-slate-700"
            />
          </div>

          {/* Category quick pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            <button
              onClick={clearCategory}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                !categorySlug ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setSearchParams({ category: cat.slug, name: cat.name })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  categorySlug === cat.slug ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button onClick={() => setViewGrid(true)} className={`p-1.5 rounded-lg transition-colors ${viewGrid ? 'bg-primary text-white' : 'text-slate-400'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewGrid(false)} className={`p-1.5 rounded-lg transition-colors ${!viewGrid ? 'bg-primary text-white' : 'text-slate-400'}`}>
              <List size={16} />
            </button>
          </div>
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-3.5 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package2 size={56} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Products Found</h3>
            <p className="text-slate-400 max-w-sm">
              {categoryName ? `No products in "${categoryName}" yet.` : 'Try a different search or filter.'}
            </p>
            <button
              onClick={() => { setSearchText(''); clearCategory(); }}
              className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={viewGrid
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'flex flex-col gap-4'}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <motion.div
                  key={product._id || product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PLP;
