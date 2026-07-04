import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden bg-white/5 rounded-xl ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
      />
    </motion.div>
  );
};

export const ProductSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="w-full max-w-sm rounded-2xl p-4 glass"
        >
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex justify-between mt-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
