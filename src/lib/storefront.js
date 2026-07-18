// ─── Storefront shared constants & helpers ───────────────────────────────────
// Single-vendor storefront (OneBasket). Keep brand + palette consistent across
// all customer-facing pages so every page matches the Home reference design.

// API base — mirrors Home.jsx / services/api.js so pages work in dev & prod.
export const API_URL =
  import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// Brand palette (forest green + amber) — matches Home.jsx hero.
export const BRAND = {
  green: '#0f5132',
  greenDark: '#0c4128',
  amber: '#f59e0b',
};

// OneBasket physical outlets (single vendor, India-based to match ₹ pricing).
export const STORES = [
  {
    id: 1,
    name: 'OneBasket Mega Store — Indiranagar',
    address: '100 Ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    phone: '+91 80 4123 7890',
    hours: '7:00 AM – 11:00 PM',
    open24: false,
    lat: 12.9719,
    lng: 77.6412,
    city: 'Bengaluru',
    tag: 'Flagship',
  },
  {
    id: 2,
    name: 'OneBasket Fresh — Bandra West',
    address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 22 4890 1122',
    hours: '8:00 AM – 10:30 PM',
    open24: false,
    lat: 19.0606,
    lng: 72.8365,
    city: 'Mumbai',
    tag: 'Express',
  },
  {
    id: 3,
    name: 'OneBasket Express — Connaught Place',
    address: 'Block A, Connaught Place, New Delhi, Delhi 110001',
    phone: '+91 11 4567 2200',
    hours: 'Open 24 Hours',
    open24: true,
    lat: 28.6315,
    lng: 77.2167,
    city: 'New Delhi',
    tag: '24/7',
  },
  {
    id: 4,
    name: 'OneBasket Neighbourhood — Salt Lake',
    address: 'Sector V, Salt Lake City, Kolkata, West Bengal 700091',
    phone: '+91 33 4012 6677',
    hours: '7:30 AM – 10:30 PM',
    open24: false,
    lat: 22.5726,
    lng: 88.4339,
    city: 'Kolkata',
    tag: 'Neighbourhood',
  },
];

// Given a store's hours, roughly decide "Open now" for the badge.
export function isStoreOpen(store, now = new Date()) {
  if (store.open24) return true;
  const h = now.getHours();
  // Stores open ~7-8am and close ~10-11pm.
  return h >= 8 && h < 22;
}

// Motion presets shared across pages for a cohesive feel.
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
