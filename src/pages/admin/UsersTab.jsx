import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, User, Mail, Shield, Bike, Loader2, X, Phone } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com';

export const UsersTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserMap, setSelectedUserMap] = useState(null); // stores user obj for map modal

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

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
      {selectedUserMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUserMap(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Map Locations for {selectedUserMap.full_name}</h3>
              <button onClick={() => setSelectedUserMap(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6">
              {selectedUserMap.saved_addresses?.length > 0 ? (
                <div className="space-y-4">
                  {selectedUserMap.saved_addresses.map((addr, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-primary"/> {addr.label}</div>
                      <div className="text-sm text-slate-600 mt-1">{addr.flat}, {addr.address}</div>
                      <div className="text-xs font-mono text-slate-400 mt-2">Lat: {addr.lat}, Lng: {addr.lng}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-10">No saved addresses for this user.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
