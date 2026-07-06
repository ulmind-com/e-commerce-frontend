import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await axios.post(`${API}/api/auth/login`, formData);
    const newToken = response.data.access_token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    // Immediately fetch full user profile (includes role)
    const me = await axios.get(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    setUser(me.data);
  };

  const register = async (fullName, email, phone, password) => {
    await axios.post(`${API}/api/auth/register`, {
      full_name: fullName,
      email,
      phone,
      password,
    });
    // Auto-login after registration
    await login(email, password);
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const response = await axios.post(`${API}/api/auth/google`, {
        email: fbUser.email,
        full_name: fbUser.displayName || 'Google User',
        avatar_url: fbUser.photoURL,
        uid: fbUser.uid
      });
      
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      const me = await axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setUser(me.data);
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, loginWithGoogle, register, logout, loading, isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};
