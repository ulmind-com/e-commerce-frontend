import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Search, PenLine, Mail } from 'lucide-react';
import { fadeUp, stagger } from '../lib/storefront';

const POSTS = [
  {
    id: 1,
    title: '10 Superfoods You Need in Your Daily Diet',
    excerpt: 'From blueberries to lentils — the everyday grocery-aisle heroes that quietly transform your health.',
    category: 'Health & Wellness',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000',
    date: 'Jul 12, 2026',
    read: '6 min read',
    author: 'Ananya Rao',
    featured: true,
  },
  {
    id: 2,
    title: 'The Ultimate Guide to Choosing Fresh Produce',
    excerpt: 'Know exactly what to look, smell and feel for so you never bring home a bad batch again.',
    category: 'Grocery Tips',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000',
    date: 'Jul 10, 2026',
    read: '5 min read',
    author: 'Vikram Nair',
  },
  {
    id: 3,
    title: '5 Quick & Healthy Breakfast Recipes',
    excerpt: 'Under-ten-minute breakfasts that keep you full till lunch — no fancy ingredients required.',
    category: 'Recipes',
    image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=1000',
    date: 'Jul 05, 2026',
    read: '4 min read',
    author: 'Meera Iyer',
  },
  {
    id: 4,
    title: 'How to Store Vegetables to Make Them Last Longer',
    excerpt: 'Simple fridge and pantry tricks that cut food waste and keep your veggies crisp for days.',
    category: 'Life Hacks',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000',
    date: 'Jun 28, 2026',
    read: '7 min read',
    author: 'Rahul Sen',
  },
  {
    id: 5,
    title: 'Seasonal Eating: What to Buy This Monsoon',
    excerpt: 'A month-by-month guide to the freshest, cheapest and tastiest produce in season right now.',
    category: 'Grocery Tips',
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1000',
    date: 'Jun 20, 2026',
    read: '5 min read',
    author: 'Vikram Nair',
  },
  {
    id: 6,
    title: 'Pantry Staples Every Indian Kitchen Needs',
    excerpt: 'Build a smart, waste-free pantry with these long-lasting essentials from the OneBasket aisles.',
    category: 'Life Hacks',
    image: 'https://images.unsplash.com/photo-1584385002340-d886f3a0f097?q=80&w=1000',
    date: 'Jun 14, 2026',
    read: '6 min read',
    author: 'Meera Iyer',
  },
];

const CATEGORIES = ['All', 'Health & Wellness', 'Grocery Tips', 'Recipes', 'Life Hacks'];

const Blog = () => {
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');

  const featured = POSTS.find((p) => p.featured) || POSTS[0];

  const filtered = useMemo(() => {
    return POSTS.filter((p) => p.id !== featured.id)
      .filter((p) => activeCat === 'All' || p.category === activeCat)
      .filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()));
  }, [activeCat, query, featured.id]);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1b14] via-[#0c4128] to-[#0f5132] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_18%_25%,#2dd4bf_0,transparent_40%),radial-gradient(circle_at_82%_75%,#f59e0b_0,transparent_45%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <PenLine size={14} /> The OneBasket Journal
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-[0.95]">
              Stories, recipes & fresh ideas
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg font-medium mb-8">
              Tips to shop smarter, cook better and live fresher — straight from the OneBasket kitchen.
            </motion.p>
            <motion.div variants={fadeUp} className="relative max-w-md mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles"
                className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-white/95 text-slate-800 placeholder-slate-400 font-medium outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* ─── FEATURED POST ─────────────────────────────────────────────────── */}
        <motion.article
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="group grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow mb-14"
        >
          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <span className="absolute top-5 left-5 bg-amber-400 text-[#0c4128] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">Featured</span>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs font-bold text-[#0f5132] mb-4">
              <span className="bg-emerald-50 px-2.5 py-1 rounded-full">{featured.category}</span>
              <span className="flex items-center gap-1 text-slate-400"><Clock size={12} /> {featured.read}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 group-hover:text-[#0f5132] transition-colors">{featured.title}</h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6">{featured.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0f5132] text-white flex items-center justify-center font-bold text-sm">
                  {featured.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{featured.author}</p>
                  <p className="text-xs text-slate-400">{featured.date}</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-bold text-[#0f5132] hover:gap-3 transition-all">
                Read Article <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.article>

        {/* ─── CATEGORY FILTER ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
          {CATEGORIES.map((cat) => (
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

        {/* ─── POST GRID ─────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-medium">No articles found. Try a different category.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((post) => (
              <motion.article
                key={post.id}
                variants={fadeUp}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-slate-100 flex flex-col hover:-translate-y-1 duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#0f5132] text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-3">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.read}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 leading-snug mb-3 group-hover:text-[#0f5132] transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-600">{post.author}</span>
                    <button className="flex items-center gap-1.5 text-sm font-bold text-[#0f5132] group-hover:gap-2.5 transition-all">
                      Read <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* ─── NEWSLETTER CTA ────────────────────────────────────────────────── */}
        <div className="mt-16 rounded-3xl bg-emerald-50 border border-emerald-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#0f5132] text-white flex items-center justify-center shrink-0">
            <Mail size={30} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-800 mb-1">Never miss a fresh idea</h3>
            <p className="text-slate-600 font-medium">Weekly recipes, tips and offers — straight to your inbox.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-64 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132]"
            />
            <button className="w-full sm:w-auto bg-[#0f5132] text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#0c4128] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
