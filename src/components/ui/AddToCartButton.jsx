import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

export const AddToCartButton = ({ product, fullWidth = false }) => {
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);

  const productId = product?._id || product?.id;
  const cartItem = productId ? cartItems.find((item) => (item._id || item.id) === productId) : null;
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (product) addToCart({ ...product, _id: product._id || product.id });
  };

  const increment = (e) => {
    e.stopPropagation();
    const id = product?._id || product?.id;
    if (id) updateQuantity(id, quantity + 1);
  };

  const decrement = (e) => {
    e.stopPropagation();
    const id = product?._id || product?.id;
    if (id) updateQuantity(id, quantity - 1);
  };

  return (
    <div className={`relative flex items-center justify-center ${fullWidth ? 'w-full mt-3' : 'h-10'}`}>
      <AnimatePresence mode="wait">
        {quantity === 0 ? (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleAdd}
            className={fullWidth 
              ? "w-full h-10 bg-[#0f5132] hover:bg-[#0c4128] text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
              : "w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center transition-colors"
            }
          >
            {fullWidth ? <><ShoppingCart size={16} /> Add to Cart</> : <Plus size={20} />}
          </motion.button>
        ) : (
          <motion.div
            key="counter"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={fullWidth
              ? "w-full h-10 bg-[#0f5132] text-white font-semibold rounded-md flex items-center justify-between px-3 overflow-hidden shadow-sm"
              : "h-full min-w-[80px] bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-between px-1 overflow-hidden shadow-sm"
            }
          >
            <button onClick={decrement} className={`hover:bg-white/20 transition-colors flex items-center justify-center ${fullWidth ? 'w-8 h-8 rounded' : 'p-1 rounded-lg'}`}>
              <Minus size={16} />
            </button>
            <motion.span
              key={quantity}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-sm font-bold w-6 text-center"
            >
              {quantity}
            </motion.span>
            <button onClick={increment} className={`hover:bg-white/20 transition-colors flex items-center justify-center ${fullWidth ? 'w-8 h-8 rounded' : 'p-1 rounded-lg'}`}>
              <Plus size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
