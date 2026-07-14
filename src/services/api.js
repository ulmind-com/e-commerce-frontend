import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth Interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ─── Admin API Methods ───────────────────────────────────────────────────────
export const adminAPI = {
  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // ── Products ─────────────────────────────────────────────────────────────
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  uploadProductImage: (id, formData) =>
    api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProductImage: (id, imageUrl) =>
    api.delete(`/products/${id}/image`, { params: { image_url: imageUrl } }),

  // ── Categories ───────────────────────────────────────────────────────────
  getCategories: (params) => api.get('/admin/categories', { params }),
  getCategory: (id) => api.get(`/admin/categories/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // ── Brands ───────────────────────────────────────────────────────────────
  getBrands: (params) => api.get('/admin/brands', { params }),
  getBrand: (id) => api.get(`/admin/brands/${id}`),
  createBrand: (data) => api.post('/admin/brands', data),
  updateBrand: (id, data) => api.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/admin/brands/${id}`),

  // ── Orders ───────────────────────────────────────────────────────────────
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  assignDelivery: (id, data) => api.put(`/admin/orders/${id}/assign-delivery`, data),
  cancelOrder: (id) => api.put(`/admin/orders/${id}/cancel`),

  // ── Users ────────────────────────────────────────────────────────────────
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),

  // ── Inventory ────────────────────────────────────────────────────────────
  getInventory: (params) => api.get('/admin/inventory', { params }),
  getInventoryAlerts: () => api.get('/admin/inventory/alerts'),
  updateStock: (id, data) => api.put(`/admin/inventory/${id}/stock`, data),
  adjustStock: (id, data) => api.post(`/admin/inventory/${id}/adjust`, data),

  // ── Customers ────────────────────────────────────────────────────────────
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  getCustomerOrders: (id) => api.get(`/admin/customers/${id}/orders`),
  getCustomerAddresses: (id) => api.get(`/admin/customers/${id}/addresses`),

  // ── Payments ─────────────────────────────────────────────────────────────
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentStats: () => api.get('/admin/payments/stats'),
  refundPayment: (id, data) => api.post(`/admin/payments/${id}/refund`, data),
  getPaymentDetails: (id) => api.get(`/admin/payments/${id}`),

  // ── Returns ──────────────────────────────────────────────────────────────
  getReturns: (params) => api.get('/admin/returns', { params }),
  getReturn: (id) => api.get(`/admin/returns/${id}`),
  approveReturn: (id, data) => api.put(`/admin/returns/${id}/approve`, data),
  rejectReturn: (id, data) => api.put(`/admin/returns/${id}/reject`, data),

  // ── Delivery ─────────────────────────────────────────────────────────────
  getDeliveryZones: (params) => api.get('/admin/delivery/zones', { params }),
  createDeliveryZone: (data) => api.post('/admin/delivery/zones', data),
  updateDeliveryZone: (id, data) => api.put(`/admin/delivery/zones/${id}`, data),
  deleteDeliveryZone: (id) => api.delete(`/admin/delivery/zones/${id}`),
  getTimeSlots: (params) => api.get('/admin/delivery/timeslots', { params }),
  createTimeSlot: (data) => api.post('/admin/delivery/timeslots', data),
  updateTimeSlot: (id, data) => api.put(`/admin/delivery/timeslots/${id}`, data),
  deleteTimeSlot: (id) => api.delete(`/admin/delivery/timeslots/${id}`),
  getDeliveryBoys: (params) => api.get('/admin/delivery/boys', { params }),
  createDeliveryBoy: (data) => api.post('/admin/delivery/boys', data),
  updateDeliveryBoy: (id, data) => api.put(`/admin/delivery/boys/${id}`, data),
  deleteDeliveryBoy: (id) => api.delete(`/admin/delivery/boys/${id}`),

  // ── COD ──────────────────────────────────────────────────────────────────
  getCODSettings: () => api.get('/admin/cod/settings'),
  updateCODSettings: (data) => api.put('/admin/cod/settings', data),
  getCODOrders: (params) => api.get('/admin/cod/orders', { params }),

  // ── Coupons ──────────────────────────────────────────────────────────────
  getCoupons: (params) => api.get('/admin/coupons', { params }),
  getCoupon: (id) => api.get(`/admin/coupons/${id}`),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // ── Banners ──────────────────────────────────────────────────────────────
  getBanners: (params) => api.get('/admin/banners', { params }),
  getBanner: (id) => api.get(`/admin/banners/${id}`),
  createBanner: (data) =>
    api.post('/admin/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),

  // ── CMS ──────────────────────────────────────────────────────────────────
  getCMSPages: (params) => api.get('/admin/cms/pages', { params }),
  getCMSPage: (id) => api.get(`/admin/cms/pages/${id}`),
  createCMSPage: (data) => api.post('/admin/cms/pages', data),
  updateCMSPage: (id, data) => api.put(`/admin/cms/pages/${id}`, data),
  deleteCMSPage: (id) => api.delete(`/admin/cms/pages/${id}`),

  // ── Notifications ────────────────────────────────────────────────────────
  getNotifications: (params) => api.get('/admin/notifications', { params }),
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),

  // ── Reviews ──────────────────────────────────────────────────────────────
  getReviews: (params) => api.get('/admin/reviews', { params }),
  getReview: (id) => api.get(`/admin/reviews/${id}`),
  updateReviewStatus: (id, data) => api.put(`/admin/reviews/${id}/status`, data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // ── Reports ──────────────────────────────────────────────────────────────
  getReports: (params) => api.get('/admin/reports', { params }),
  generateReport: (data) => api.post('/admin/reports/generate', data),
  exportReport: (type, params) =>
    api.get(`/admin/reports/export/${type}`, { params, responseType: 'blob' }),

  // ── Finance ──────────────────────────────────────────────────────────────
  getFinanceOverview: () => api.get('/admin/finance/overview'),
  getExpenses: (params) => api.get('/admin/finance/expenses', { params }),
  createExpense: (data) => api.post('/admin/finance/expenses', data),
  updateExpense: (id, data) => api.put(`/admin/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/finance/expenses/${id}`),
  getGSTReport: (params) => api.get('/admin/finance/gst', { params }),

  // ── Analytics ────────────────────────────────────────────────────────────
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getSalesTrend: (params) => api.get('/admin/analytics/sales-trend', { params }),
  getProductPerformance: (params) => api.get('/admin/analytics/product-performance', { params }),
  getCustomerGrowth: (params) => api.get('/admin/analytics/customer-growth', { params }),

  // ── Staff ────────────────────────────────────────────────────────────────
  getStaff: (params) => api.get('/admin/staff', { params }),
  getStaffMember: (id) => api.get(`/admin/staff/${id}`),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  getRoles: () => api.get('/admin/staff/roles'),

  // ── Suppliers ────────────────────────────────────────────────────────────
  getSuppliers: (params) => api.get('/admin/suppliers', { params }),
  getSupplier: (id) => api.get(`/admin/suppliers/${id}`),
  createSupplier: (data) => api.post('/admin/suppliers', data),
  updateSupplier: (id, data) => api.put(`/admin/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/admin/suppliers/${id}`),
  getPurchaseOrders: (params) => api.get('/admin/suppliers/purchase-orders', { params }),
  createPurchaseOrder: (data) => api.post('/admin/suppliers/purchase-orders', data),

  // ── Audit Logs ───────────────────────────────────────────────────────────
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getAuditLog: (id) => api.get(`/admin/audit-logs/${id}`),

  // ── AI Features ──────────────────────────────────────────────────────────
  getAIForecasts: (params) => api.get('/admin/ai/forecasts', { params }),
  getDemandPredictions: (params) => api.get('/admin/ai/demand-predictions', { params }),
  generateDescription: (data) => api.post('/admin/ai/generate-description', data),
  getAIPricing: (params) => api.get('/admin/ai/pricing', { params }),
  applyAIPricing: (data) => api.post('/admin/ai/pricing/apply', data),

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getStoreInfo: () => api.get('/admin/settings/store'),
  updateStoreInfo: (data) => api.put('/admin/settings/store', data),

  // ── Security ─────────────────────────────────────────────────────────────
  getLoginHistory: (params) => api.get('/admin/security/login-history', { params }),
  getSessions: () => api.get('/admin/security/sessions'),
  terminateSession: (id) => api.delete(`/admin/security/sessions/${id}`),
  getIPWhitelist: () => api.get('/admin/security/ip-whitelist'),
  addIPWhitelist: (data) => api.post('/admin/security/ip-whitelist', data),
  removeIPWhitelist: (ip) => api.delete(`/admin/security/ip-whitelist/${ip}`),
  createBackup: () => api.post('/admin/security/backup'),
  getBackups: () => api.get('/admin/security/backups'),
};

export default api;
