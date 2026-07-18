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
    <div className="relative w-full rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 group flex flex-col h-full overflow-hidden">
      
      {/* Discount Badge & Wishlist */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-10 pointer-events-none">
        {product.discount_percentage ? (
          <div className="bg-[#e53935] text-white text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-auto">
            -{product.discount_percentage}%
          </div>
        ) : (
          <div></div> // placeholder
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto ${
            liked
              ? 'bg-red-50 text-red-500 scale-110'
              : 'bg-white text-slate-300 hover:text-red-400 hover:bg-slate-50'
          }`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Image */}
      <Link
        to={`/products/${productId}`}
        state={{ product }}
        className="block relative pt-4 px-4 pb-2 bg-white"
      >
        <div className="h-36 w-full flex items-center justify-center">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={product.title}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-4xl text-slate-200">🛒</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1 border-t border-slate-50">
        <Link to={`/products/${productId}`} state={{ product }} className="flex-1">
          <h3 className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-[#0f5132] transition-colors mb-1">
            {product.title}
          </h3>
          {product.weight && (
            <p className="text-[11px] text-slate-500 mb-2">{product.weight}</p>
          )}
        </Link>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm font-extrabold text-slate-900">₹{product.price}</span>
            {(product.compare_at_price || Math.round(product.price * 1.15)) > product.price && (
              <span className="text-[11px] font-medium text-slate-400 line-through">
                ₹{product.compare_at_price || Math.round(product.price * 1.15)}
              </span>
            )}
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-0.5 mb-3">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={10} fill={i <= 4 ? "#f59e0b" : "#e2e8f0"} className={i <= 4 ? "text-amber-400" : "text-slate-200"} />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">(42)</span>
          </div>

          {/* Add to Cart */}
          <AddToCartButton product={product} fullWidth={true} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
