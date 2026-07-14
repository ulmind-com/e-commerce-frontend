import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, User, Mail, Shield, Bike, Loader2, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leafet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const UsersTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserMap, setSelectedUserMap] = useState(null); // stores user obj for map modal
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedUserMap) {
      setLoadingOrders(true);
      axios.get(`${API}/orders/`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const uOrders = res.data.filter(o => o.user_id === selectedUserMap._id);
          setUserOrders(uOrders);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    } else {
      setUserOrders([]);
    }
  }, [selectedUserMap, token]);

  const mapLocations = React.useMemo(() => {
    if (!selectedUserMap) return [];
    const locations = [];
    
    // Add saved addresses
    if (selectedUserMap.saved_addresses) {
      selectedUserMap.saved_addresses.forEach(addr => {
        if (addr.lat && addr.lng) {
          locations.push({ ...addr, type: 'Saved Address', source: 'profile' });
        }
      });
    }
    
    // Add order locations
    if (userOrders.length > 0) {
      userOrders.forEach(order => {
        if (order.delivery_location?.lat && order.delivery_location?.lng) {
          locations.push({
            ...order.delivery_location,
            type: `Order ${order._id.substring(0, 6)}`,
            source: 'order',
            date: new Date(order.created_at).toLocaleDateString()
          });
        }
      });
    }
    
    return locations;
  }, [selectedUserMap, userOrders]);

  const togglePartnerRole = async (userId, currentRole) => {
    // Currently no endpoint explicitly made to toggle role, assuming we could do it or just simulate
    alert("Role toggling requires a specific endpoint (e.g. PUT /api/admin/users/{id}/role).");
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Saved Addresses</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{u.full_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12}/> {u.email}</div>
                      {u.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={12}/> {u.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'delivery_partner' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role === 'admin' && <Shield size={12} />}
                    {u.role === 'delivery_partner' && <Bike size={12} />}
                    {u.role === 'customer' && <User size={12} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {u.saved_addresses?.length || 0} address(es)
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedUserMap(u)}
                    className="text-primary hover:text-primary-600 text-sm font-semibold flex items-center gap-1 justify-end w-full"
                  >
                    <MapPin size={16} /> View Map
                  </button>
                  {u.role !== 'admin' && (
                     <button onClick={() => togglePartnerRole(u._id, u.role)} className="text-xs text-slate-400 hover:text-amber-600 mt-2 underline">
                       Toggle Partner Role
                     </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
      {selectedUserMap && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" 
          onClick={() => setSelectedUserMap(null)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-white/20 flex flex-col" 
            onClick={e=>e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
                  <MapPin className="text-primary" /> Delivery Locations
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Viewing addresses for {selectedUserMap.full_name}</p>
              </div>
              <button onClick={() => setSelectedUserMap(null)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors rounded-full"><X size={18} /></button>
            </div>
            
            <div className="flex flex-col md:flex-row h-[70vh] max-h-[700px]">
              {/* Sidebar list */}
              <div className="w-full md:w-[35%] border-r border-slate-100 bg-slate-50/50 overflow-y-auto p-5 space-y-4">
                {loadingOrders ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={32} className="animate-spin text-primary opacity-50 mb-4" />
                    <p className="text-sm font-medium">Fetching orders...</p>
                  </div>
                ) : mapLocations.length > 0 ? (
                  mapLocations.map((addr, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity ${addr.source === 'order' ? 'bg-amber-500' : 'bg-primary'}`}></div>
                      <div className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-base">
                        <MapPin size={18} className={addr.source === 'order' ? 'text-amber-500' : 'text-primary'}/> 
                        {addr.label}
                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {addr.type}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 leading-relaxed">{addr.flat}, {addr.address}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-4 tracking-wider flex justify-between">
                        <span>Lat: {addr.lat?.toFixed(5)} • Lng: {addr.lng?.toFixed(5)}</span>
                        {addr.date && <span>{addr.date}</span>}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <MapPin size={48} className="opacity-20 mb-4" />
                    <p className="text-sm font-medium">No locations found</p>
                    <p className="text-xs mt-2 max-w-[200px] text-center">User has no saved addresses and no past orders with coordinates.</p>
                  </div>
                )}
              </div>
              
              {/* Map Area */}
              <div className="w-full md:w-[65%] h-[400px] md:h-full relative bg-slate-100">
                {mapLocations.length > 0 ? (
                  <MapContainer 
                    center={[mapLocations[0].lat, mapLocations[0].lng]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {mapLocations.map((addr, i) => (
                      <Marker key={i} position={[addr.lat, addr.lng]}>
                        <Popup className="custom-popup rounded-xl overflow-hidden shadow-2xl border-0 p-0 m-0">
                          <div className="p-4 min-w-[220px]">
                            <p className="font-extrabold text-slate-800 flex items-center gap-2 mb-2 text-sm border-b border-slate-100 pb-2">
                              <MapPin size={16} className={addr.source === 'order' ? 'text-amber-500' : 'text-primary'}/> 
                              {addr.label}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{addr.flat}, {addr.address}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">
                              Source: {addr.type}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">
                    <div className="text-center">
                      <MapPin size={56} className="mx-auto opacity-20 mb-5" />
                      <p className="font-bold text-lg text-slate-400">Map unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
