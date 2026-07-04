import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

export const AddToCartButton = ({ product }) => {
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
    <div className="h-10 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        {quantity === 0 ? (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleAdd}
            className="w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center transition-colors"
          >
            <Plus size={20} />
          </motion.button>
        ) : (
          <motion.div
            key="counter"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="h-full min-w-[80px] bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-between px-1 overflow-hidden shadow-sm"
          >
            <button onClick={decrement} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <Minus size={16} />
            </button>
            <motion.span
              key={quantity}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-sm w-4 text-center font-bold"
            >
              {quantity}
            </motion.span>
            <button onClick={increment} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <Plus size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
