import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProductsTab } from './ProductsTab';

export default function ProductsPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <ProductsTab token={token} />
    </div>
  );
}
