import React, { useContext, useState, useRef } from 'react';
import { Settings, User, Mail, Shield, Phone, Camera, Loader2, Check } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const ProfileSettings = () => {
  const { user, setUser, token } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API}/auth/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post(`${API}/auth/me/avatar`, fileData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
    } catch (err) {
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const avatar = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=0f766e&color=fff`;

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profile Settings</h1>
      </div>
      
      <div className="p-8 flex-1 bg-slate-50/50">
        <div className="max-w-2xl">
          
          {/* Avatar Section */}
          <div className="mb-8 flex flex-col items-center sm:items-start sm:flex-row gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                {uploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <Loader2 size={28} className="animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-emerald-700 transition-colors border-2 border-white disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="text-center sm:text-left mt-2">
              <h2 className="text-xl font-extrabold text-slate-800">{user?.full_name}</h2>
              <p className="text-slate-500 font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={20} className="text-slate-400" />
                <h2 className="font-extrabold text-slate-800">Personal Information</h2>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-emerald-600 text-sm font-bold hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1.5">Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-bold"
                  />
                ) : (
                  <div className="font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{user?.full_name || 'Not provided'}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1.5">Mobile Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-bold"
                  />
                ) : (
                  <div className="font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-2">
                    {user?.phone ? (
                      <><span>{user.phone}</span><Check size={16} className="text-emerald-500" /></>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1.5">Email Address</label>
                <div className="font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between opacity-70">
                  <span>{user?.email || 'Not provided'}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md flex items-center gap-1">
                    <Shield size={12} /> Verified
                  </span>
                </div>
                {isEditing && <p className="text-xs text-slate-400 mt-2 font-medium">Email address cannot be changed.</p>}
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setFormData({ full_name: user?.full_name || '', phone: user?.phone || '' });
                  setIsEditing(false);
                }}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
