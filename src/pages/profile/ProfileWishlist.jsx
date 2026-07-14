import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/ui/ProductCard';

const ProfileWishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Wishlist</h1>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
          {wishlist.length} Item{wishlist.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="p-8 flex-1 bg-slate-50/50">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-12">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={40} className="text-rose-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8 font-medium">Save items that you like in your wishlist. Review them anytime and easily move them to the cart.</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-6">
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

export default ProfileWishlist;
