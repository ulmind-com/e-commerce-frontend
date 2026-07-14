import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, LayoutGrid, LogIn, LogOut, User, ChevronDown, Shield, MapPin, Heart, Search } from 'lucide-react';

import Home from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import ProfileLayout from './layouts/ProfileLayout';
import ProfileOrders from './pages/profile/ProfileOrders';
import ProfileWishlist from './pages/profile/ProfileWishlist';
import ProfileCoupons from './pages/profile/ProfileCoupons';
import ProfileAddresses from './pages/profile/ProfileAddresses';
import ProfileSettings from './pages/profile/ProfileSettings';
import { CartDrawer } from './components/ui/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { LocationDrawer } from './components/LocationDrawer';
import { CartContext } from './context/CartContext';
import { AuthContext } from './context/AuthContext';
import { LocationContext } from './context/LocationContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import BrandsPage from './pages/admin/BrandsPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrdersPage from './pages/admin/OrdersPage';
import CustomersPage from './pages/admin/CustomersPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import DeliveryPage from './pages/admin/DeliveryPage';
import CODPage from './pages/admin/CODPage';
import CouponsPage from './pages/admin/CouponsPage';
import BannersPage from './pages/admin/BannersPage';
import CMSPage from './pages/admin/CMSPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import ReportsPage from './pages/admin/ReportsPage';
import FinancePage from './pages/admin/FinancePage';
import StaffPage from './pages/admin/StaffPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import SettingsPage from './pages/admin/SettingsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AIPage from './pages/admin/AIPage';
import SecurityPage from './pages/admin/SecurityPage';
import { ToastProvider } from './components/admin/Toast';
import PLP from './pages/PLP';
import { PDP } from './pages/PDP';
import Wishlist from './pages/Wishlist';

const LOCATION_KEY = 'onebasket_location';

// ─── Navbar ──────────────────────────────────────────────────────────────────
const Navbar = ({ onCartClick, onAuthClick, onLocationClick }) => {
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { currentLocation } = useContext(LocationContext);
  const { wishlist } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  React.useEffect(() => {
    if (!currentLocation) {
      // Force open location drawer if no location is selected
      onLocationClick();
    }
  }, [currentLocation, onLocationClick]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm h-20 px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">
      
      {/* Left side: Logo & Location */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:border-r border-slate-100 md:pr-6 shrink-0 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="OneBasket" className="h-9 w-9 object-contain" />
          <span className="text-lg font-extrabold tracking-tight text-slate-800 hidden sm:block">
            One<span className="text-primary">Basket</span>
          </span>
        </Link>
        
        {/* Location selector (Blinkit style) */}
        <div 
          onClick={onLocationClick}
          className="hidden md:flex flex-col cursor-pointer group"
        >
          <div className="font-extrabold text-[15px] text-slate-900 leading-tight group-hover:text-primary transition-colors">
            Delivery in 10 minutes
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-1 max-w-[200px]">
            <span className="truncate">
              {currentLocation ? (currentLocation.area || currentLocation.address || currentLocation.label) : 'Select your location'}
            </span>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-900 shrink-0" />
          </div>
        </div>
      </div>

      {/* Middle: Search Bar (Blinkit style) */}
      <div className="flex-1 max-w-3xl hidden sm:block">
        <div className="relative group flex items-center w-full h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-200 focus-within:bg-white focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <div className="grid place-items-center h-full w-12 text-slate-400">
            <Search size={18} />
          </div>
          <input
            className="peer h-full w-full outline-none text-[15px] text-slate-800 pr-4 bg-transparent placeholder-slate-400"
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            placeholder='Search for "curd", "eggs", "bread"'
          />
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-6 shrink-0">
        
        {/* Removed Admin Panel button as per user request */}

        {/* Wishlist - hidden on mobile */}
        <Link to="/wishlist" className="hidden lg:flex items-center gap-2 hover:bg-slate-50 px-2 py-2 rounded-xl transition-colors group">
          <Heart size={20} className="text-primary fill-current group-hover:scale-110 transition-transform" />
          <span className="font-medium text-slate-700 hidden xl:block">Wishlist</span>
          {wishlist?.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-lg">
              {wishlist.length}
            </span>
          )}
        </Link>

        {/* Auth / Login */}
        {user ? (
          <div className="relative group">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors font-medium"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    className="w-full h-full rounded-full object-cover" 
                    alt="avatar" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <User 
                  size={18} 
                  className="text-slate-600" 
                  style={{ display: user.avatar_url ? 'none' : 'block' }} 
                />
              </div>
              <span className="hidden md:block max-w-[100px] truncate text-[15px]">{user.full_name?.split(' ')[0]}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            
            {/* Dropdown menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/profile/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <ShoppingBag size={16} className="text-slate-400" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="text-red-400" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="text-[17px] font-medium text-slate-700 hover:text-slate-900 transition-colors px-2 hidden sm:block"
          >
            Login
          </button>
        )}

        {/* Cart Button (Theme matched) */}
        <button
          onClick={onCartClick}
          className={`flex items-center gap-2 px-3 py-2 md:px-3 md:py-2 rounded-xl font-bold text-white transition-colors shadow-sm ${
            cartCount > 0 
              ? 'bg-primary hover:bg-primary-600' 
              : 'bg-primary hover:bg-primary-600'
          }`}
        >
          <ShoppingBag size={20} className="shrink-0" />
          {cartCount > 0 ? (
            <div className="flex flex-col text-left leading-tight hidden sm:flex font-bold">
              <span className="text-[11px] leading-[10px]">{cartCount} items</span>
              <span className="text-[13px] mt-0.5">₹{cartTotal}</span>
            </div>
          ) : (
            <span className="text-[14px] hidden sm:block font-bold">My Cart</span>
          )}
        </button>

      </div>
    </nav>
  );
};

// ─── Consumer Layout ─────────────────────────────────────────────────────────
const ConsumerLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useContext(AuthContext);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative text-foreground bg-slate-50">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={openAuthModal}
        onLocationClick={() => setIsLocationOpen(true)}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <LocationDrawer isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />

      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ToastProvider>
    <WishlistProvider>
      <Router>
        <Routes>
          {/* Admin Routes (No consumer Navbar/Modals) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="delivery" element={<DeliveryPage />} />
            <Route path="cod" element={<CODPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="cms" element={<CMSPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="ai" element={<AIPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
          
          {/* Consumer Routes */}
          <Route element={<ConsumerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<PLP />} />
            <Route path="/products/:id" element={<PDP />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:orderId/track" element={<OrderTracking />} />
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Profile Section Routes */}
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<ProfileOrders />} />
              <Route path="wishlist" element={<ProfileWishlist />} />
              <Route path="coupons" element={<ProfileCoupons />} />
              <Route path="addresses" element={<ProfileAddresses />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Legacy redirect for old /my-orders link */}
            <Route path="/my-orders" element={<Navigate to="/profile/orders" replace />} />
          </Route>
        </Routes>
      </Router>
    </WishlistProvider>
    </ToastProvider>
  );
}

export default App;
