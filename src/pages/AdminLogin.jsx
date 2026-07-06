import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const { login, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in and is an admin, redirect to dashboard
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      // Let the useEffect handle the redirect if it's an admin
      // However, if we await login and check context right after, state might not have updated.
      // We rely on useEffect. But we can also check the role manually here if needed.
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials');
      setLoading(false);
    }
  };

  // If initial auth check is happening, show a sleek loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="text-white animate-spin" size={32} />
      </div>
    );
  }

  // Prevent flash if user is already admin (useEffect will redirect)
  if (user && user.role === 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20 font-medium"
      >
        <ArrowLeft size={18} /> Back to Store
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Sign in with your administrator credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-start gap-2"
              >
                <div className="mt-0.5"><Shield size={14} /></div>
                <p>{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In as Admin'}
            </button>
          </form>

        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8">
          Restricted Area. Authorized personnel only.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
