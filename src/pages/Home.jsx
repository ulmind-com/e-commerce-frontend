import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { ProductCard } from '../components/ui/ProductCard';
import { 
  ChevronRight, Search, Menu, ShoppingCart, User, 
  MapPin, Clock, Truck, ShieldCheck, CheckCircle, Headphones 
} from 'lucide-react';

const HERO_BANNERS = [
  {
    subtitle: "Daily Essentials,",
    title: "DELIVERED <br className='hidden md:block'/> <span className='text-amber-400'>TO YOUR DOORSTEP</span>",
    desc: "Shop farm-fresh groceries, household items & more - all in one place.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200",
    bgClass: "from-[#0a3a24] via-[#0f5132]"
  },
  {
    subtitle: "Fresh Produce",
    title: "FARM FRESH <br className='hidden md:block'/> <span className='text-emerald-300'>FRUITS & VEGGIES</span>",
    desc: "100% organic, hand-picked fresh fruits and vegetables delivered daily.",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1200",
    bgClass: "from-[#1b4332] via-[#2d6a4f]"
  },
  {
    subtitle: "Dairy & Bakery",
    title: "MORNING <br className='hidden md:block'/> <span className='text-yellow-300'>ESSENTIALS</span>",
    desc: "Start your day with fresh milk, bread, eggs, and dairy products.",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1200",
    bgClass: "from-[#b08d57] via-[#c4a473]"
  },
  {
    subtitle: "Snacks & Munchies",
    title: "CRAVING <br className='hidden md:block'/> <span className='text-red-300'>SOMETHING TASTY?</span>",
    desc: "Stock up on premium biscuits, chips, chocolates, and healthy snacks.",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1200",
    bgClass: "from-[#8a2a2b] via-[#a33b3d]"
  },
  {
    subtitle: "Refreshing Beverages",
    title: "CHILL OUT <br className='hidden md:block'/> <span className='text-cyan-300'>THIS SUMMER</span>",
    desc: "Quench your thirst with cold drinks, fresh juices, and energy drinks.",
    image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?q=80&w=1200",
    bgClass: "from-[#005f73] via-[#0a9396]"
  },
  {
    subtitle: "Personal & Baby Care",
    title: "CARE FOR <br className='hidden md:block'/> <span className='text-pink-300'>YOUR LOVED ONES</span>",
    desc: "Premium hygiene, baby food, diapers, and wellness products.",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1200",
    bgClass: "from-[#6a4c93] via-[#8c67c6]"
  }
];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 text-xs">Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

const CATEGORY_IMAGES = {
  "Fresh Fruits":          "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80",
  "Pharmacy":              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&q=80",
  "Pet Care":              "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&q=80",
  "Baby Care":             "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80",
  "Dairy, Bread & Eggs":   "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
  "Mouth fresheners":      "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=200&q=80",
  "Cold Drinks & Juices":  "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&q=80",
  "Candies & Gums":        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&q=80",
  "Groceries":             "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80",
};

const CATEGORY_ICONS = [
  { name: 'Groceries', img: '/icons/groceries.png' },
  { name: 'Beverages', img: '/icons/beverages.png' },
  { name: 'Snacks', img: '/icons/snacks.png' },
  { name: 'Personal Care', img: '/icons/personal-care.png' },
  { name: 'Home Essentials', img: '/icons/home-essentials.png' },
  { name: 'Electronics', img: '/icons/electronics.png' },
  { name: 'Fashion', img: '/icons/fashion.png' },
  { name: 'Baby Care', img: '/icons/baby-care.png' },
  { name: 'Toys & Games', img: '/icons/toys.png' },
];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api'}/categories/`),
          axios.get(`${import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api'}/products?limit=100`)
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const flashSaleProducts = products.slice(0, 5);

  return (
    <div className="bg-white min-h-screen pt-4 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── 1. HERO SECTION ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          
          {/* Left Sidebar (Desktop Categories) */}
          <div className="hidden lg:flex flex-col w-[280px] shrink-0 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-[#0f5132] text-white p-4 font-bold flex items-center gap-2 shrink-0">
              <Menu size={20} />
              Shop by Categories
            </div>
            <ul className="py-2 h-[415px] overflow-y-auto scrollbar-hide flex-1">
              {loading ? (
                <div className="p-4 text-sm text-slate-500">Loading categories...</div>
              ) : (
                categories.slice(0, 10).map((cat) => (
                  <li key={cat._id}>
                    <Link 
                      to={`/products?category=${cat._id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 hover:text-[#0f5132] transition-colors text-sm font-medium text-slate-700 border-b border-slate-100 last:border-0 group"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={CATEGORY_IMAGES[cat.name] || CATEGORY_IMAGES["Groceries"]} 
                          alt="" 
                          className="w-6 h-6 rounded-full object-cover border border-slate-200" 
                        />
                        {cat.name}
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-[#0f5132]" />
                    </Link>
                  </li>
                ))
              )}
              <li className="px-5 py-3 mt-2 text-center">
                <Link to="/products" className="text-xs font-bold text-[#0f5132] hover:underline uppercase tracking-wider">
                  View All Categories ›
                </Link>
              </li>
            </ul>
          </div>

          {/* Main Hero Banner Carousel */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 text-white flex items-center h-[320px] lg:h-[550px] shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full flex items-center"
              >
                <div className="absolute inset-0 z-0">
                  <div className={`absolute inset-0 bg-gradient-to-r ${HERO_BANNERS[currentBanner].bgClass} to-transparent z-10`} />
                  <img 
                    src={HERO_BANNERS[currentBanner].image} 
                    alt="Banner" 
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
                
                <div className="relative z-20 pl-8 md:pl-16 max-w-xl">
                  <p className="text-amber-400 font-extrabold tracking-widest text-xs md:text-sm uppercase mb-3 drop-shadow-md">
                    {HERO_BANNERS[currentBanner].subtitle}
                  </p>
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight drop-shadow-lg"
                    dangerouslySetInnerHTML={{ __html: HERO_BANNERS[currentBanner].title }}
                  />
                  <p className="text-sm md:text-base font-medium text-slate-100 mb-8 max-w-sm drop-shadow">
                    {HERO_BANNERS[currentBanner].desc}
                  </p>
                  
                  {/* Four Features Row */}
                  <div className="hidden md:flex items-center gap-6 mb-8 text-xs font-semibold text-emerald-50">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-emerald-300/30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <CheckCircle size={18} className="text-emerald-300" />
                      </div>
                      <span>Best Quality</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-emerald-300/30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <ShieldCheck size={18} className="text-emerald-300" />
                      </div>
                      <span>Best Prices</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-emerald-300/30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <Truck size={18} className="text-emerald-300" />
                      </div>
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-emerald-300/30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <Clock size={18} className="text-emerald-300" />
                      </div>
                      <span>Easy Returns</span>
                    </div>
                  </div>

                  <Link 
                    to="/products"
                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg"
                  >
                    Shop Now <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <button 
              onClick={() => setCurrentBanner((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1))}
              className="absolute left-4 z-30 w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <button 
              onClick={() => setCurrentBanner((prev) => (prev + 1) % HERO_BANNERS.length)}
              className="absolute right-4 z-30 w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
              {HERO_BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentBanner === idx ? 'bg-amber-400 w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── 2. CIRCULAR CATEGORY LINKS ────────────────────────────────────────────── */}
        {!loading && categories.length > 0 && (
          <div className="mb-14">
            <div className="flex gap-4 md:gap-8 justify-start md:justify-center overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {categories.slice(0, 8).map((cat, idx) => (
                <Link 
                  key={idx} 
                  to={`/products?category=${cat._id}`}
                  className="flex flex-col items-center min-w-[80px] md:min-w-[100px] cursor-pointer group"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-3 overflow-hidden shadow-sm border border-slate-100 group-hover:border-[#0f5132] group-hover:shadow-md transition-all">
                    <img 
                      src={CATEGORY_IMAGES[cat.name] || CATEGORY_IMAGES["Groceries"]} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <span className="text-[11px] md:text-xs font-bold text-center text-slate-700 group-hover:text-[#0f5132] transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
              {/* All Categories Button */}
              <Link to="/products" className="flex flex-col items-center min-w-[80px] md:min-w-[100px] cursor-pointer group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#0f5132] rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:bg-[#0c4128] transition-colors text-white">
                  <Menu size={28} />
                </div>
                <span className="text-[11px] md:text-xs font-bold text-center text-slate-700 group-hover:text-[#0f5132] transition-colors leading-tight">
                  All Categories
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* ─── 3. PROMOTIONAL BANNERS GRID ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
          {/* Mega Sale (2 cols) */}
          <Link to="/products" className="lg:col-span-2 relative rounded-xl overflow-hidden bg-[#0c4128] text-white p-8 md:p-12 shadow-sm group h-[300px] md:h-[340px] flex flex-col justify-center">
            <div className="absolute right-0 bottom-0 w-2/3 h-full z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c4128] to-transparent z-10" />
              <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=800" alt="Sale" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative z-10 max-w-[60%]">
              <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest mb-2 block">Weekend</span>
              <h2 className="text-4xl md:text-5xl font-black mb-2 text-white">MEGA SALE</h2>
              <p className="text-2xl font-bold text-emerald-200 mb-2">Up to 50% OFF</p>
              <p className="text-sm text-slate-300 mb-6">On Selected Items</p>
              <button className="bg-white text-[#0c4128] px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
                Shop Now <ChevronRight size={16} />
              </button>
            </div>
          </Link>

          {/* Grocery Essentials (1 col) */}
          <Link to="/products" className="relative rounded-xl overflow-hidden bg-emerald-50 p-8 shadow-sm group h-[300px] md:h-[340px] flex flex-col justify-between border border-emerald-100">
            <div className="relative z-10">
              <span className="text-[#0c4128] font-black text-sm uppercase tracking-widest block mb-1">Grocery</span>
              <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">Essentials</h3>
              <p className="text-sm font-bold text-emerald-600 mb-4">Up to 30% OFF</p>
              <button className="bg-white border border-[#0c4128] text-[#0c4128] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#0c4128] hover:text-white transition-colors inline-flex items-center gap-1">
                Shop Now <ChevronRight size={14} />
              </button>
            </div>
            <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=400" alt="Groceries" className="absolute -bottom-10 -right-10 w-64 h-64 object-contain opacity-90 group-hover:-translate-y-2 transition-transform duration-500" />
          </Link>

          {/* Stacked Small Banners (1 col) */}
          <div className="flex flex-col gap-6 h-[300px] md:h-[340px]">
            <Link to="/products" className="flex-1 relative rounded-xl overflow-hidden bg-blue-50 p-6 shadow-sm group border border-blue-100 flex flex-col justify-center">
              <div className="relative z-10 max-w-[60%]">
                <span className="text-blue-600 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Electronics</span>
                <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">Best Deals</h3>
                <p className="text-xs font-bold text-blue-500 mb-3">Up to 40% OFF</p>
              </div>
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400" alt="Electronics" className="absolute right-0 top-0 h-full w-1/2 object-cover rounded-l-3xl opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link to="/products" className="flex-1 relative rounded-xl overflow-hidden bg-rose-50 p-6 shadow-sm group border border-rose-100 flex flex-col justify-center">
              <div className="relative z-10 max-w-[60%]">
                <span className="text-rose-600 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Fashion</span>
                <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">New Collection</h3>
                <p className="text-xs font-bold text-rose-500 mb-3">Up to 50% OFF</p>
              </div>
              <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400" alt="Fashion" className="absolute right-0 top-0 h-full w-1/2 object-cover rounded-l-3xl opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* ─── 4. FLASH SALE SECTION ─────────────────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <span className="text-amber-500">⚡</span> Flash Sale
              </h2>
              {/* Fake Countdown Timer */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-2">Limited time offers</span>
                <div className="flex gap-1.5 items-center">
                  <div className="bg-[#0f5132] text-white font-bold w-9 h-10 rounded flex flex-col items-center justify-center leading-none">
                    <span className="text-base">02</span>
                  </div>
                  <span className="font-bold text-slate-400">:</span>
                  <div className="bg-[#0f5132] text-white font-bold w-9 h-10 rounded flex flex-col items-center justify-center leading-none">
                    <span className="text-base">45</span>
                  </div>
                  <span className="font-bold text-slate-400">:</span>
                  <div className="bg-[#0f5132] text-white font-bold w-9 h-10 rounded flex flex-col items-center justify-center leading-none">
                    <span className="text-base">18</span>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/products" className="text-[#0f5132] font-bold text-sm hover:underline flex items-center gap-1">
              View All Deals <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-[360px] bg-slate-100 rounded-xl animate-pulse"></div>
              ))
            ) : flashSaleProducts.length === 0 ? (
              <div className="col-span-5 text-center py-10 text-slate-500">No products found.</div>
            ) : (
              flashSaleProducts.map((product, index) => (
                <ErrorBoundary key={product._id || index}>
                  <ProductCard product={product} />
                </ErrorBoundary>
              ))
            )}
          </div>
        </div>

        {/* ─── 5. TRUST BADGES ROW ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8 py-8 border-y border-slate-100 mb-16 bg-slate-50/50 rounded-2xl px-6">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0f5132] group-hover:bg-[#0f5132] group-hover:text-white transition-colors shadow-sm shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">Free Delivery</h4>
              <p className="text-[11px] text-slate-500 leading-tight">On orders over ₹2,000</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0f5132] group-hover:bg-[#0f5132] group-hover:text-white transition-colors shadow-sm shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">7 Days Return</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Hassle free return policy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0f5132] group-hover:bg-[#0f5132] group-hover:text-white transition-colors shadow-sm shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">Secure Payment</h4>
              <p className="text-[11px] text-slate-500 leading-tight">100% secure payment</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0f5132] group-hover:bg-[#0f5132] group-hover:text-white transition-colors shadow-sm shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">Genuine Products</h4>
              <p className="text-[11px] text-slate-500 leading-tight">100% original & quality</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-default lg:border-l-0">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0f5132] group-hover:bg-[#0f5132] group-hover:text-white transition-colors shadow-sm shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">24/7 Support</h4>
              <p className="text-[11px] text-slate-500 leading-tight">We're here to help</p>
            </div>
          </div>
        </div>

        {/* ─── 6. NEWSLETTER & APP DOWNLOAD ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Newsletter Card */}
          <div className="bg-emerald-50 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-emerald-100">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Subscribe to our Newsletter</h3>
              <p className="text-sm text-slate-600 mb-6 font-medium">
                Get the latest updates on new arrivals, exclusive offers & more.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto md:mx-0">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132]"
                />
                <button className="w-full sm:w-auto bg-[#0f5132] text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#0c4128] transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="hidden md:block w-32 h-32 shrink-0">
              <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="Mail" className="w-full h-full object-contain opacity-80" />
            </div>
          </div>

          {/* App Download Card */}
          <div className="bg-slate-900 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-md relative overflow-hidden">
            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-2xl font-black text-white mb-2">Download Our App</h3>
              <p className="text-sm text-slate-300 mb-6 font-medium">
                Get exclusive app offers, faster checkout and track your orders easily.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button className="bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm">
                  <img src="https://cdn-icons-png.flaticon.com/512/888/888857.png" alt="Play Store" className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-[9px] font-bold text-slate-500 leading-tight uppercase tracking-wide">GET IT ON</div>
                    <div className="text-sm font-black text-slate-900 leading-tight">Google Play</div>
                  </div>
                </button>
                <button className="bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm">
                  <img src="https://cdn-icons-png.flaticon.com/512/888/888841.png" alt="App Store" className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-[9px] font-bold text-slate-500 leading-tight uppercase tracking-wide">Download on the</div>
                    <div className="text-sm font-black text-slate-900 leading-tight">App Store</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="hidden md:block absolute -right-4 -bottom-12 w-64 h-64 opacity-50">
              <img src="https://cdn-icons-png.flaticon.com/512/5434/5434937.png" alt="Phone App" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
