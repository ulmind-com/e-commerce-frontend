import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UsersTab } from './UsersTab';

export default function CustomersPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <UsersTab token={token} />
    </div>
  );
}
