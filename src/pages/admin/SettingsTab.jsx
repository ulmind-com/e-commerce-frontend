import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, Loader2, MapPin, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leafet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

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
    <Marker position={position} />
  );
}

export const SettingsTab = ({ token }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [maxDistance, setMaxDistance] = useState(5.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch initial shop location
    axios.get(`${API}/api/settings/shop-location`, {
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
      await axios.put(`${API}/api/settings/shop-location`, {
        lat: position.lat,
        lng: position.lng,
        express_delivery_max_distance: parseFloat(maxDistance)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Shop location saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save shop location.');
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
        alert("Location not found. Please try a different search term.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          alert("Could not get current location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Shop Location</h2>
            <p className="text-sm text-slate-500 mt-1">Set your central warehouse or shop location. This is used to calculate Express Delivery distance.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search location (e.g. New Delhi)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </form>
          
          <button
            onClick={handleCurrentLocation}
            type="button"
            className="px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <Navigation size={16} />
            Use Current Location
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden h-[400px] relative">
          {position ? (
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">Loading Map...</div>
          )}
          
          <div className="absolute bottom-4 left-4 z-[400] bg-white px-4 py-2 rounded-lg shadow-md text-sm font-medium text-slate-700 pointer-events-none">
            Click anywhere on the map to place the marker
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {position && <span>Selected Coordinates: <span className="font-semibold">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span></span>}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Express Delivery Radius</h3>
          <p className="text-sm text-slate-500 mb-4">Set the maximum distance (in kilometers) within which orders will qualify for Express Delivery.</p>
          <div className="flex items-center gap-4 max-w-sm">
            <input 
              type="number" 
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
              min="0"
              step="0.5"
            />
            <span className="font-medium text-slate-600">km</span>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="flex items-center gap-4">
            {message && <span className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</span>}
            <button
              onClick={handleSave}
              disabled={saving || !position}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
