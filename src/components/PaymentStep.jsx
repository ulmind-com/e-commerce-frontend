import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CreditCard, Building2, Smartphone, Wallet, Banknote, Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SGtvYHFtIRGg0G';

// Load Razorpay checkout script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Accordion Section Component
const AccordionSection = ({ id, title, icon: Icon, isOpen, onToggle, children, badge, disabled, disabledReason }) => (
  <div className={`border-b border-slate-100 last:border-0 ${disabled ? 'opacity-70 bg-slate-50' : ''}`}>
    <button
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled}
      className={`w-full flex flex-col px-6 sm:px-8 py-5 text-left transition-colors ${!disabled ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon size={20} className={isOpen ? 'text-primary' : 'text-slate-400'} />
          <span className={`text-[15px] font-semibold ${isOpen ? 'text-primary' : 'text-slate-800'}`}>{title}</span>
          {badge && !disabled && (
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{badge}</span>
          )}
        </div>
        {!disabled && (isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />)}
      </div>
      {disabled && disabledReason && (
        <div className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1.5 ml-8">
          <AlertCircle size={14} /> {disabledReason}
        </div>
      )}
    </button>
    <AnimatePresence>
      {isOpen && !disabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 sm:px-8 pb-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const PaymentStep = ({ cartItems, total, currentLocation, user, token, gstDetails, onSuccess, onBack }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  
  // Payment Config State
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [codStatus, setCodStatus] = useState({ allowed: true, reason: '' });

  const payableAmount = total + 9 + (paymentConfig?.cod_surcharge || 0);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings/payments`);
      const config = res.data;
      setPaymentConfig(config);
      
      // Evaluate COD rules
      if (!config.cod_enabled) {
        setCodStatus({ allowed: false, reason: 'Cash on Delivery is currently disabled by Admin.' });
        return;
      }

      if (total < config.cod_min_order) {
        setCodStatus({ allowed: false, reason: `Minimum order value for COD is ₹${config.cod_min_order}.` });
        return;
      }

      if (total > config.cod_max_order) {
        setCodStatus({ allowed: false, reason: `Maximum order value for COD is ₹${config.cod_max_order}.` });
        return;
      }

      // Time check
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
      
      if (currentTimeStr < config.cod_start_time || currentTimeStr > config.cod_end_time) {
        setCodStatus({ allowed: false, reason: `COD is only available between ${config.cod_start_time} and ${config.cod_end_time}.` });
        return;
      }

      setCodStatus({ allowed: true, reason: '' });

    } catch (e) {
      console.error('Failed to fetch payment config', e);
      // Fallback to true if network fails
      setCodStatus({ allowed: true, reason: '' });
    }
  };

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  // Create order in backend
  const createOrder = async (paymentMode = 'ONLINE') => {
    const orderPayload = {
      items: cartItems.map((item) => ({
        product_id: item._id || item.id,
        title: item.title,
        image_url: item.imageUrls?.[0] || item.image_urls?.[0],
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
      total_amount: total,
      payment_mode: paymentMode,
      delivery_location: currentLocation,
      gst_details: gstDetails || null,
    };

    const res = await axios.post(`${API}/orders/`, orderPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  // Open Razorpay Checkout with a specific prefill method
  const openRazorpay = async (prefillMethod) => {
    setProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Failed to load Razorpay. Please refresh and try again.'); setProcessing(false); return; }

      // Create order in backend (which creates Razorpay order)
      const order = await createOrder('ONLINE');

      if (!order.razorpay_order_id) {
        alert('Could not create payment order. Please try again.');
        setProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(payableAmount * 100),
        currency: 'INR',
        name: 'OneBasket',
        description: `Order #${order._id}`,
        order_id: order.razorpay_order_id,
        handler: async (response) => {
          // Verify payment with backend
          try {
            await axios.post(`${API}/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order._id,
            });
            onSuccess(order._id);
          } catch (err) {
            console.error('Verification failed:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: prefillMethod === 'netbanking' ? 'Pay using Netbanking' :
                      prefillMethod === 'upi' ? 'Pay using UPI' :
                      prefillMethod === 'wallet' ? 'Pay using Wallet' :
                      'Pay using Card',
                instruments: prefillMethod === 'netbanking' ? [{ method: 'netbanking' }] :
                             prefillMethod === 'upi' ? [{ method: 'upi' }] :
                             prefillMethod === 'wallet' ? [{ method: 'wallet' }] :
                             [{ method: 'card' }],
              },
            },
            sequence: ['block.banks'],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: '#0f766e' },
        modal: {
          ondismiss: () => setProcessing(false),
          confirm_close: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        alert(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Payment Error:', err);
      alert(err.response?.data?.detail || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  // Handle COD
  const handleCOD = async () => {
    setProcessing(true);
    try {
      const order = await createOrder('COD');
      onSuccess(order._id);
    } catch (err) {
      console.error('COD Error:', err);
      alert(err.response?.data?.detail || 'Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Wallet data
  const WALLETS = [
    { id: 'paytm', name: 'Paytm', color: '#00BAF2' },
    { id: 'phonepe', name: 'PhonePe', color: '#5F259F' },
    { id: 'amazonpay', name: 'Amazon Pay', color: '#FF9900' },
    { id: 'freecharge', name: 'Freecharge', color: '#14C38E' },
  ];

  const BANKS = [
    { id: 'hdfc', name: 'HDFC', color: '#004C8F', letter: 'H' },
    { id: 'kotak', name: 'Kotak', color: '#ED1C24', letter: 'K' },
    { id: 'icici', name: 'ICICI', color: '#F37920', letter: 'I' },
    { id: 'sbi', name: 'SBI', color: '#2F57A4', letter: 'S' },
    { id: 'axis', name: 'Axis', color: '#97144D', letter: 'A' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button onClick={onBack} className="text-sm text-primary font-semibold mb-4 hover:underline flex items-center gap-1">
          ← Back to Order Summary
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Payment Methods */}
          <div className="lg:col-span-7">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h1>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* WALLETS */}
              <AccordionSection id="wallets" title="Wallets" icon={Wallet} isOpen={activeSection === 'wallets'} onToggle={toggleSection}>
                <div className="grid grid-cols-2 gap-3">
                  {WALLETS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWallet(w.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedWallet === w.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: w.color }}>
                        {w.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{w.name}</span>
                      {selectedWallet === w.id && <CheckCircle2 size={18} className="text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
                {selectedWallet && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => openRazorpay('wallet')}
                    disabled={processing}
                    className="mt-5 w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    Pay ₹{payableAmount.toFixed(0)}
                  </motion.button>
                )}
              </AccordionSection>

              {/* CREDIT & DEBIT CARDS */}
              <AccordionSection id="cards" title="Add credit or debit cards" icon={CreditCard} isOpen={activeSection === 'cards'} onToggle={toggleSection}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={18} className="text-primary" />
                    <span className="text-sm font-semibold text-slate-700">Add Debit / Credit / ATM Card</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {['VISA', 'Mastercard', 'RuPay', 'Amex', 'Diners'].map(brand => (
                      <div key={brand} className="px-2.5 py-1.5 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                        {brand}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">We accept Credit and Debit Cards from Visa, Mastercard, American Express, Diners & RuPay.</p>

                  <button
                    onClick={() => openRazorpay('card')}
                    disabled={processing}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={16} />}
                    {processing ? 'Processing...' : `Pay with Card • ₹${payableAmount.toFixed(0)}`}
                  </button>

                  <div className="flex items-center gap-2 justify-center">
                    <Lock size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-400">Secured by Razorpay with 256-bit SSL encryption</span>
                  </div>
                </div>
              </AccordionSection>

              {/* NETBANKING */}
              <AccordionSection id="netbanking" title="Netbanking" icon={Building2} isOpen={activeSection === 'netbanking'} onToggle={toggleSection}>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {BANKS.map(bank => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedBank === bank.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: bank.color }}>
                        {bank.letter}
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{bank.name}</span>
                      {selectedBank === bank.id && <CheckCircle2 size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4">
                  <option>All Banks</option>
                  <option>Bank of Baroda</option>
                  <option>Canara Bank</option>
                  <option>Federal Bank</option>
                  <option>IndusInd Bank</option>
                  <option>Punjab National Bank</option>
                  <option>Union Bank</option>
                  <option>Yes Bank</option>
                </select>
                {selectedBank && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => openRazorpay('netbanking')}
                    disabled={processing}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    Pay ₹{payableAmount.toFixed(0)}
                  </motion.button>
                )}
              </AccordionSection>

              {/* UPI */}
              <AccordionSection id="upi" title="UPI" icon={Smartphone} isOpen={activeSection === 'upi'} onToggle={toggleSection} badge="Popular">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-3 font-medium">Pay using UPI apps</p>
                    <div className="flex items-center gap-4 mb-4">
                      {[
                        { name: 'GPay', color: '#4285F4', letter: 'G' },
                        { name: 'PhonePe', color: '#5F259F', letter: 'P' },
                        { name: 'Paytm', color: '#00BAF2', letter: 'P' },
                        { name: 'Others', color: '#64748b', letter: '...' },
                      ].map(app => (
                        <div key={app.name} className="flex flex-col items-center gap-1.5">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: app.color }}>
                            {app.letter}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => openRazorpay('upi')}
                    disabled={processing}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Smartphone size={16} />}
                    {processing ? 'Opening UPI...' : `Pay with UPI • ₹${payableAmount.toFixed(0)}`}
                  </button>
                </div>
              </AccordionSection>

              {/* CASH ON DELIVERY */}
              <AccordionSection 
                id="cod" 
                title="Cash on Delivery" 
                icon={Banknote} 
                isOpen={activeSection === 'cod'} 
                onToggle={toggleSection}
                disabled={!codStatus.allowed}
                disabledReason={codStatus.reason}
              >
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                    <Banknote size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Pay when your order arrives</p>
                      <p className="text-xs text-slate-500 mt-1">Please keep exact change ready for a smooth delivery experience.</p>
                      {paymentConfig?.cod_surcharge > 0 && (
                        <p className="text-xs font-bold text-amber-600 mt-2">A Cash Handling Fee of ₹{paymentConfig.cod_surcharge} will be added.</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleCOD}
                    disabled={processing}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-800/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Banknote size={16} />}
                    Place Order • ₹{payableAmount.toFixed(0)}
                  </button>
                </div>
              </AccordionSection>

            </div>
          </div>

          {/* RIGHT: Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-2">Delivery Address</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">{currentLocation?.label || 'Home'}: </span>
                  {user?.full_name || 'Customer'}
                  {currentLocation?.flat && `, ${currentLocation.flat}`}
                  {currentLocation?.address && `, ${currentLocation.address}`}
                </p>
              </div>

              {/* Cart Items */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">My Cart</h3>
                  <span className="text-sm text-slate-500 font-medium">{cartItems.reduce((s, i) => s + i.quantity, 0)} items</span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <span className="absolute -top-1.5 -left-1.5 bg-slate-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-10">
                          {item.quantity}
                        </span>
                        <div className="w-14 h-14 rounded-xl border border-slate-100 overflow-hidden bg-white flex items-center justify-center">
                          {(item.image_urls?.[0] || item.imageUrls?.[0]) ? (
                            <img src={item.image_urls?.[0] || item.imageUrls?.[0]} alt={item.title} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-slate-300 text-2xl">🛒</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate font-medium">{item.title}</p>
                        <p className="text-sm font-bold text-slate-900">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-700 font-medium">₹{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Packaging</span>
                    <span className="text-slate-700 font-medium">₹9</span>
                  </div>
                  {activeSection === 'cod' && paymentConfig?.cod_surcharge > 0 && (
                    <div className="flex justify-between text-sm text-amber-600 font-medium">
                      <span>COD Handling Fee</span>
                      <span>₹{paymentConfig.cod_surcharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-dashed border-slate-200 pt-3 mt-3">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">
                      ₹{activeSection === 'cod' && paymentConfig?.cod_surcharge 
                          ? (payableAmount + paymentConfig.cod_surcharge).toFixed(0) 
                          : payableAmount.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium py-2">
                <Lock size={12} />
                <span>100% Safe & Secure Payment • Powered by Razorpay</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentStep;

