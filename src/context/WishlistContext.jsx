import React, { createContext, useState, useEffect, useContext } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('onebasket_wishlist') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('onebasket_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = (product) => {
    const id = product._id || product.id;
    setWishlist(prev => {
      const exists = prev.find(p => (p._id || p.id) === id);
      if (exists) return prev.filter(p => (p._id || p.id) !== id);
      return [...prev, { ...product, id, imageUrls: product.image_urls || product.imageUrls || [] }];
    });
  };

  const isWishlisted = (product) => {
    const id = product?._id || product?.id;
    return wishlist.some(p => (p._id || p.id) === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
