import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Flame, ChevronRight, Bell } from 'lucide-react';
import { AddToCartButton } from '../components/ui/AddToCartButton';
import { ProductGridSkeleton } from '../components/ui/ProductCardSkeleton';
import { API_URL, fadeUp, stagger } from '../lib/storefront';

// Countdown target: end of today. Keeps the timer meaningful on every visit.
const getEndOfDay = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

const useCountdown = (target) => {
  const [left, setLeft] = useState(Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const totalSec = Math.floor(left / 1000);
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
};

const TimeBox = ({ value, label, compact }) => (
  <div className="flex flex-col items-center">
    <span
      className={`font-black text-amber-400 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner tabular-nums ${
        compact ? 'text-lg w-11 h-11' : 'text-3xl w-16 h-16'
      }`}
    >
      {String(value).padStart(2, '0')}
    </span>
    <span className={`uppercase font-bold text-slate-400 mt-1.5 ${compact ? 'text-[9px]' : 'text-[10px] mt-2'}`}>{label}</span>
  </div>
);

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const target = useMemo(getEndOfDay, []);
  const { hours, minutes, seconds } = useCountdown(target);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await axios.get(`${API_URL}/products?limit=100`);
        const data = Array.isArray(res.data) ? res.data.slice(0, 15) : [];
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSale();
  }, []);

  const img = (p) => (p?.image_urls || p?.imageUrls || [])[0];
  // Deterministic "sold" percentage per product for the urgency bar.
  const soldPct = (p) => 45 + (((p.title?.length || 6) * 9) % 50);
  const flashDiscount = (p) => p.discount_percentage || 30 + (((p.title?.length || 5) * 5) % 40);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,#f59e0b_0,transparent_35%),radial-gradient(circle_at_80%_70%,#ef4444_0,transparent_40%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 flex flex-col items-center text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center">
            <motion.div variants={fadeUp} className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mb-5">
              <Zap size={40} className="text-amber-400" fill="currentColor" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight mb-3 leading-[0.95]">
              FLASH <span className="text-amber-400">SALE</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-300 text-base md:text-lg font-medium mb-8 max-w-lg">
              Deep discounts, gone in a flash. Grab them before the timer hits zero — today only.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center gap-3 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="hidden sm:flex items-center gap-1.5 text-amber-400 font-bold text-sm mr-2">
                <Flame size={16} /> Ends in
              </span>
              <TimeBox value={hours} label="Hours" />
              <span className="text-2xl font-black text-slate-600 pb-5">:</span>
              <TimeBox value={minutes} label="Mins" />
              <span className="text-2xl font-black text-slate-600 pb-5">:</span>
              <TimeBox value={seconds} label="Secs" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── STICKY MINI COUNTDOWN BAR ─────────────────────────────────────── */}
      <div className="sticky top-20 z-30 bg-slate-900/95 backdrop-blur border-b border-white/10 text-white shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-bold text-sm">
            <Zap size={16} className="text-amber-400" fill="currentColor" />
            <span className="hidden sm:inline">Flash Sale live —</span> hurry!
          </span>
          <div className="flex items-center gap-2">
            <TimeBox value={hours} label="Hrs" compact />
            <span className="font-black text-slate-600 pb-3.5">:</span>
            <TimeBox value={minutes} label="Min" compact />
            <span className="font-black text-slate-600 pb-3.5">:</span>
            <TimeBox value={seconds} label="Sec" compact />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Zap size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No flash deals live right now. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          >
            {products.map((product) => {
              const pct = soldPct(product);
              const disc = flashDiscount(product);
              return (
                <motion.div
                  key={product._id || product.id}
                  variants={fadeUp}
                  className="relative w-full rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-shadow group flex flex-col overflow-hidden"
                >
                  <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-[#e53935] to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-br-lg flex items-center gap-1">
                    <Zap size={11} fill="currentColor" /> -{disc}%
                  </div>
                  <Link to={`/products/${product._id || product.id}`} state={{ product }} className="block pt-6 px-4 pb-2">
                    <div className="h-36 w-full flex items-center justify-center">
                      {img(product) ? (
                        <img src={img(product)} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-4xl text-slate-200">🛒</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3.5 flex flex-col flex-1 border-t border-slate-50">
                    <Link to={`/products/${product._id || product.id}`} state={{ product }} className="flex-1">
                      <h3 className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-[#0f5132] transition-colors mb-2">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-sm font-extrabold text-slate-900">₹{product.price}</span>
                      <span className="text-[11px] font-medium text-slate-400 line-through">
                        ₹{product.compare_at_price || Math.round(product.price / (1 - disc / 100))}
                      </span>
                    </div>
                    {/* Urgency progress bar */}
                    <div className="mb-3">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#e53935]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-[#e53935] mt-1 flex items-center gap-1">
                        <Flame size={10} /> {pct}% claimed
                      </p>
                    </div>
                    <AddToCartButton product={product} fullWidth={true} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ─── NEXT DROP TEASER ──────────────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#0c4128] to-[#0f5132] text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_90%_20%,#f59e0b_0,transparent_40%)]" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-black mb-1">Next drop tomorrow, 12 PM</h3>
              <p className="text-emerald-100/90 font-medium">Get notified so you never miss a flash deal again.</p>
            </div>
            <button className="relative inline-flex items-center gap-2 bg-amber-400 text-[#0c4128] px-7 py-3.5 rounded-full font-bold hover:bg-amber-300 transition-colors shadow-lg shrink-0">
              <Bell size={18} /> Notify Me
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashSale;
