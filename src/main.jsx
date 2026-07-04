import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  </React.StrictMode>,
)
