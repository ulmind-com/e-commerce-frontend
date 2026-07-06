import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Search, Home, Briefcase, Map, Plus, Check, Loader2, Trash2, Edit2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationContext } from '../context/LocationContext';
import { AuthContext } from '../context/AuthContext';
import { ConfirmModal } from './ui/ConfirmModal';

// Fix for default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Reverse Geocoding helper
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
    return await res.json();
  } catch (e) {
    return { area: 'Server Offline', display: 'Please ask AI to restart the servers.' };
  }
}

// Component to handle map clicks/drags
const LocationMarker = ({ position, setPosition, onPositionChanged }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChanged(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        setPosition(latlng);
        onPositionChanged(latlng);
      }
    },
  };

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

const MapUpdater = ({ position }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

export const LocationDrawer = ({ isOpen, onClose }) => {
  const { savedAddresses, selectLocation, addSavedAddress, editSavedAddress, deleteSavedAddress, currentLocation } = useContext(LocationContext);
  const { user, token } = useContext(AuthContext);

  const canClose = !!currentLocation;

  const handleClose = () => {
    if (!canClose) {
      alert("Please select a delivery location to continue shopping.");
      return;
    }
    onClose();
  };

  // View state: 'list' (shows saved/current), 'map' (interactive map), 'form' (filling out flat details)
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(false);
  
  // Location building state
  const [mapPos, setMapPos] = useState(null); // {lat, lng}
  const [geocodeData, setGeocodeData] = useState({ area: '', display: '' });
  
  // Form state
  const [form, setForm] = useState({ 
    flat: '', 
    buildingName: '', 
    landmark: '', 
    label: 'Home', 
    buildingType: 'Society', 
    receiverName: '', 
    receiverNumber: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formError, setFormError] = useState('');
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  const handleUseCurrentLocation = React.useCallback(() => {
    setLoading(true);
    setFormError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapPos({ lat: latitude, lng: longitude });
        const geo = await reverseGeocode(latitude, longitude);
        setGeocodeData(geo);
        setForm(f => ({ ...f, area: geo.area }));
        setLoading(false);
        setView('map');
      },
      async (err) => {
        console.warn('Geolocation failed:', err.message);
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setMapPos({ lat: data.latitude, lng: data.longitude });
            const geo = await reverseGeocode(data.latitude, data.longitude);
            setGeocodeData(geo);
            setForm(f => ({ ...f, area: geo.area }));
            setView('map');
          } else {
            setFormError('Unable to fetch your current location. Please search for your address manually.');
          }
        } catch (ipErr) {
          setFormError('Unable to fetch your current location. Please search for your address manually.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Reset view when opened
  useEffect(() => {
    if (isOpen) {
      setView('list');
      setEditingId(null);
      setAddressToDelete(null);
      setFormError('');
      setForm({ 
        flat: '', 
        buildingName: '', 
        landmark: '', 
        label: 'Home', 
        buildingType: 'Society', 
        receiverName: user?.full_name || '', 
        receiverNumber: user?.phone || '+91 ' 
      });
      setMapPos(null);
      setHasAutoFetched(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && !hasAutoFetched && !currentLocation && savedAddresses.length === 0) {
      setHasAutoFetched(true);
      handleUseCurrentLocation();
    }
  }, [isOpen, hasAutoFetched, currentLocation, savedAddresses, handleUseCurrentLocation]);

  const handleMapPinChanged = async (latlng) => {
    const geo = await reverseGeocode(latlng.lat, latlng.lng);
    setGeocodeData(geo);
    setForm(f => ({ ...f, area: geo.area }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`}/api/location/search?q=${encodeURIComponent(searchQuery)}`);
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
    setMapPos({ lat, lng });
    setSearchResults([]);
    setSearchQuery(res.display_name.split(',')[0]);
    const geo = await reverseGeocode(lat, lng);
    setGeocodeData(geo);
    setForm(f => ({ ...f, area: geo.area }));
  };

  const handleSaveAddress = async () => {
    setFormError('');
    if (!form.flat || !form.buildingName || !form.receiverName || !form.receiverNumber) {
      setFormError("Please enter all required fields.");
      return;
    }

    const fullAddressString = `${form.flat}, ${form.buildingName}, ${form.landmark ? form.landmark + ', ' : ''}${geocodeData.display}`;
    
    const newAddressObj = {
      label: form.label,
      flat: form.flat,
      buildingName: form.buildingName,
      buildingType: form.buildingType,
      receiverName: form.receiverName,
      receiverNumber: form.receiverNumber,
      area: form.area || geocodeData.area,
      landmark: form.landmark,
      address: fullAddressString,
      lat: mapPos.lat,
      lng: mapPos.lng
    };

    setLoading(true);
    try {
      if (token) {
        if (editingId) {
          await editSavedAddress(editingId, newAddressObj);
          selectLocation({ ...newAddressObj, id: editingId });
        } else {
          await addSavedAddress(newAddressObj);
          selectLocation({ ...newAddressObj, id: 'temp-' + Date.now() });
        }
      } else {
        // Guest user, just set it as active
        selectLocation({ ...newAddressObj, id: 'guest-' + Date.now() });
      }
      onClose();
    } catch (e) {
      alert('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (e, addr) => {
    e.stopPropagation();
    setEditingId(addr.id);
    setForm({
      flat: addr.flat || '',
      buildingName: addr.buildingName || '',
      landmark: addr.landmark || '',
      label: addr.label || 'Home',
      buildingType: addr.buildingType || 'Society',
      receiverName: addr.receiverName || user?.full_name || '',
      receiverNumber: addr.receiverNumber || user?.phone || '+91 '
    });
    setMapPos({lat: addr.lat, lng: addr.lng});
    setGeocodeData({ area: addr.area || 'Saved Location', display: addr.address });
    setView('form');
  };

  const handleDeleteAddress = (e, id) => {
    e.stopPropagation();
    setAddressToDelete(id);
  };

  const confirmDeleteAddress = async () => {
    if (addressToDelete) {
      await deleteSavedAddress(addressToDelete);
      setAddressToDelete(null);
    }
  };

  const handleSelectSaved = (addr) => {
    selectLocation(addr);
    onClose();
  };

  const renderIcon = (label) => {
    if (label.toLowerCase() === 'home') return <Home size={18} />;
    if (label.toLowerCase() === 'work') return <Briefcase size={18} />;
    return <MapPin size={18} />;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClose ? handleClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Drawer (Right side) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white z-[210] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-white">
              {canClose && (
                <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} className="text-slate-600" />
                </button>
              )}
              <h2 className="text-lg font-bold text-slate-800">
                {view === 'list' && "Select Location"}
                {view === 'map' && "Pinpoint Location"}
                {view === 'form' && "Add Address Details"}
              </h2>
            </div>

            {/* View: List */}
            {view === 'list' && (
              <div className="flex-1 overflow-y-auto p-5">
                {formError && (
                  <div className="text-red-500 text-[13px] font-bold text-center mb-4 bg-red-50 py-2.5 px-4 rounded-xl border border-red-100">
                    {formError}
                  </div>
                )}
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl transition-all text-primary font-semibold mb-6"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
                  <span>Use Current Location</span>
                </button>

                {savedAddresses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Saved Addresses</h3>
                    <div className="space-y-3">
                      {savedAddresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSaved(addr)}
                          className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50 cursor-pointer transition-all group"
                        >
                          <div className="mt-1 text-slate-400">
                            {renderIcon(addr.label)}
                          </div>
                          <div className="flex-1 pr-2">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-800 flex items-center gap-2">
                                {addr.label}
                              </p>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleEditAddress(e, addr)} className="text-slate-400 hover:text-primary transition-colors p-1">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={(e) => handleDeleteAddress(e, addr.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                              {addr.flat ? `${addr.flat}, ` : ''}{addr.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {savedAddresses.length === 0 && user && (
                  <div className="text-center py-10">
                    <Map size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">No saved addresses yet.</p>
                  </div>
                )}
                {!user && (
                  <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-sm text-amber-800 font-medium">Sign in to save multiple addresses for faster checkout.</p>
                  </div>
                )}
              </div>
            )}

            {/* View: Map */}
            {view === 'map' && (
              <div className="flex flex-col flex-1">
                <div className="flex-1 relative bg-slate-100">
                  {mapPos ? (
                    <MapContainer center={mapPos} zoom={16} scrollWheelZoom={true} className="w-full h-full z-0">
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <LocationMarker position={mapPos} setPosition={setMapPos} onPositionChanged={handleMapPinChanged} />
                      <MapUpdater position={mapPos} />
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 size={30} className="animate-spin text-primary" />
                    </div>
                  )}
                  {/* Overlay instructions / Search */}
                  <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-2">
                    <div className="relative shadow-md rounded-xl bg-white flex items-center p-2 border border-slate-100 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <Search size={20} className="text-slate-400 ml-2 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Search a new address" 
                        className="w-full px-3 py-2 bg-transparent focus:outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!e.target.value.trim()) setSearchResults([]);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {isSearching && <Loader2 size={16} className="text-primary animate-spin mr-2 shrink-0" />}
                      <button 
                        onClick={handleSearch}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors shrink-0"
                      >
                        Search
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                       <div className="bg-white rounded-xl shadow-lg border border-slate-100 max-h-60 overflow-y-auto">
                         {searchResults.map(res => (
                           <button 
                             key={res.place_id}
                             onClick={() => selectSearchResult(res)}
                             className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 text-sm flex items-start gap-3 transition-colors"
                           >
                             <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                             <div>
                               <p className="font-semibold text-slate-800">{res.display_name.split(',')[0]}</p>
                               <p className="text-xs text-slate-500 line-clamp-1">{res.display_name}</p>
                             </div>
                           </button>
                         ))}
                       </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-5 border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-[410]">
                  <div className="flex gap-3 mb-4">
                    <MapPin size={24} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-800">{geocodeData.area || 'Selected Location'}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2">{geocodeData.display}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('form')}
                    className="w-full py-3.5 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    Enter complete address
                  </button>
                </div>
              </div>
            )}

            {/* View: Form */}
            {view === 'form' && (
              <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
                <div className="p-4 flex-1">
                  {/* Location Banner */}
                  <div className="bg-white rounded-2xl p-3 flex items-start justify-between border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="bg-emerald-100 p-2.5 rounded-xl shrink-0">
                        <div className="bg-slate-800 p-1.5 rounded-full">
                          <MapPin size={16} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-[15px]">{geocodeData.area || 'Selected Location'}</h4>
                        <p className="text-[13px] text-slate-500 line-clamp-1 mt-0.5">{geocodeData.display}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('map')}
                      className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="bg-white rounded-t-[24px] rounded-b-[16px] border border-slate-200 shadow-sm overflow-hidden pb-4">
                    {/* Save Address as */}
                    <div className="p-5 pb-4 border-b border-dashed border-slate-200">
                      <label className="block text-sm font-bold text-slate-800 mb-3">Save Address as</label>
                      <div className="flex gap-3">
                        {['Home', 'Work', 'Others'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setForm({...form, label: tag})}
                            className={`flex flex-1 items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
                              form.label === tag 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {tag === 'Home' && <Home size={15} />}
                            {tag === 'Work' && <Briefcase size={15} />}
                            {tag === 'Others' && <MapPin size={15} />}
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type of Building */}
                    <div className="p-5 pb-4 border-b border-dashed border-slate-200">
                      <label className="block text-sm font-bold text-slate-800 mb-3">Type of Building</label>
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { id: 'Society', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M12 4v16"/><path d="M4 12h16"/></svg> },
                          { id: 'Independent house', icon: <Home size={15} /> },
                          { id: 'Standalone', icon: <Briefcase size={15} /> }
                        ].map(type => (
                          <button
                            key={type.id}
                            onClick={() => setForm({...form, buildingType: type.id})}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-semibold transition-all ${
                              form.buildingType === type.id 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {type.icon}
                            {type.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Address Inputs */}
                    <div className="p-5 flex flex-col gap-5 border-b border-dashed border-slate-200">
                      <div className="relative mt-2">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-semibold text-slate-400">Flat No. / Floor *</label>
                        <input
                          type="text"
                          value={form.flat}
                          onChange={e => setForm({...form, flat: e.target.value})}
                          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                          placeholder="shopping"
                        />
                      </div>
                      
                      <div className="relative mt-1">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-semibold text-slate-400">Building name *</label>
                        <input
                          type="text"
                          value={form.buildingName}
                          onChange={e => setForm({...form, buildingName: e.target.value})}
                          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-slate-800 transition-all"
                        />
                      </div>

                      <div className="relative mt-1">
                        {!form.landmark && <label className="absolute top-3.5 left-4 text-sm font-semibold text-slate-400 pointer-events-none">Landmark</label>}
                        <input
                          type="text"
                          value={form.landmark}
                          onChange={e => setForm({...form, landmark: e.target.value})}
                          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-slate-800 transition-all"
                        />
                      </div>
                    </div>

                    {/* Receiver Details */}
                    <div className="p-5 pt-2">
                      <div className="border border-slate-200 rounded-[14px] bg-white flex flex-col gap-0 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <div className="relative border-b border-slate-200 px-4 py-2">
                          <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Receiver Name</label>
                          <input
                            type="text"
                            value={form.receiverName}
                            onChange={e => setForm({...form, receiverName: e.target.value})}
                            className="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-800"
                          />
                        </div>
                        <div className="relative px-4 py-2 flex items-center">
                          <div className="flex-1">
                            <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Receiver Number</label>
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-slate-800 pr-1">+91</span>
                              <input
                                type="text"
                                value={form.receiverNumber?.replace('+91', '').trim() || ''}
                                onChange={e => setForm({...form, receiverNumber: '+91 ' + e.target.value})}
                                className="flex-1 bg-transparent focus:outline-none text-sm font-semibold text-slate-800 tracking-wide"
                                maxLength="10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="px-4 py-4 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] rounded-t-[20px] mt-auto z-10 sticky bottom-0">
                  {formError && (
                    <div className="text-red-500 text-[13px] font-bold text-center mb-3 bg-red-50 py-2 rounded-xl border border-red-100">
                      {formError}
                    </div>
                  )}
                  <button
                    onClick={handleSaveAddress}
                    disabled={loading || !form.flat?.trim() || !form.receiverName?.trim() || !form.receiverNumber || form.receiverNumber.replace('+91', '').trim().length < 10}
                    className="w-full py-3.5 bg-slate-100 disabled:bg-[#f1f1f1] disabled:text-[#b8b8b8] disabled:shadow-none text-slate-400 enabled:bg-primary enabled:text-white font-bold rounded-[14px] transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                  >
                    {loading ? <Loader2 size={22} className="animate-spin" /> : 'Save Address'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={!!addressToDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteAddress}
        onCancel={() => setAddressToDelete(null)}
        isDestructive={true}
      />
    </>
  );
};
