import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { LocationContext } from '../context/LocationContext';
import { AuthContext } from '../context/AuthContext';

// Reverse Geocoding helper
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api'}/location/reverse-geocode?lat=${lat}&lng=${lng}`);
    return await res.json();
  } catch (e) {
    return { area: 'Unknown Location', display: 'Could not fetch location name.' };
  }
}

export const LocationDrawer = ({ isOpen, onClose }) => {
  const { selectLocation, currentLocation } = useContext(LocationContext);
  const { user } = useContext(AuthContext);

  const canClose = !!currentLocation;

  const handleClose = () => {
    if (!canClose) {
      alert("Please select a delivery location to continue shopping.");
      return;
    }
    onClose();
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  const handleUseCurrentLocation = React.useCallback(() => {
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = await reverseGeocode(latitude, longitude);
        
        selectLocation({
          id: 'live-' + Date.now(),
          label: 'Current Location',
          area: geo.area,
          address: geo.display,
          lat: latitude,
          lng: longitude
        });
        
        setLoading(false);
        onClose();
      },
      async (err) => {
        console.warn('Geolocation failed:', err.message);
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const geo = await reverseGeocode(data.latitude, data.longitude);
            selectLocation({
              id: 'ip-' + Date.now(),
              label: 'Current Location',
              area: geo.area,
              address: geo.display,
              lat: data.latitude,
              lng: data.longitude
            });
            onClose();
          } else {
            setError('Unable to fetch your current location. Please search for your address manually.');
          }
        } catch (ipErr) {
          setError('Unable to fetch your current location. Please search for your address manually.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [selectLocation, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSearchQuery('');
      setSearchResults([]);
      setHasAutoFetched(false);
    }
  }, [isOpen]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Debounce basic implementation
    setIsSearching(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api'}/location/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = async (res) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    
    setSearchQuery(res.display_name.split(',')[0]);
    setSearchResults([]);
    setLoading(true);
    
    const geo = await reverseGeocode(lat, lng);
    
    selectLocation({
      id: 'search-' + Date.now(),
      label: 'Selected Location',
      area: geo.area,
      address: geo.display,
      lat,
      lng
    });
    
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClose ? handleClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                Welcome to <span className="text-primary font-extrabold tracking-tight">OneBasket</span>
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              
              <div className="flex items-start gap-4 mb-6">
                <div className="mt-1 flex-shrink-0">
                  <MapPin size={24} className="text-slate-700" />
                </div>
                <p className="text-slate-600 font-medium text-[15px] leading-relaxed">
                  Please provide your delivery location to see products at nearby store
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 relative">
                
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={loading}
                  className="w-full sm:w-auto flex-shrink-0 bg-[#0c831f] hover:bg-[#0a6f1a] text-white px-6 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Detect my location'}
                </button>

                <div className="flex items-center justify-center text-slate-400 text-xs font-semibold px-2">
                  <span className="bg-white px-2 z-10 text-slate-300 border border-slate-200 rounded-full py-1">OR</span>
                </div>

                <div className="w-full relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="search delivery location"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] transition-all"
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-lg max-h-60 overflow-y-auto z-50">
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <Loader2 size={20} className="animate-spin mx-auto text-primary" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((res) => (
                          <button
                            key={res.place_id}
                            onClick={() => selectSearchResult(res)}
                            className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex flex-col"
                          >
                            <span className="font-semibold text-slate-800 text-sm truncate w-full">{res.display_name.split(',')[0]}</span>
                            <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{res.display_name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
