import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Clock, PackageOpen, Leaf, BadgeCheck } from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductGridSkeleton } from '../components/ui/ProductCardSkeleton';
import { API_URL, fadeUp, stagger } from '../lib/storefront';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await axios.get(`${API_URL}/products?limit=100`);
        // Newest first — assume API returns oldest→newest, so reverse.
        const data = Array.isArray(res.data) ? [...res.data].reverse() : [];
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const c = p.category?.name || (typeof p.category === 'string' ? p.category : null);
      if (c) set.add(c);
    });
    return ['All', ...Array.from(set).slice(0, 8)];
  }, [products]);

  const visible = useMemo(() => {
    if (activeCat === 'All') return products;
    return products.filter((p) => (p.category?.name || p.category) === activeCat);
  }, [products, activeCat]);

  const featured = visible.slice(0, 3);
  const rest = visible.slice(3);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1b14] via-[#0c4128] to-[#0f5132] text-white">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_15%_25%,#2dd4bf_0,transparent_40%),radial-gradient(circle_at_85%_80%,#f59e0b_0,transparent_45%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex-1">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
            >
              <Sparkles size={14} /> Fresh Stock · Updated Daily
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-[0.95]">
              NEW <span className="text-emerald-400">ARRIVALS</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg md:text-xl max-w-xl font-medium mb-8">
              Be the first to shop the latest additions to the OneBasket shelves — just in, freshly stocked and ready to deliver.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {[
                { icon: Clock, label: 'Restocked every morning' },
                { icon: Leaf, label: 'Farm-fresh & new-in' },
                { icon: BadgeCheck, label: 'Quality checked' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 text-sm font-semibold">
                  <s.icon size={16} className="text-emerald-300" />
                  {s.label}
                </div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex w-56 h-56 rounded-full bg-emerald-400/10 border border-emerald-300/20 items-center justify-center shrink-0"
          >
            <PackageOpen size={96} className="text-emerald-300" strokeWidth={1.2} />
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* ─── CATEGORY CHIPS ────────────────────────────────────────────────── */}
        {!loading && categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  activeCat === cat
                    ? 'bg-[#0f5132] text-white border-[#0f5132] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0f5132] hover:text-[#0f5132]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : visible.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Sparkles size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Nothing new here yet — check back soon.</p>
            <button onClick={() => setActiveCat('All')} className="mt-4 text-[#0f5132] font-bold hover:underline">
              View all new arrivals
            </button>
          </div>
        ) : (
          <>
            {/* ─── FEATURED "JUST IN" ROW ──────────────────────────────────────── */}
            {featured.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Sparkles size={22} className="text-emerald-500" /> Just In
                  </h2>
                  <span className="text-sm text-slate-400 font-medium">Freshest picks</span>
                </div>
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                  {featured.map((product) => (
                    <motion.div key={product._id || product.id} variants={fadeUp}>
                      <Link
                        to={`/products/${product._id || product.id}`}
                        state={{ product }}
                        className="group flex items-center gap-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-5 h-full"
                      >
                        <div className="w-24 h-24 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {(product.image_urls || product.imageUrls || [])[0] ? (
                            <img src={(product.image_urls || product.imageUrls)[0]} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <span className="text-4xl">🛒</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mb-2">New</span>
                          <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#0f5132] transition-colors">{product.title}</h3>
                          <p className="mt-1 text-lg font-black text-[#0f5132]">₹{product.price}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* ─── ALL NEW ARRIVALS GRID ───────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-slate-800">All New Arrivals</h2>
              <span className="text-sm text-slate-400 font-medium">{visible.length} items</span>
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {(rest.length ? rest : visible).map((product) => (
                <motion.div key={product._id || product.id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
