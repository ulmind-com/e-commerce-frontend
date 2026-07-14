import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CategoriesTab } from './CategoriesTab';

export default function CategoriesPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <CategoriesTab token={token} />
    </div>
  );
}
