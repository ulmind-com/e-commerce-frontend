import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandsTab } from './BrandsTab';

export default function BrandsPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <BrandsTab token={token} />
    </div>
  );
}
