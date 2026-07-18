import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Award, Warehouse,
  ShoppingCart, Users, CreditCard, RotateCcw, Truck,
  Banknote, Ticket, ImageIcon, Bell, FileText,
  Star, BarChart3, IndianRupee, TrendingUp, UserCog,
  Factory, Shield, Sparkles, Settings, Lock, LogOut,
  Menu, X, Bell as BellIcon, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LottieModule from 'lottie-react';
const Lottie = LottieModule.default || LottieModule;

const NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    ]
  },
  {
    title: 'CATALOG',
    items: [
      { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
      { id: 'categories', label: 'Categories', icon: Tag, path: '/admin/categories' },
      { id: 'brands', label: 'Brands', icon: Award, path: '/admin/brands' },
      { id: 'inventory', label: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
    ]
  },
  {
    title: 'SALES',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
      { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
      { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
      { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, path: '/admin/returns' },
    ]
  },
  {
    title: 'DELIVERY',
    items: [
      { id: 'delivery', label: 'Delivery Config', icon: Truck, path: '/admin/delivery' },
      { id: 'cod', label: 'COD Management', icon: Banknote, path: '/admin/cod' },
    ]
  },
  {
    title: 'MARKETING',
    items: [
      { id: 'coupons', label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
      { id: 'banners', label: 'Banners', icon: ImageIcon, path: '/admin/banners' },
      { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    ]
  },
  {
    title: 'CONTENT',
    items: [
      { id: 'cms', label: 'CMS Pages', icon: FileText, path: '/admin/cms' },
      { id: 'reviews', label: 'Reviews', icon: Star, path: '/admin/reviews' },
    ]
  },
  {
    title: 'REPORTS',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
      { id: 'finance', label: 'Finance', icon: IndianRupee, path: '/admin/finance' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'staff', label: 'Staff Management', icon: UserCog, path: '/admin/staff' },
      { id: 'suppliers', label: 'Suppliers', icon: Factory, path: '/admin/suppliers' },
      { id: 'audit', label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs' },
      { id: 'ai', label: 'AI Features', icon: Sparkles, path: '/admin/ai' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
      { id: 'security', label: 'Security', icon: Lock, path: '/admin/security' },
    ]
  }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [lottieData, setLottieData] = useState(null);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load animation data
  useEffect(() => {
    fetch('/lottie/loading.json')
      .then(res => res.json())
      .then(data => setLottieData(data))
      .catch(err => console.error('Error loading lottie:', err));
  }, []);

  // Handle route change loading animation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileOpen]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (user.role !== 'admin') {
        navigate('/'); // redirect customers to home
      }
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  const getPageTitle = () => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  const SidebarContent = ({ isMobile }) => (
    <>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0 relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white font-bold text-lg">O</span>
        </div>
        {(sidebarOpen || isMobile) && (
          <div className="ml-3 flex items-center gap-2 overflow-hidden">
            <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">OneBasket</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary-400">ADMIN</span>
          </div>
        )}
        {isMobile && (
          <button 
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6">
            {(sidebarOpen || isMobile) && (
              <h3 className="px-5 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1 px-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/admin' 
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);
                  
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-xl transition-all group ${
                        isActive 
                          ? 'bg-primary-900/50 text-primary-400 shadow-sm' 
                          : 'hover:bg-slate-800 hover:text-slate-100'
                      }`}
                      title={!sidebarOpen && !isMobile ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-slate-300 transition-colors'}`} />
                      {(sidebarOpen || isMobile) && (
                        <span className="ml-3 text-sm font-semibold whitespace-nowrap">{item.label}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User / Logout */}
      <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900">
        <div className="flex items-center justify-between">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center overflow-hidden mr-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <UserCog className="w-5 h-5 text-slate-400" />
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-white truncate">{user?.email || 'admin@onebasket.com'}</p>
                <p className="text-[11px] font-semibold text-slate-500 truncate uppercase tracking-wider">{user?.role || 'Admin'}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={`p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors ${!sidebarOpen && !isMobile && 'mx-auto'}`}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden">
      
      {/* Mobile Backdrop & Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x < -50 || velocity.x < -500) {
                  setMobileOpen(false);
                }
              }}
              className="fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 w-[280px] flex flex-col shadow-2xl lg:hidden"
            >
              {SidebarContent({ isMobile: true })}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 transition-all duration-300 flex-col shadow-xl border-r border-slate-800
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {SidebarContent({ isMobile: false })}
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-black text-slate-800 truncate max-w-[200px] md:max-w-none">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search command (Ctrl+K)..." 
                className="pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200/50 rounded-full text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all w-64 xl:w-80 outline-none"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-95 border border-white/20">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-slate-50/50 scroll-smooth">
          <AnimatePresence mode="wait">
            {pageLoading && lottieData ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md"
              >
                <div className="w-72 h-72">
                  <Lottie animationData={lottieData} loop={true} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
