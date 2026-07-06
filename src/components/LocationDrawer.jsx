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
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClose ? handleClose : undefined}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal Container */}
          <div className="absolute top-[80px] left-4 md:left-[150px] lg:left-[170px] z-[210] w-[calc(100%-32px)] md:w-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-white w-full md:w-[480px] rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col"
            >
              {/* Content */}
              <div className="p-7">
                <div className="text-[13px] text-slate-500 mb-6">
                  Welcome to <span className="text-[#0c831f] tracking-tight">OneBasket</span>
                </div>
                
                <div className="flex items-start gap-4 mb-8">
                  <div className="mt-0.5 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <p className="text-[#4f585e] text-[15px] leading-[1.4]">
                    Please provide your delivery location to see<br/>products at nearby store
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                    className="flex-shrink-0 bg-[#0c831f] hover:bg-[#0a6f1a] text-white px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center min-w-[140px]"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Detect my location'}
                  </button>

                  <div className="flex items-center justify-center text-[#999] text-[11px] font-medium px-1">
                    <span className="bg-white px-2 z-10 border border-[#e0e0e0] rounded-full py-1">OR</span>
                  </div>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="search delivery location"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-md text-[13px] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#0c831f] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Integrated Search Results */}
              {searchQuery && (
                <div className="border-t border-[#eee] max-h-[350px] overflow-y-auto bg-white flex flex-col rounded-b-lg">
                  {isSearching ? (
                    <div className="p-6 text-center">
                      <Loader2 size={24} className="animate-spin mx-auto text-[#0c831f]" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((res) => (
                      <button
                        key={res.place_id}
                        onClick={() => selectSearchResult(res)}
                        className="w-full text-left px-7 py-4 border-b border-[#f5f5f5] hover:bg-[#fcfcfc] transition-colors flex items-start gap-4"
                      >
                        <MapPin size={18} className="text-[#999] mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[#333] text-[14px] font-medium truncate uppercase">{res.display_name.split(',')[0]}</span>
                          <span className="text-[13px] text-[#888] line-clamp-1 mt-1">{res.display_name}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-[#999]">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
