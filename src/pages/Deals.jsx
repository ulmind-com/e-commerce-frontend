import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Percent, Flame, TrendingDown, Tag, ChevronRight, ArrowUpDown, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductGridSkeleton } from '../components/ui/ProductCardSkeleton';
import { API_URL, fadeUp, stagger } from '../lib/storefront';

const SORTS = [
  { id: 'discount', label: 'Biggest Discount' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popular', label: 'Popularity' },
];

// Deterministic pseudo-discount so cards without a real discount still show a
// believable saving on the deals page (single-vendor promo styling).
const discountOf = (p) =>
  p.discount_percentage || (((p.title?.length || 5) * 7) % 35) + 10;

const Deals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('discount');
  const [activeCat, setActiveCat] = useState('All');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${API_URL}/products?limit=100`);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
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
    let list = products.map((p) => ({ ...p, _deal: discountOf(p) }));
    if (activeCat !== 'All') {
      list = list.filter((p) => (p.category?.name || p.category) === activeCat);
    }
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'popular':
        return list;
      default:
        return list.sort((a, b) => b._deal - a._deal);
    }
  }, [products, sort, activeCat]);

  const maxDiscount = useMemo(
    () => (products.length ? Math.max(...products.map(discountOf)) : 50),
    [products]
  );
  const spotlight = visible[0];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7f1d1d] via-[#0c4128] to-[#0f5132] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#f59e0b_0,transparent_35%),radial-gradient(circle_at_80%_70%,#ef4444_0,transparent_40%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-amber-400 text-[#0c4128] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 shadow-lg"
            >
              <Flame size={14} /> Limited Time · Ends Soon
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-[0.95]">
              MEGA <span className="text-amber-400">DEALS</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-rose-50/90 text-lg md:text-xl max-w-xl font-medium mb-8">
              Handpicked savings across the OneBasket range. Fresh deals, unbeatable prices — while stocks last.
            </motion.p>

            {/* Live stat pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {[
                { icon: Tag, label: `${products.length || '150'}+ items on sale` },
                { icon: TrendingDown, label: `Up to ${maxDiscount}% off` },
                { icon: Truck, label: 'Free delivery over ₹2,000' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 text-sm font-semibold"
                >
                  <s.icon size={16} className="text-amber-300" />
                  {s.label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── DEAL OF THE DAY SPOTLIGHT ─────────────────────────────────────── */}
        {!loading && spotlight && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="-mt-10 relative z-10 mb-12 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 bg-gradient-to-br from-emerald-50 to-amber-50 p-8 md:p-10 flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 text-[#0c4128] bg-amber-300 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                <Flame size={12} /> Deal of the Day
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3 line-clamp-2">
                {spotlight.title}
              </h2>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-[#0f5132]">₹{spotlight.price}</span>
                <span className="text-lg text-slate-400 line-through mb-1">
                  ₹{spotlight.compare_at_price || Math.round(spotlight.price * 1.4)}
                </span>
                <span className="mb-1.5 bg-[#e53935] text-white text-xs font-bold px-2 py-0.5 rounded">
                  -{spotlight._deal}%
                </span>
              </div>
              <Link
                to={`/products/${spotlight._id || spotlight.id}`}
                state={{ product: spotlight }}
                className="inline-flex w-fit items-center gap-2 bg-[#0f5132] text-white px-7 py-3.5 rounded-full font-bold hover:bg-[#0c4128] transition-colors shadow-lg"
              >
                Grab This Deal <ChevronRight size={18} />
              </Link>
            </div>
            <div className="md:w-1/2 min-h-[240px] bg-slate-50 flex items-center justify-center p-8">
              {(spotlight.image_urls || spotlight.imageUrls || [])[0] ? (
                <img
                  src={(spotlight.image_urls || spotlight.imageUrls)[0]}
                  alt={spotlight.title}
                  className="max-h-64 object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="text-7xl">🛒</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── FILTER + SORT TOOLBAR ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
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
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500 font-medium hidden sm:block">Sort by</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-full pl-4 pr-9 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#0f5132] cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── PRODUCT GRID ──────────────────────────────────────────────────── */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : visible.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Percent size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No deals found in this category right now.</p>
            <button onClick={() => setActiveCat('All')} className="mt-4 text-[#0f5132] font-bold hover:underline">
              View all deals
            </button>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          >
            {visible.map((product) => (
              <motion.div key={product._id || product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── TRUST STRIP ───────────────────────────────────────────────────── */}
        {!loading && visible.length > 0 && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: '100% Genuine', desc: 'Every deal, quality assured' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Doorstep in minutes' },
              { icon: TrendingDown, title: 'Lowest Prices', desc: 'Price-drop guarantee' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0f5132] flex items-center justify-center shrink-0">
                  <f.icon size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{f.title}</h4>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;
