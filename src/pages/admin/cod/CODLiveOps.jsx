import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Map, Navigation, Banknote, User, CheckCircle, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const CODLiveOps = ({ token }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(`${API}/cod/collections`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCollections(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [token]);

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Collection Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-500">
                <Banknote size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Collection Management</h3>
                <p className="text-slate-500 text-sm font-medium">Live cash tracking for active agents.</p>
              </div>
            </div>
            <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
              Daily Settlement
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : (
            <div className="space-y-4">
              {collections.map((col, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black border border-slate-200">
                      {col.agent.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800">{col.agent}</h4>
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1"><Map size={12}/> {col.zone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Collected</p>
                      <p className="font-black text-emerald-600">₹{col.collected.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending</p>
                      <p className="font-black text-amber-500">₹{col.pending.toLocaleString()}</p>
                    </div>
                    <div className="w-24 text-right">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                        col.status === 'Deposited' ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {col.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Delivery Map summary */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Live COD Map</h3>
              <p className="text-slate-500 text-sm font-medium">Real-time tracking.</p>
            </div>
          </div>

          <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-center min-h-[250px]">
             {/* Simulated map background */}
             <div className="absolute inset-0 opacity-30" style={{ 
                backgroundImage: 'radial-gradient(circle at 25% 25%, #d1d5db 1px, transparent 1px), radial-gradient(circle at 75% 75%, #d1d5db 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
              
              <div className="text-center relative z-10">
                <Navigation size={48} className="text-blue-400 mx-auto mb-2 opacity-50" />
                <p className="text-slate-500 font-bold text-sm">3 Active COD Routes</p>
              </div>

              {/* Animated dots */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full border border-white shadow-lg animate-pulse"></div>
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-blue-500 rounded-full border border-white shadow-lg animate-pulse"></div>
              <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-blue-500 rounded-full border border-white shadow-lg animate-pulse"></div>
          </div>
          
          <button className="mt-4 w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors">
            Open Full Map View
          </button>
        </div>

      </div>

    </div>
  );
};
