import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);

  const total = getCartTotal();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 bg-white border-l border-slate-100 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary" size={22} />
                <h2 className="text-xl font-bold text-slate-800">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <AnimatePresence>
                {cartItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-16"
                  >
                    <ShoppingBag size={52} strokeWidth={1.2} />
                    <p className="text-sm font-medium">Your basket is empty</p>
                  </motion.div>
                ) : (
                  cartItems.map((item) => {
                    const id = item._id || item.id;
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {item.image_urls?.[0] || item.imageUrls?.[0] ? (
                            <img src={item.image_urls?.[0] || item.imageUrls?.[0]} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                              🛒
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-sm">{item.title}</p>
                          <p className="text-primary font-bold text-sm">₹{item.price}</p>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-slate-600"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-slate-600"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex justify-between mb-3">
                <span className="text-slate-500 font-medium">Total</span>
                <span className="font-extrabold text-lg text-slate-800">₹{total.toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={onClose}
                className={`block w-full py-3 rounded-xl text-center font-bold transition-all text-white ${
                  cartItems.length === 0
                    ? 'bg-slate-300 pointer-events-none'
                    : 'bg-primary hover:bg-primary-600 shadow-[0_4px_20px_rgba(15,118,110,0.35)]'
                }`}
              >
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

