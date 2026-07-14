import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PaymentsTab } from './PaymentsTab';

export default function PaymentsPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <PaymentsTab token={token} />
    </div>
  );
}
