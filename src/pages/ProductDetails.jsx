import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Info, Sparkles } from 'lucide-react';
import { AddToCartButton } from '../components/ui/AddToCartButton';
import { ProductCard } from '../components/ui/ProductCard';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    const fetchProductAndSimilar = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api'}/products/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct({
          ...data,
          id: data._id || data.id,
          imageUrls: data.image_urls || data.imageUrls || [],
          nutritionalInfo: data.nutritionalInfo || { Calories: '—', Fat: '—', Carbs: '—', Protein: '—' },
        });
      } catch (err) {
        console.error("Error fetching product", err);
      }
      
      try {
        setLoadingSimilar(true);
        const simRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api'}/products/${id}/similar`);
        if (simRes.ok) {
          const simData = await simRes.json();
          const mapped = simData.map(p => ({
            ...p,
            id: p._id || p.id,
            imageUrls: p.image_urls || p.imageUrls || []
          }));
          setSimilarProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching similar products", err);
      } finally {
        setLoadingSimilar(false);
      }
    };
    fetchProductAndSimilar();
  }, [id]);

  if (!product) {
    return <div className="min-h-screen pt-24 px-4 flex justify-center"><div className="animate-pulse h-64 w-full max-w-4xl bg-white/5 rounded-2xl"></div></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 px-4 md:px-8 max-w-6xl mx-auto pb-24"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Image (Shared Layout Animation simulated here with simple spring scale) */}
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative aspect-square glass rounded-3xl flex items-center justify-center p-8 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
          <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img src={product.imageUrls[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground text-xl">No Image</span>
            )}
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent mb-4 w-fit">
            <Clock size={14} /> <span className="text-sm font-semibold">Delivery in 8 mins</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{product.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{product.description}</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-bold text-primary-foreground">₹{product.price}</span>
            <span className="text-lg text-muted-foreground line-through">₹{product.price + 50}</span>
          </div>

          <div className="w-full max-w-xs mb-10">
            <AddToCartButton product={product} />
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
              <Info className="text-primary" />
              <h3 className="text-lg font-bold">Nutritional Facts</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg">
                  <span className="text-muted-foreground text-sm">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Similar Products Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mt-24"
      >
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-primary" size={28} />
          <h2 className="text-3xl font-extrabold tracking-tight">Similar Products</h2>
        </div>
        
        {loadingSimilar ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-64 bg-white/5 rounded-2xl"></div>
            ))}
          </div>
        ) : similarProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No similar products found right now.</p>
        )}
      </motion.div>

    </motion.div>
  );
};
