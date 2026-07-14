import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ArrowLeft, MapPin, Clock, Package, CheckCircle2, Truck, Loader2, XCircle, AlertCircle, Star, RefreshCcw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const STATUS_STEPS = [
  { id: 'placed', label: 'Order Placed', icon: Package },
  { id: 'preparing', label: 'Order Accepted', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const DeliveryMap = ({ location }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window === 'undefined') return;

    // Dynamically load Leaflet
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapInstance.current) return; // Already initialized
      const L = window.L;
      const map = L.map(mapRef.current).setView([location.lat, location.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;background:#0f766e;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: '',
      });

      markerRef.current = L.marker([location.lat, location.lng], { icon }).addTo(map)
        .bindPopup('🛵 Delivery Partner').openPopup();
      mapInstance.current = map;
    }

    return () => {
      // Do not destroy: just update on next render
    };
  }, []);

  // Update marker position when location changes
  useEffect(() => {
    if (mapInstance.current && markerRef.current && window.L) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      mapInstance.current.panTo([location.lat, location.lng], { animate: true, duration: 1 });
    }
  }, [location]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner"
      style={{ zIndex: 0 }}
    />
  );
};

export const OrderTracking = () => {
  const { orderId } = useParams();
  const { token } = useContext(AuthContext);
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [status, setStatus] = useState('Out for Delivery');
  const [eta, setEta] = useState(null);
  const [connected, setConnected] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!orderId || !token) return;

    const fetchOrder = () => {
      Promise.all([
        axios.get(`${API}/orders/${orderId}?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/settings`)
      ]).then(([orderRes, settingsRes]) => {
        const order = orderRes.data;
        const cancelWindowMins = settingsRes.data?.cancel_window_mins || 5;

        setOrderDetails(order);
        if (order.order_status) setStatus(order.order_status);
        
        if (order.created_at) {
          // Parse UTC date string
          const createdAt = new Date(order.created_at.replace("Z", "") + "Z");
          const windowMs = cancelWindowMins * 60000;
          const diffInSeconds = Math.floor((createdAt.getTime() + windowMs - Date.now()) / 1000);
          setTimeLeft(Math.max(0, diffInSeconds));
        }
      }).catch(err => console.error("Failed to fetch order or settings", err));
    };

    fetchOrder();
    
    // Poll every 2.5 seconds as a reliable fallback for status updates
    const intervalId = setInterval(fetchOrder, 2500);
    
    // Also fetch immediately when the tab regains focus
    window.addEventListener('focus', fetchOrder);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', fetchOrder);
    };
  }, [orderId, token]);

  useEffect(() => {
    if (!orderId) return;

    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      ws = new WebSocket(`wss://e-commerce-backend-s2r8.onrender.com/api/orders/${orderId}/ws`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.location) setLocation(data.location);
          if (data.status) setStatus(data.status);
          if (data.estimated_time_mins !== undefined) setEta(data.estimated_time_mins);
        } catch {}
      };
      ws.onerror = () => {
        setConnected(false);
      };
      ws.onclose = () => {
        setConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop
        ws.close();
      }
    };
  }, [orderId]);

  useEffect(() => {
    if (timeLeft <= 0 || status === 'Cancelled' || status === 'Refunded') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  useEffect(() => {
    if (status === 'Delivered') {
      const promptedKey = `review_prompt_${orderId}`;
      if (!sessionStorage.getItem(promptedKey)) {
        // slight delay so they see the page update first
        setTimeout(() => setShowReviewPrompt(true), 1000);
        sessionStorage.setItem(promptedKey, 'true');
      }
    }
  }, [status, orderId]);

  const handleCancelOrder = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    setShowCancelConfirm(false);
    setCancelling(true);
    try {
      await axios.put(`${API}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Cancelled');
      setTimeLeft(0);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isCancelled = status.toLowerCase() === 'cancelled';
  const isRefunded = status.toLowerCase() === 'refunded';
  const isDelivered = status === 'Delivered';
  
  let steps = STATUS_STEPS;
  if (isCancelled || isRefunded) {
    steps = [
      { id: 'placed', label: 'Order Placed', icon: Package },
      { id: isRefunded ? 'refunded' : 'cancelled', label: isRefunded ? 'Refunded' : 'Cancelled', icon: XCircle },
    ];
  }

  const currentStepIndex = (isCancelled || isRefunded) ? 1
    : status === 'Delivered' ? 3
    : status.toLowerCase().includes('deliver') ? 2
    : status.toLowerCase().includes('prepar') ? 1
    : 0;

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Track Your Order</h1>
          {orderId && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Order ID: <span className="font-mono text-slate-700">{orderId}</span>
              </p>
              {timeLeft > 0 && !isCancelled && !isRefunded && !isDelivered && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-red-500">
                    Cancel window: {formatTime(timeLeft)}
                  </span>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isRefunded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start sm:items-center gap-4 bg-purple-50 border-2 border-purple-200 rounded-2xl px-6 py-5 mb-6 shadow-sm"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0">
              <RefreshCcw size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="font-extrabold text-purple-800 text-lg">Refund Processed Successfully</p>
              <p className="text-sm font-medium text-purple-600 mt-0.5 leading-relaxed">
                Your order was refunded by the admin. The amount has been credited back to your original payment method. 
                Depending on your bank, it may take 3-5 business days to reflect.
              </p>
            </div>
          </motion.div>
        )}

        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6"
          >
            <AlertCircle size={22} className="text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-red-700">Order Cancelled</p>
              <p className="text-sm text-red-600">This order has been cancelled and will not be delivered.</p>
            </div>
          </motion.div>
        )}

        {isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6"
          >
            <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-emerald-700">Product Delivered Successfully!</p>
              <p className="text-sm text-emerald-600">Your order has been delivered. Thank you for shopping with OneBasket!</p>
            </div>
          </motion.div>
        )}

        {/* Connection status pill */}
        {!isCancelled && !isRefunded && !isDelivered && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${
            connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {connected ? 'Live tracking active' : 'Connecting to live tracking…'}
          </div>
        )}

        {/* ETA Banner */}
        {eta !== null && !isCancelled && !isRefunded && !isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 mb-6"
          >
            <Clock size={22} className="text-primary shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Arriving in ~{eta} minutes</p>
              <p className="text-sm text-slate-500">Your delivery partner is on the way</p>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Order Progress</p>
          <div className="flex items-center justify-between relative">
            {/* Track line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 z-0" />
            <motion.div
              className="absolute top-5 left-5 h-0.5 bg-primary z-0"
              animate={{ width: `calc((100% - 2.5rem) * ${(currentStepIndex / (STATUS_STEPS.length - 1))})` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              const isCancelStep = (isCancelled || isRefunded) && i === 1;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                  <motion.div
                    animate={{
                      backgroundColor: isCancelStep ? (isRefunded ? '#9333ea' : '#ef4444') : (isDone || isActive ? '#0f766e' : '#f1f5f9'),
                      scale: isActive ? 1.15 : 1,
                      boxShadow: isActive ? (isCancelStep ? (isRefunded ? '0 0 0 4px rgba(147,51,234,0.2)' : '0 0 0 4px rgba(239,68,68,0.2)') : '0 0 0 4px rgba(15,118,110,0.2)') : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <Icon size={18} className={isDone || isActive || isCancelStep ? 'text-white' : 'text-slate-400'} />
                  </motion.div>
                  <span className={`text-xs font-medium text-center w-20 ${isActive ? (isCancelStep ? (isRefunded ? 'text-purple-600 font-bold' : 'text-red-600 font-bold') : 'text-primary font-bold') : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Map */}
        {!isCancelled && !isRefunded && !isDelivered && (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <p className="text-sm font-semibold text-slate-700">Live Delivery Location</p>
            </div>
            <DeliveryMap location={location} />
            <p className="text-xs text-slate-400 mt-2 text-center">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)} — updates every 3 seconds
            </p>
          </div>
        )}

        {/* Order Details Card */}
        {orderDetails && (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">{item.title}</span>
                      <span className="text-xs text-slate-500 font-semibold mt-0.5">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="font-bold text-slate-800">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                    {isDelivered && (
                      <Link 
                        to={`/products/${item.product_id}`}
                        className="text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors inline-block"
                      >
                        Rate & Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Paid ({orderDetails.payment_mode})</span>
              <span className="text-xl font-extrabold text-primary">₹{orderDetails.total_amount.toFixed(2)}</span>
            </div>
            {orderDetails.delivery_location && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</p>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{orderDetails.delivery_location.label}</p>
                    <p className="text-sm text-slate-500">{orderDetails.delivery_location.flat ? `${orderDetails.delivery_location.flat}, ` : ''}{orderDetails.delivery_location.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Card */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">Need help?</p>
            <p className="text-sm text-slate-500">Our support team is available 24/7</p>
          </div>
          <button className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm">
            Contact Support
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? You will not be able to undo this action."
        confirmText="Yes, Cancel Order"
        onConfirm={confirmCancelOrder}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <AnimatePresence>
        {showReviewPrompt && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowReviewPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 text-center p-8"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Star size={32} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How was your order?</h2>
              <p className="text-slate-500 mb-6 text-sm">Your order has been successfully delivered! Please take a moment to rate your products.</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowReviewPrompt(false);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl font-bold transition-all shadow-sm"
                >
                  Rate Products Now
                </button>
                <button
                  onClick={() => setShowReviewPrompt(false)}
                  className="w-full py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
