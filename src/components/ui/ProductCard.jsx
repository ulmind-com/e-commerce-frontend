import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { AddToCartButton } from './AddToCartButton';

export const ProductCard = ({ product }) => {
  const { toggle, isWishlisted } = useWishlist();
  const liked = isWishlisted(product);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const images = product.image_urls || product.imageUrls || [];
  const productId = product._id || product.id;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative w-full rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 group overflow-hidden"
    >
      {/* Wishlist heart */}
      <button
        onClick={(e) => { e.preventDefault(); toggle(product); }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
          liked
            ? 'bg-red-500 text-white scale-110'
            : 'bg-white/90 text-slate-400 hover:text-red-400 hover:bg-white'
        }`}
      >
        <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <Link
        to={`/products/${productId}`}
        state={{ product }}
        className="block relative h-44 bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden"
      >
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={product.title}
            className="w-full h-full object-contain p-3 group-hover:scale-108 transition-transform duration-500"
            style={{ transform: 'translateZ(20px)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>
        )}

        {/* In stock badge */}
        {product.stock_quantity > 0 && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
            In Stock
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3.5">
        <Link to={`/products/${productId}`} state={{ product }}>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-primary transition-colors mb-1">
            {product.title}
          </h3>
        </Link>

        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4].map(i => (
            <Star key={i} size={10} fill="#f59e0b" className="text-amber-400" />
          ))}
          <Star size={10} className="text-slate-300" />
          <span className="text-[10px] text-slate-400 ml-1">(4.2)</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-extrabold text-slate-800">₹{product.price}</span>
            <span className="text-xs text-slate-400 line-through ml-1">
              ₹{Math.round(product.price * 1.15)}
            </span>
          </div>
          <div className="shrink-0">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
