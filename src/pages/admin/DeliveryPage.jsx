import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SettingsTab } from './SettingsTab';

export default function DeliveryPage() {
  const { token } = useAuth();
  return (
    <div className="h-full">
      <SettingsTab token={token} />
    </div>
  );
}
