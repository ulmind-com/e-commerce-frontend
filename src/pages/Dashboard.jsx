import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, MicOff, MapPin, Grid as GridIcon, ArrowRight, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ui/ProductCard';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// Category config — slug must match backend slug
const CATEGORY_CONFIG = [
  { name: 'Fresh Produce',     slug: 'fresh-produce',   emoji: '🥦', span: 'col-span-2 row-span-2',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    gradient: 'from-green-900/80 via-green-700/40 to-transparent' },
  { name: 'Dairy & Bakery',    slug: 'dairy-bakery',    emoji: '🥛', span: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80',
    gradient: 'from-blue-900/80 via-blue-700/40 to-transparent' },
  { name: 'Snacks',            slug: 'snacks',           emoji: '🍿', span: 'col-span-1 row-span-2',
    image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=600&q=80',
    gradient: 'from-orange-900/80 via-orange-700/40 to-transparent' },
  { name: 'Beverages',         slug: 'beverages',        emoji: '🧃', span: 'col-span-1 row-span-1',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
    gradient: 'from-red-900/80 via-red-700/40 to-transparent' },
  { name: 'Personal Care',     slug: 'personal-care',   emoji: '🧴', span: 'col-span-2 row-span-1',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    gradient: 'from-rose-900/80 via-rose-700/40 to-transparent' },
];

const TRENDING = ['Milk', 'Bread', 'Eggs', 'Pepsi', 'Chips', 'Atta', 'Rice', 'Maggi'];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const recognitionRef = useRef(null);

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) setVoiceSupported(true);
  }, []);

  // Fetch recommended products
  useEffect(() => {
    fetch(`${API}/products?limit=8`)
      .then(r => r.json())
      .then(data => setProducts(data.map(p => ({
        ...p, id: p._id, imageUrls: p.image_urls || [],
      }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Voice search handler
  const startVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSearchQuery(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false);
        if (transcript.trim()) {
          navigate(`/products?q=${encodeURIComponent(transcript.trim())}`);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, navigate]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Category click → PLP filtered
  const handleCategoryClick = (cat) => {
    navigate(`/products?category=${cat.slug}&name=${encodeURIComponent(cat.name)}`);
  };

  const filteredTrending = TRENDING.filter(t =>
    searchQuery ? t.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 pt-10 pb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-primary mb-4"
        >
          🚀 Delivery in under 30 minutes
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-8 max-w-2xl mx-auto leading-tight"
        >
          Your groceries,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            delivered instantly.
          </span>
        </motion.h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
          <motion.div
            animate={{
              boxShadow: isFocused || isListening
                ? '0 0 0 3px rgba(15,118,110,0.15), 0 8px 32px -8px rgba(15,118,110,0.2)'
                : '0 2px 8px -2px rgba(0,0,0,0.08)',
            }}
            className={`flex items-center bg-white border-2 rounded-2xl overflow-hidden transition-colors ${
              isListening ? 'border-red-400' : isFocused ? 'border-primary' : 'border-slate-200'
            }`}
          >
            <button type="submit" className="pl-4 pr-2 text-slate-400 hover:text-primary transition-colors">
              <Search size={22} />
            </button>

            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isListening ? '🎤 Listening…' : 'Search for milk, eggs, Pepsi, chips…'}
              className="flex-1 py-4 px-2 bg-transparent text-slate-800 text-base outline-none placeholder:text-slate-400"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            />

            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="px-2 text-slate-300 hover:text-slate-500">
                <X size={18} />
              </button>
            )}

            {/* Mic button */}
            <button
              type="button"
              onClick={startVoice}
              className={`mr-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : voiceSupported
                  ? 'bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary'
                  : 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400'
              }`}
              title={voiceSupported ? (isListening ? 'Stop listening' : 'Voice search') : 'Voice not supported in this browser'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </motion.div>

          {/* Dropdown suggestions */}
          <AnimatePresence>
            {(isFocused || isListening) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-50 text-left"
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {isListening ? '🎤 Speak now…' : 'Trending'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredTrending.map(term => (
                    <button
                      key={term}
                      onMouseDown={() => {
                        setSearchQuery(term);
                        navigate(`/products?q=${encodeURIComponent(term)}`);
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-primary/10 hover:text-primary border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* ── Categories ───────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <GridIcon size={20} className="text-primary" />
              <h2 className="text-xl font-bold text-slate-800">Shop by Category</h2>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-sm text-primary hover:text-emerald-700 font-semibold transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:h-80">
            {CATEGORY_CONFIG.map((cat, i) => (
              <motion.button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat)}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`${cat.span} relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-left">
                  <span className="text-2xl block mb-0.5">{cat.emoji}</span>
                  <h3 className="text-white font-bold text-base drop-shadow-sm">{cat.name}</h3>
                  <p className="text-white/0 group-hover:text-white/80 text-xs transition-all duration-300 mt-0.5">
                    Shop now →
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Recommended Products ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800">Recommended for you</h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-sm text-primary hover:text-emerald-700 font-semibold transition-colors"
            >
              See all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
