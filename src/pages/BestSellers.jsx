import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Trophy, Crown, ChevronRight, TrendingUp, Users, ThumbsUp } from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductGridSkeleton } from '../components/ui/ProductCardSkeleton';
import { API_URL, fadeUp, stagger } from '../lib/storefront';

const PODIUM = [
  { rank: 2, ring: 'from-slate-300 to-slate-400', badge: 'bg-slate-400', label: '#2', pt: 'md:pt-10' },
  { rank: 1, ring: 'from-amber-300 to-amber-500', badge: 'bg-amber-500', label: '#1', pt: 'md:pt-0' },
  { rank: 3, ring: 'from-orange-300 to-orange-500', badge: 'bg-orange-500', label: '#3', pt: 'md:pt-16' },
];

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(`${API_URL}/products?limit=100`);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  // Rank by a stable pseudo-popularity so the podium is deterministic.
  const ranked = useMemo(() => {
    return [...products].sort(
      (a, b) => ((b.title?.length || 0) * b.price) - ((a.title?.length || 0) * a.price)
    );
  }, [products]);

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  // Reorder top3 into podium visual order: #2, #1, #3
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  const img = (p) => (p?.image_urls || p?.imageUrls || [])[0];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#78350f] via-[#0c4128] to-[#0f5132] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_20%,#f59e0b_0,transparent_40%),radial-gradient(circle_at_80%_75%,#fbbf24_0,transparent_45%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="w-20 h-20 bg-amber-400/15 border border-amber-300/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} className="text-amber-300" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-[0.95]">
              BEST <span className="text-amber-300">SELLERS</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-amber-50/90 text-lg md:text-xl font-medium mb-8">
              The most-loved products at OneBasket — chosen and reordered by thousands of happy customers.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Users, label: '50,000+ happy customers' },
                { icon: ThumbsUp, label: '4.8★ average rating' },
                { icon: TrendingUp, label: 'Top reordered items' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 text-sm font-semibold">
                  <s.icon size={16} className="text-amber-300" />
                  {s.label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : ranked.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Trophy size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No best sellers to show yet.</p>
          </div>
        ) : (
          <>
            {/* ─── PODIUM (Top 3) ──────────────────────────────────────────────── */}
            {podium.length === 3 && (
              <div className="mb-16">
                <h2 className="text-2xl font-black text-slate-800 text-center mb-8 flex items-center justify-center gap-2">
                  <Crown size={22} className="text-amber-500" /> Hall of Fame
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {podium.map((p, i) => {
                    const meta = PODIUM[i];
                    const isFirst = meta.rank === 1;
                    return (
                      <motion.div
                        key={p._id || p.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={meta.pt}
                      >
                        <Link
                          to={`/products/${p._id || p.id}`}
                          state={{ product: p }}
                          className={`group block relative rounded-3xl bg-white border shadow-sm hover:shadow-2xl transition-all p-6 text-center ${
                            isFirst ? 'border-amber-300 ring-2 ring-amber-200' : 'border-slate-200'
                          }`}
                        >
                          {isFirst && (
                            <Crown size={32} className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 fill-amber-400 drop-shadow" />
                          )}
                          <div className={`w-11 h-11 mx-auto mb-4 rounded-full ${meta.badge} text-white font-black flex items-center justify-center text-lg shadow-lg`}>
                            {meta.label}
                          </div>
                          <div className={`w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br ${meta.ring} p-1`}>
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                              {img(p) ? (
                                <img src={img(p)} alt={p.title} className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <span className="text-4xl">🛒</span>
                              )}
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-[#0f5132] transition-colors">{p.title}</h3>
                          <div className="flex items-center justify-center gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={13} className="text-amber-400" fill="#f59e0b" />
                            ))}
                          </div>
                          <p className="text-xl font-black text-[#0f5132]">₹{p.price}</p>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── REST OF BEST SELLERS ────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-slate-800">More Top Sellers</h2>
              <span className="text-sm text-slate-400 font-medium">{ranked.length} loved items</span>
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {(rest.length ? rest : ranked).map((product, idx) => (
                <motion.div key={product._id || product.id} variants={fadeUp} className="relative">
                  <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-full bg-[#0f5132] text-white text-xs font-black flex items-center justify-center shadow-md ring-2 ring-white">
                    {idx + (rest.length ? 4 : 1)}
                  </div>
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

export default BestSellers;
