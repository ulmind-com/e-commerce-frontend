import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardTab } from './DashboardTab';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <DashboardTab token={token} onNavigate={(path) => navigate(`/admin/${path}`)} />
    </div>
  );
}
