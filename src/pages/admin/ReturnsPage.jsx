import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReturnKPICards from './returns/ReturnKPICards';
import ReturnAnalytics from './returns/ReturnAnalytics';
import ReturnDataGrid from './returns/ReturnDataGrid';
import ReturnDetailsDrawer from './returns/ReturnDetailsDrawer';
import InspectionModal from './returns/InspectionModal';
import RefundModal from './returns/RefundModal';
import { RefreshCcw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export default function ReturnsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [kpis, setKpis] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [reasonsData, setReasonsData] = useState([]);

  // Modals & Drawers state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, requestsRes] = await Promise.all([
        axios.get(`${API}/returns/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/returns/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setKpis(analyticsRes.data.kpis);
      setTrendData(analyticsRes.data.daily_trend);
      setReasonsData(analyticsRes.data.reasons);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error("Failed to fetch returns data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/returns/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh data
      // Update selected request in drawer
      if (selectedRequest && selectedRequest.id === orderId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const handleInspectionSubmit = async (data) => {
    try {
      await axios.post(`${API}/returns/${selectedRequest.id}/inspection`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInspectionOpen(false);
      fetchData();
      if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, status: data.result === 'Pass' ? 'Return Approved' : 'Return Rejected' });
      }
    } catch (error) {
      console.error("Inspection failed", error);
      alert("Failed to submit inspection");
    }
  };

  const handleRefundSubmit = async (data) => {
    try {
      // Manual refund for COD
      await axios.post(`${API}/returns/${selectedRequest.id}/refund/manual`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRefundOpen(false);
      fetchData();
      if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, status: 'Refunded' });
      }
    } catch (error) {
      console.error("Refund failed", error);
      alert("Failed to process refund");
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin text-primary-500"><RefreshCcw className="w-8 h-8" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Returns & Refunds Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage return requests, perform quality checks, and process refunds.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      <ReturnKPICards kpis={kpis} trendData={trendData} />
      <ReturnAnalytics trendData={trendData} reasonsData={reasonsData} />
      
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Return Requests</h2>
        <ReturnDataGrid 
          requests={requests} 
          onViewDetails={(req) => {
            setSelectedRequest(req);
            setIsDrawerOpen(true);
          }}
        />
      </div>

      {/* Drawers and Modals */}
      <ReturnDetailsDrawer 
        request={selectedRequest}
        onClose={() => { setIsDrawerOpen(false); setSelectedRequest(null); }}
        onUpdateStatus={handleUpdateStatus}
        onOpenInspection={(req) => setIsInspectionOpen(true)}
        onOpenRefund={(req) => setIsRefundOpen(true)}
      />

      <InspectionModal 
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        onSubmit={handleInspectionSubmit}
      />

      <RefundModal 
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        request={selectedRequest}
        onSubmit={handleRefundSubmit}
      />
    </div>
  );
}
