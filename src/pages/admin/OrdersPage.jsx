import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { OrdersTab } from './OrdersTab';

export default function OrdersPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <OrdersTab token={token} />
    </div>
  );
}
