import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Loader2, MapPin, Search, Navigation, Building2, Target, 
  ShieldCheck, Globe, Crosshair, Sparkles, X, Truck, 
  Zap, Gift, CircleDot, Ruler, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom warehouse marker
const warehouseIcon = new L.DivIcon({
  className: 'custom-warehouse-marker',
  html: `<div style="
    width: 44px; height: 44px; 
    background: linear-gradient(135deg, #6366f1, #a855f7); 
    border-radius: 50% 50% 50% 0; 
    transform: rotate(-45deg); 
    border: 3px solid white; 
    box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
    display: flex; align-items: center; justify-content: center;
  ">
    <svg style="transform: rotate(45deg); width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={warehouseIcon} />
  );
}

function MapCenterUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export const WarehouseTab = ({ token }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [maxDistance, setMaxDistance] = useState(5.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [activePanel, setActivePanel] = useState('details'); // 'details' | 'radius'

  const [warehouseDetails, setWarehouseDetails] = useState({
    name: 'Central Hub Fulfillment',
    manager: 'Rajesh Kumar',
    phone: '+91 9876543210',
    capacity: '10,000 sq ft',
    status: 'Active',
    hours: '24/7'
  });

  useEffect(() => {
    axios.get(`${API}/settings/shop-location`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setPosition({ lat: res.data.lat, lng: res.data.lng });
      if (res.data.express_delivery_max_distance !== undefined) {
        setMaxDistance(res.data.express_delivery_max_distance);
      }
    })
    .catch(err => console.error("Failed to fetch shop location", err))
    .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!position) return;
    setSaving(true);
    setMessage('');
    try {
      await axios.put(`${API}/settings/shop-location`, {
        lat: position.lat,
        lng: position.lng,
        express_delivery_max_distance: parseFloat(maxDistance)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('success');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon } = res.data[0];
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("Location not found.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => alert("Could not get current location.")
      );
    }
  };

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
          <p className="text-slate-500 font-bold text-sm">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Hero Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Warehouse Location', 
            value: position ? `${position.lat.toFixed(4)}°, ${position.lng.toFixed(4)}°` : '---',
            sub: 'Lat/Lng Coordinates',
            icon: Globe, 
            gradient: 'from-blue-600 to-cyan-500',
            bg: 'bg-blue-50',
            text: 'text-blue-700'
          },
          { 
            label: 'Free Delivery Zone', 
            value: `${maxDistance} KM`,
            sub: 'Coverage Radius',
            icon: Gift, 
            gradient: 'from-emerald-600 to-green-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700'
          },
          { 
            label: 'Express Delivery', 
            value: `${Math.max(0, maxDistance - 2)} KM`,
            sub: '10 Min Delivery Zone',
            icon: Zap, 
            gradient: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50',
            text: 'text-amber-700'
          },
          { 
            label: 'Status', 
            value: warehouseDetails.status,
            sub: 'All systems operational',
            icon: ShieldCheck, 
            gradient: 'from-indigo-600 to-purple-600',
            bg: 'bg-indigo-50',
            text: 'text-indigo-700'
          },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-50 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none group-hover:from-slate-100 transition-colors"></div>
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                <stat.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</p>
                <p className="font-extrabold text-slate-800 text-sm mt-0.5 truncate">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Layout: Map + Config Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Map Section — 3/5 width on lg */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col"
          style={{ minHeight: '540px' }}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 flex gap-2 bg-gradient-to-r from-slate-50/50 to-white">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for any address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none shadow-sm bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Find
              </button>
            </form>
            <button
              onClick={handleCurrentLocation}
              type="button"
              className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200/60 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shrink-0"
              title="Use GPS"
            >
              <Navigation size={14} />
            </button>
            <button
              onClick={() => setShowFullMap(true)}
              type="button"
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
              title="Full Screen Map"
            >
              <Crosshair size={14} />
            </button>
          </div>

          {/* Map */}
          <div className="flex-1 relative" style={{ minHeight: '460px' }}>
            {position ? (
              <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Standard">
                    <TileLayer
                      attribution='&copy; CARTO'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                      attribution='&copy; Esri'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Dark">
                    <TileLayer
                      attribution='&copy; CARTO'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                
                <LocationMarker position={position} setPosition={setPosition} />
                
                {/* Free Delivery Radius — outer */}
                <Circle 
                  center={position} 
                  pathOptions={{ 
                    color: '#22c55e', 
                    fillColor: '#22c55e', 
                    fillOpacity: 0.06, 
                    weight: 2.5, 
                    dashArray: '10 6' 
                  }} 
                  radius={parseFloat(maxDistance) * 1000}
                />
                
                {/* Express Delivery Radius — inner */}
                <Circle 
                  center={position} 
                  pathOptions={{ 
                    color: '#6366f1', 
                    fillColor: '#6366f1', 
                    fillOpacity: 0.08, 
                    weight: 2, 
                    dashArray: '6 4' 
                  }} 
                  radius={Math.max(0, (parseFloat(maxDistance) - 2)) * 1000}
                />
              </MapContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                <MapPin size={48} className="mb-4 opacity-50" />
                <p className="font-medium">Map is loading...</p>
              </div>
            )}
            
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl text-xs font-bold pointer-events-none border border-slate-200/50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                <span className="text-slate-600">Free Delivery Zone ({maxDistance} KM)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></div>
                <span className="text-slate-600">Express 10-Min Zone ({Math.max(0, maxDistance - 2)} KM)</span>
              </div>
            </div>

            {/* Floating instruction */}
            <div className="absolute bottom-4 right-4 z-[400] bg-slate-900/85 backdrop-blur-lg text-white px-4 py-2 rounded-full shadow-2xl text-[11px] font-bold pointer-events-none flex items-center gap-2 border border-white/10">
              <Crosshair size={13} className="text-indigo-400" />
              Click map to set location
            </div>
          </div>
        </motion.div>

        {/* Config Panel — 2/5 width on lg */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-4"
        >
          
          {/* Inline sub-tabs */}
          <div className="bg-slate-100 rounded-2xl p-1 flex gap-1">
            {[
              { id: 'details', label: 'Warehouse Details', icon: Building2 },
              { id: 'radius', label: 'Delivery Radius', icon: Target },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activePanel === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <AnimatePresence mode="wait">
            {activePanel === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800">Primary Warehouse</h3>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                        <ShieldCheck size={9} /> Operational
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Warehouse Name</label>
                    <input 
                      type="text" 
                      value={warehouseDetails.name}
                      onChange={(e) => setWarehouseDetails({...warehouseDetails, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Manager</label>
                      <input 
                        type="text" 
                        value={warehouseDetails.manager}
                        onChange={(e) => setWarehouseDetails({...warehouseDetails, manager: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Contact</label>
                      <input 
                        type="text" 
                        value={warehouseDetails.phone}
                        onChange={(e) => setWarehouseDetails({...warehouseDetails, phone: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Capacity</label>
                      <input 
                        type="text" 
                        value={warehouseDetails.capacity}
                        onChange={(e) => setWarehouseDetails({...warehouseDetails, capacity: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Hours</label>
                      <input 
                        type="text" 
                        value={warehouseDetails.hours}
                        onChange={(e) => setWarehouseDetails({...warehouseDetails, hours: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">GPS Coordinates</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Latitude</p>
                        <p className="font-mono font-extrabold text-slate-800 text-sm mt-1">{position ? position.lat.toFixed(6) : '---'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Longitude</p>
                        <p className="font-mono font-extrabold text-slate-800 text-sm mt-1">{position ? position.lng.toFixed(6) : '---'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="radius"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Free Delivery Radius */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                        <Gift size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800">Free Delivery Zone</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Orders inside this zone = free delivery</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        step="0.5"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(e.target.value)}
                        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        style={{ accentColor: '#22c55e' }}
                      />
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center min-w-[80px]">
                        <span className="text-2xl font-black text-emerald-700">{maxDistance}</span>
                        <span className="text-xs font-bold text-emerald-500 ml-1">KM</span>
                      </div>
                    </div>
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                      <div className="flex items-start gap-2">
                        <Truck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                          All users within <strong>{maxDistance} KM</strong> of your warehouse will receive <strong>FREE delivery</strong> on their orders. Users outside this zone pay standard delivery charges.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Express Delivery Zone */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800">Express 10-Min Zone</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ultra-fast delivery for nearby users</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-700">Auto-calculated radius</span>
                        <span className="text-lg font-black text-indigo-700">{Math.max(0, maxDistance - 2)} KM</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                          Users within <strong>{Math.max(0, maxDistance - 2)} KM</strong> qualify for 10-minute express delivery. This is auto-set to 2 KM less than the free delivery radius.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Rules Summary */}
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Rules Summary</h4>
                  {[
                    { icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50', label: `0 — ${Math.max(0, maxDistance - 2)} KM`, desc: 'Express 10-min + Free Delivery' },
                    { icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-50', label: `${Math.max(0, maxDistance - 2)} — ${maxDistance} KM`, desc: 'Free Delivery (Standard Slots)' },
                    { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: `${maxDistance}+ KM`, desc: 'Paid Delivery / No Service' },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${rule.bg} flex items-center justify-center shrink-0`}>
                        <rule.icon size={14} className={rule.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-700">{rule.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleSave}
            disabled={saving || !position}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:shadow-none text-sm"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save All Configuration
          </motion.button>

          {/* Success/Error Toast */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${
                  message === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {message === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <div>
                  <p className="text-sm font-bold">
                    {message === 'success' ? 'Configuration Saved!' : 'Failed to Save'}
                  </p>
                  <p className="text-[11px] font-medium opacity-70 mt-0.5">
                    {message === 'success' 
                      ? 'Warehouse location and delivery zones updated successfully.' 
                      : 'Please try again or check your connection.'
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full Screen Map Modal */}
      <AnimatePresence>
        {showFullMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFullMap(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="w-full max-w-7xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Full Map — Click to set warehouse location</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Green = Free Delivery · Purple = Express 10-Min</p>
                  </div>
                </div>
                <button onClick={() => setShowFullMap(false)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors rounded-full">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 relative">
                {position ? (
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                      attribution='&copy; CARTO'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                    <Circle 
                      center={position} 
                      pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.06, weight: 2.5, dashArray: '10 6' }} 
                      radius={parseFloat(maxDistance) * 1000}
                    />
                    <Circle 
                      center={position} 
                      pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.08, weight: 2, dashArray: '6 4' }} 
                      radius={Math.max(0, (parseFloat(maxDistance) - 2)) * 1000}
                    />
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
                    <MapPin size={48} className="opacity-30" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
