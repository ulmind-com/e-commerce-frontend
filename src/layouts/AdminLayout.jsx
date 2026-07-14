import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Award, Warehouse,
  ShoppingCart, Users, CreditCard, RotateCcw, Truck,
  Banknote, Ticket, Image as ImageIcon, Bell, FileText,
  Star, BarChart3, IndianRupee, TrendingUp, UserCog,
  Factory, Shield, Sparkles, Settings, Lock, LogOut,
  Menu, X, ChevronRight, Bell as BellIcon, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          {sidebarOpen && (
            <div className="ml-3 flex items-center gap-2 overflow-hidden">
              <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">OneBasket</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary-400">ADMIN</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="mb-6">
              {sidebarOpen && (
                <h3 className="px-5 mb-2 text-xs font-semibold text-slate-500 tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  // Exact match for dashboard to avoid matching all routes
                  const isActive = item.path === '/admin' 
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.path);
                    
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${
                          isActive 
                            ? 'bg-primary-900/50 text-primary-400' 
                            : 'hover:bg-slate-800 hover:text-slate-100'
                        }`}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                        {sidebarOpen && (
                          <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                        )}
                        {isActive && sidebarOpen && (
                          <ChevronRight className="w-4 h-4 ml-auto text-primary-500" />
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
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center overflow-hidden mr-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4 text-slate-400" />
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-white truncate">{user?.email || 'admin@onebasket.com'}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Admin'}</p>
                </div>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className={`p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors ${!sidebarOpen && 'mx-auto'}`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all w-64"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
