import React from 'react';

// Skeleton placeholder that matches ProductCard's footprint so grids don't
// jump on load. Used by Deals / New Arrivals / Best Sellers / Flash Sale.
export const ProductCardSkeleton = () => (
  <div className="relative w-full rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
    <div className="h-36 w-full bg-slate-100 animate-pulse" />
    <div className="p-3.5 flex flex-col gap-2 flex-1 border-t border-slate-50">
      <div className="h-3 w-11/12 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
      <div className="mt-auto flex flex-col gap-2">
        <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
        <div className="h-9 w-full bg-slate-100 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 10 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductCardSkeleton;
