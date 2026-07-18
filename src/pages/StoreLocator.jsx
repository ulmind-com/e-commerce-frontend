import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Phone, Clock, Navigation, Search, Store, CheckCircle2 } from 'lucide-react';
import { STORES, isStoreOpen, fadeUp, stagger } from '../lib/storefront';

// Fix Leaflet's default marker icons (same pattern as admin map tabs).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Branded green pin.
const brandIcon = L.divIcon({
  className: '',
  html: `<div style="transform:translate(-50%,-100%)">
    <svg width="34" height="46" viewBox="0 0 24 24" fill="#0f5132" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/>
      <circle cx="12" cy="10" r="2.5" fill="white" stroke="none"/>
    </svg></div>`,
  iconSize: [34, 46],
  iconAnchor: [0, 0],
});

// Recenters the map when a store is selected.
const FlyTo = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.1 });
  }, [center, zoom, map]);
  return null;
};

const StoreLocator = () => {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(STORES[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STORES;
    return STORES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    );
  }, [query]);

  const active = STORES.find((s) => s.id === activeId) || STORES[0];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1b14] via-[#0c4128] to-[#0f5132] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#2dd4bf_0,transparent_40%),radial-gradient(circle_at_85%_80%,#f59e0b_0,transparent_45%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <Store size={14} /> {STORES.length} Stores Nationwide
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-[0.95]">
              Find a <span className="text-emerald-400">OneBasket</span> near you
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg font-medium mb-8">
              Walk into any OneBasket outlet for the freshest picks — or shop online for 10-minute delivery to your door.
            </motion.p>
            {/* Search */}
            <motion.div variants={fadeUp} className="relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, area or store name"
                className="w-full h-13 py-3.5 pl-11 pr-4 rounded-xl bg-white/95 text-slate-800 placeholder-slate-400 font-medium outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── STORE LIST ──────────────────────────────────────────────────── */}
          <div className="w-full lg:w-[38%] flex flex-col gap-4 lg:max-h-[640px] lg:overflow-y-auto scrollbar-hide pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <MapPin size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No stores match "{query}".</p>
              </div>
            ) : (
              filtered.map((store) => {
                const open = isStoreOpen(store);
                const isActive = store.id === activeId;
                return (
                  <motion.button
                    key={store.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    onClick={() => setActiveId(store.id)}
                    className={`text-left bg-white p-5 rounded-2xl border shadow-sm transition-all group ${
                      isActive ? 'border-[#0f5132] ring-2 ring-emerald-100 shadow-md' : 'border-slate-100 hover:border-[#0f5132]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-slate-800 leading-snug group-hover:text-[#0f5132] transition-colors">{store.name}</h3>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wide bg-emerald-50 text-[#0f5132] px-2 py-0.5 rounded-full">{store.tag}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-slate-600 mb-2">
                      <MapPin size={15} className="mt-0.5 text-[#0f5132] shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
                      <Phone size={15} className="text-[#0f5132] shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Clock size={15} className="text-[#0f5132] shrink-0" />
                        <span>{store.hours}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {open ? 'Open now' : 'Closed'}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0f5132] hover:underline"
                    >
                      <Navigation size={15} /> Get Directions
                    </a>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* ─── MAP ─────────────────────────────────────────────────────────── */}
          <div className="w-full lg:w-[62%] rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[440px] lg:h-[640px] relative z-0">
            <MapContainer center={[active.lat, active.lng]} zoom={12} scrollWheelZoom={false} className="w-full h-full min-h-[440px] lg:h-[640px]">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyTo center={[active.lat, active.lng]} zoom={13} />
              {STORES.map((store) => (
                <Marker
                  key={store.id}
                  position={[store.lat, store.lng]}
                  icon={brandIcon}
                  eventHandlers={{ click: () => setActiveId(store.id) }}
                >
                  <Popup>
                    <div className="font-sans">
                      <p className="font-bold text-slate-800 mb-1">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.address}</p>
                      <p className="text-xs text-slate-600 mt-1">{store.hours}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* ─── PERKS ─────────────────────────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Store, title: 'In-store pickup', desc: 'Order online, collect in minutes' },
            { icon: CheckCircle2, title: 'Fresh guarantee', desc: 'Same quality, every outlet' },
            { icon: Navigation, title: '10-min delivery', desc: 'From your nearest store' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0f5132] flex items-center justify-center shrink-0">
                <f.icon size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{f.title}</h4>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
