import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Loader2, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'onebasket_location';

// Use backend API for reverse geocoding
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`http://localhost:8000/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    return data.area || data.display || 'Your Location';
  } catch {
    return 'Your Location';
  }
}

export const LocationModal = ({ onLocation }) => {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | requesting | success | denied | error
  const [locationLabel, setLocationLabel] = useState('');

  useEffect(() => {
    // Check if we already have a saved location
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      onLocation?.(parsed.label);
      return; // Don't show modal if location already saved
    }
    // Show modal after 1 second
    const t = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleAllow = () => {
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = await reverseGeocode(latitude, longitude);
        setLocationLabel(label);
        setStatus('success');
        const data = { label, lat: latitude, lng: longitude };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        onLocation?.(label);
        setTimeout(() => setShow(false), 2000);
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDeny = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ label: 'New Delhi, India', lat: 28.6139, lng: 77.2090 }));
    onLocation?.('New Delhi, India');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={status === 'requesting' ? undefined : handleDeny}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
          >
            {/* Close button */}
            {status !== 'requesting' && (
              <button
                onClick={handleDeny}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors z-10"
              >
                <X size={15} />
              </button>
            )}

            {/* Header gradient strip */}
            <div className="h-2 bg-gradient-to-r from-primary to-emerald-400" />

            <div className="p-7">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <AnimatePresence mode="wait">
                  {status === 'requesting' ? (
                    <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Loader2 size={32} className="text-primary animate-spin" />
                    </motion.div>
                  ) : status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 15, -10, 0] }}
                      transition={{ type: 'spring', bounce: 0.6 }}
                    >
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </motion.div>
                  ) : (
                    <motion.div key="pin" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <MapPin size={32} className="text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text content */}
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <h2 className="text-xl font-extrabold text-slate-800 mb-1">Location Set! 🎉</h2>
                    <p className="text-slate-500 text-sm">Delivering to</p>
                    <p className="text-primary font-bold text-lg mt-1">{locationLabel}</p>
                  </motion.div>
                ) : status === 'denied' ? (
                  <motion.div
                    key="denied-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <h2 className="text-xl font-extrabold text-slate-800 mb-2">Location Blocked</h2>
                    <p className="text-slate-500 text-sm mb-5">
                      Please enable location in your browser settings and reload, or we'll use a default location.
                    </p>
                    <button
                      onClick={handleDeny}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-sm"
                    >
                      Continue with Default
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <h2 className="text-xl font-extrabold text-slate-800 mb-2">
                      Enable Location
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                      Allow <span className="font-semibold text-slate-700">OneBasket</span> to access your location for accurate delivery estimates and nearby availability.
                    </p>

                    <div className="space-y-3">
                      <motion.button
                        onClick={handleAllow}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-md shadow-primary/20"
                      >
                        <Navigation size={18} />
                        {status === 'requesting' ? 'Getting location…' : 'Allow while visiting the site'}
                      </motion.button>

                      <button
                        onClick={handleDeny}
                        className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                      >
                        Never allow
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
