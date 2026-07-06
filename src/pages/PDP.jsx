import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import {
  ShoppingCart, Heart, Truck, Shield, RotateCcw,
  Star, ChevronLeft, ChevronRight, ArrowLeft,
  CheckCircle, Package, Zap, Plus, Minus, Share2,
} from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { ReviewModal } from '../components/ReviewModal';

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

// Star rating display
const StarRating = ({ rating = 4.2, count = 1240 }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">
      <span>{rating}</span>
      <Star size={11} fill="white" />
    </div>
    <span className="text-slate-400 text-sm">{count.toLocaleString()} ratings</span>
  </div>
);

// Dynamic Themes based on product ID
const THEMES = [
  { bg: 'bg-[#fdf8f6]', border: 'border-[#265c2b]' }, // Rose/Beige + Dark Green
  { bg: 'bg-[#f4fbf7]', border: 'border-[#059669]' }, // Mint + Emerald
  { bg: 'bg-[#f4f9fb]', border: 'border-[#0284c7]' }, // Sky Blue + Light Blue
  { bg: 'bg-[#fbf4fb]', border: 'border-[#9333ea]' }, // Lavender + Purple
  { bg: 'bg-[#fdfcf4]', border: 'border-[#d97706]' }, // Cream + Amber
  { bg: 'bg-[#fdf7f4]', border: 'border-[#ea580c]' }, // Peach + Orange
  { bg: 'bg-[#f5f7fa]', border: 'border-[#475569]' }, // Slate + Slate
  { bg: 'bg-white', border: 'border-[#0c831f]' }, // Pure White + Primary Green
];

const getProductTheme = (id) => {
  if (!id) return THEMES[0];
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return THEMES[sum % THEMES.length];
};

// Image gallery with thumbnails
const ImageGallery = ({ images, theme }) => {
  const [selected, setSelected] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const imgs = images?.length ? images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
  ];

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPos({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  return (
    <div className="flex gap-4 relative">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3 w-20 shrink-0 overflow-y-auto overflow-x-hidden max-h-[512px] scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {imgs.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
              selected === i ? `${theme.border} shadow-md` : 'border-transparent hover:border-black/20'
            }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div 
        className="flex-1 relative aspect-square max-w-lg rounded-xl overflow-hidden bg-transparent cursor-crosshair"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
        ref={imgRef}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selected}
            src={imgs[selected]}
            alt="product"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Inner Zoom Overlay */}
        {showZoom && (
          <div 
            className="hidden lg:block absolute inset-0 z-50 pointer-events-none bg-white"
            style={{
              backgroundImage: `url(${imgs[selected]})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: '250%',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>
    </div>
  );
};

export const PDP = () => {
  const { id } = useParams();
  const location = useLocation();
  // Normalize image field names (backend uses image_urls, frontend uses imageUrls)
  const normalizeProduct = (p) => p ? ({
    ...p,
    id: p._id || p.id,
    imageUrls: p.image_urls || p.imageUrls || [],
  }) : null;

  const [product, setProduct] = useState(
    location.state?.product ? normalizeProduct(location.state.product) : null
  );
  const [loading, setLoading] = useState(!location.state?.product);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { token, openAuthModal } = useContext(AuthContext);
  const { currentLocation, shopLocation } = useContext(LocationContext);

  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [cantReviewReason, setCantReviewReason] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    // Fetch reviews
    const productId = product?._id || product?.id || id;
    if (productId) {
      axios.get(`${API}/api/reviews/${productId}`)
        .then(res => setReviews(res.data))
        .catch(err => console.error("Failed to load reviews:", err));
        
      if (token) {
        axios.get(`${API}/api/reviews/${productId}/can-review`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setCanReview(res.data.can_review);
          setCantReviewReason(res.data.reason);
        })
        .catch(() => {
          setCanReview(false);
          setCantReviewReason("Please log in to review.");
        });
      }
    }
  }, [product?._id, product?.id, id, token]);

  useEffect(() => {
    const fetchProduct = () => {
      // Append timestamp to bust browser cache
      axios.get(`${API}/api/products/${id}?t=${Date.now()}`)
        .then((res) => {
          setProduct(normalizeProduct(res.data));
          setLoading(false);
        })
        .catch((err) => {
          console.error('Product fetch failed:', err);
          setLoading(false);
        });
    };

    // Fetch immediately on mount
    fetchProduct();

    // Poll every 2.5 seconds to instantly reflect Admin Panel updates!
    const intervalId = setInterval(fetchProduct, 2500);

    return () => clearInterval(intervalId);
  }, [id]);

  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    if (!product?.category_id) return;
    axios.get(`${API}/api/products?category_id=${product.category_id}`)
      .then((res) => {
        const filtered = res.data.filter(p => (p._id || p.id) !== (product._id || product.id));
        setSuggestedProducts(filtered.slice(0, 4));
      })
      .catch((err) => console.error('Suggested products fetch failed:', err));
  }, [product?.category_id, product?._id, product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addToCart({ ...product, id: product._id || product.id });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title}!`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package size={56} className="text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-700">Product Not Found</h2>
        <p className="text-slate-400 max-w-sm">We couldn't find this product. It may have been removed or the link is incorrect.</p>
        <Link to="/products" className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-semibold transition-all">
          <ArrowLeft size={16} /> Browse All Products
        </Link>
      </div>
    );
  }

  const images = product.image_urls || product.imageUrls || [];
  const inStock = product.stock_quantity > 0;
  const discountPct = Math.floor(Math.random() * 20) + 5; // simulated discount 5-25%
  const originalPrice = Math.round(product.price * (100 / (100 - discountPct)));

  const theme = getProductTheme(product?._id || product?.id);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} pb-20`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4"
          >
            <span className="font-medium">{toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-slate-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className={`transition-colors duration-500 ${theme.bg} border-b border-black/5 px-4 md:px-8 py-3`}>
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Left: Image Gallery ── */}
          <div className="bg-transparent p-0">
            <ImageGallery images={images} theme={theme} />

            {/* Trust badges below image */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-black/5">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'Above ₹499' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: Shield, label: '100% Genuine', sub: 'Verified seller' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <Icon size={22} className="text-primary" />
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Product Info ── */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary/30 hover:text-primary transition-all bg-white"
                    title="Share product"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-white ${
                      liked ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400'
                    }`}
                  >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2">
                <StarRating 
                  rating={reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"} 
                  count={reviews.length} 
                />
                {inStock ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-extrabold text-slate-800">₹{product.price}</span>
                <span className="text-lg text-slate-400 line-through">₹{originalPrice}</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">{discountPct}% off</span>
              </div>
              <p className="text-xs text-slate-500">Inclusive of all taxes. Free delivery on orders above ₹499.</p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">About this product</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product highlights */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Zap size={15} className="text-primary" /> Product Highlights
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Stock', `${product.stock_quantity || 0} units`],
                  ['Category', product.category_id ? 'Grocery' : 'General'],
                  ['Returns', product.returns_policy || '7 days'],
                  ['Warranty', product.warranty || 'No Warranty'],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">{key}</span>
                    <span className="font-medium text-slate-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 font-bold text-slate-800 min-w-[2.5rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock_quantity || 99, q + 1))}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-slate-400">Max {product.stock_quantity || 99} per order</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                disabled={!inStock}
                whileHover={{ scale: inStock ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all ${
                  added
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : inStock
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-lg shadow-amber-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} />
                {added ? 'Added to Cart ✓' : 'Add to Cart'}
              </motion.button>

              <motion.button
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => window.location.href = '/checkout', 300);
                }}
                disabled={!inStock}
                whileHover={{ scale: inStock ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all ${
                  inStock
                    ? 'bg-primary hover:bg-primary-600 text-white shadow-lg shadow-primary/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Zap size={20} />
                Buy Now
              </motion.button>
            </div>

            {/* Delivery info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivery Details</p>
              <div className="flex items-center gap-2 text-sm">
                <Truck size={16} className="text-primary" />
                {(() => {
                  let isExpress = false;
                  if (shopLocation && currentLocation?.lat && currentLocation?.lng && shopLocation.express_delivery_max_distance !== undefined) {
                    const distance = getDistanceFromLatLonInKm(
                      shopLocation.lat, shopLocation.lng,
                      currentLocation.lat, currentLocation.lng
                    );
                    if (distance !== null && distance <= shopLocation.express_delivery_max_distance) {
                      isExpress = true;
                    }
                  }
                  return (
                    <span className="text-slate-600">
                      {isExpress ? (
                        <>Delivered in <span className="font-semibold text-slate-800">30–45 minutes</span> (EXPRESS)</>
                      ) : (
                        <>Standard Delivery <span className="font-semibold text-slate-800">(2-3 days)</span></>
                      )}
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield size={16} className="text-primary" />
                <span className="text-slate-600">Cash on Delivery available</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dynamic Reviews Section ── */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Star size={20} className="text-amber-400" fill="currentColor" />
              Ratings & Reviews
            </h2>
            <button
              onClick={() => {
                if (!token) {
                  openAuthModal();
                } else if (!canReview) {
                  showToast(cantReviewReason || "You can only review products you have purchased.");
                } else {
                  setIsReviewModalOpen(true);
                }
              }}
              className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold text-sm transition-colors"
            >
              Write a Review
            </button>
          </div>
          
          {(() => {
            const totalRatings = reviews.length;
            const avgRating = totalRatings > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1) 
              : 0;
            
            const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach(r => {
              if (starCounts[r.rating] !== undefined) {
                starCounts[r.rating]++;
              }
            });

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Overall score */}
                <div className="text-center">
                  <div className="text-6xl font-extrabold text-slate-800 mb-1">{avgRating || '-'}</div>
                  <div className="flex justify-center mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={18} fill={i <= avgRating ? "#f59e0b" : "none"} className={i <= avgRating ? "text-amber-400" : "text-slate-300"} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">{totalRatings.toLocaleString()} ratings</p>
                </div>

                {/* Bar chart */}
                <div className="col-span-2 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = totalRatings > 0 ? Math.round((starCounts[star] / totalRatings) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 w-4">{star}</span>
                        <Star size={13} fill="#f59e0b" className="text-amber-400 shrink-0" />
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-2 rounded-full bg-amber-400"
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-8">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* User reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {reviews.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r._id || r.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {(r.user_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{r.user_name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {r.rating} <Star size={10} fill="white" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.review_text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Suggested Products ── */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12 bg-transparent">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Similar Products You Might Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-6">
              {suggestedProducts.map(p => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)}
        productId={product?._id || product?.id}
        token={token}
        onReviewAdded={(newReview) => setReviews([newReview, ...reviews])}
      />
    </div>
  );
};

export default PDP;
