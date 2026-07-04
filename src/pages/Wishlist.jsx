import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartOff } from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-slate-600 font-medium">My Wishlist</span>
          </div>

          {/* Title + count */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">My Wishlist</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* ── Product grid ── */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <HeartOff size={56} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-400 max-w-sm">
              Save items you want to buy later by clicking the heart icon on products.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {wishlist.map((product, i) => (
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

export default Wishlist;
