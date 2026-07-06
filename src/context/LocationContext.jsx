import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com';
const STORAGE_KEY = 'onebasket_location';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { user, setUser, token } = useContext(AuthContext);
  
  // Default to null, will check localStorage on mount
  const [currentLocation, setCurrentLocation] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [shopLocation, setShopLocation] = useState(null);
  
  // Fetch and poll shop location
  useEffect(() => {
    const fetchShopLocation = () => {
      axios.get(`${API}/api/settings/shop-location`)
        .then(res => setShopLocation(res.data))
        .catch(err => console.error("Failed to fetch shop location", err));
    };
    fetchShopLocation();
    const intervalId = setInterval(fetchShopLocation, 5000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Load saved addresses when user changes
  useEffect(() => {
    if (user?.saved_addresses) {
      setSavedAddresses(user.saved_addresses);
    } else {
      setSavedAddresses([]);
    }
  }, [user]);

  // Load current location from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCurrentLocation(JSON.parse(saved));
    }
  }, []);

  const selectLocation = (locationObj) => {
    setCurrentLocation(locationObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locationObj));
  };

  const addSavedAddress = async (addressObj) => {
    if (!token) return; // Only logged in users can save permanently
    
    try {
      const response = await axios.post(`${API}/api/auth/me/addresses`, addressObj, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The backend returns the updated user object
      if (response.data?.saved_addresses) {
        setSavedAddresses(response.data.saved_addresses);
        setUser(prev => prev ? { ...prev, saved_addresses: response.data.saved_addresses } : null);
      }
    } catch (err) {
      console.error('Failed to save address', err);
      throw err;
    }
  };

  const editSavedAddress = async (addressId, addressObj) => {
    if (!token) return;
    
    try {
      const response = await axios.put(`${API}/api/auth/me/addresses/${addressId}`, addressObj, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.saved_addresses) {
        setSavedAddresses(response.data.saved_addresses);
        setUser(prev => prev ? { ...prev, saved_addresses: response.data.saved_addresses } : null);
      }
    } catch (err) {
      console.error('Failed to edit address', err);
      throw err;
    }
  };

  const deleteSavedAddress = async (addressId) => {
    if (!token) return;
    try {
      const response = await axios.delete(`${API}/api/auth/me/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.saved_addresses) {
        setSavedAddresses(response.data.saved_addresses);
        setUser(prev => prev ? { ...prev, saved_addresses: response.data.saved_addresses } : null);
      }
      // If we just deleted the currently selected address, fallback to default
      if (currentLocation?.id === addressId) {
         selectLocation({
           id: 'default',
           label: 'Current Location',
           address: 'New Delhi, India',
           lat: 28.6139,
           lng: 77.2090
         });
      }
    } catch (err) {
      console.error('Failed to delete address', err);
      throw err;
    }
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      savedAddresses,
      shopLocation,
      selectLocation,
      addSavedAddress,
      editSavedAddress,
      deleteSavedAddress
    }}>
      {children}
    </LocationContext.Provider>
  );
};
