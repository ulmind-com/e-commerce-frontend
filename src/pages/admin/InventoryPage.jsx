import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { InventoryTab } from './InventoryTab';

export default function InventoryPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <InventoryTab token={token} />
    </div>
  );
}
