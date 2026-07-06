import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CreditCard, Building2, Smartphone, Wallet, Banknote, Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// Bank data for Netbanking
const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC', color: '#004C8F', letter: 'H' },
  { id: 'kotak', name: 'Kotak', color: '#ED1C24', letter: 'K' },
  { id: 'icici', name: 'ICICI', color: '#F37920', letter: 'I' },
  { id: 'sbi', name: 'SBI', color: '#2F57A4', letter: 'S' },
  { id: 'axis', name: 'Axis', color: '#97144D', letter: 'A' },
];

// Wallet data
const WALLETS = [
  { id: 'paytm', name: 'Paytm', color: '#00BAF2' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F' },
  { id: 'amazonpay', name: 'Amazon Pay', color: '#FF9900' },
  { id: 'mobikwik', name: 'MobiKwik', color: '#E14343' },
];

// Card brand logos (SVG paths)
const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex', 'Discover', 'RuPay'];

// Stripe CardElement styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e293b',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#94a3b8',
      },
      lineHeight: '24px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// Accordion Section Component
const AccordionSection = ({ id, title, icon: Icon, isOpen, onToggle, children, disabled, disabledMessage }) => (
  <div className={`border-b border-slate-100 ${disabled ? 'opacity-50' : ''}`}>
    <button
      onClick={() => !disabled && onToggle(id)}
      className={`w-full flex items-center justify-between px-8 py-5 text-left transition-colors ${
        disabled ? 'cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={isOpen ? 'text-primary' : 'text-slate-400'} />
        <span className={`text-[15px] font-semibold ${isOpen ? 'text-primary' : 'text-slate-800'}`}>{title}</span>
        {disabled && disabledMessage && (
          <span className="text-xs text-slate-400 ml-2">{disabledMessage}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-8 pb-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const PaymentStep = ({ cartItems, total, currentLocation, user, token, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [activeSection, setActiveSection] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  
  const payableAmount = total + 9; // packaging fee
  
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
    };

    const res = await axios.post(`${API}/orders/`, orderPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  // Handle Card Payment (real Stripe)
  const handleCardPayment = async () => {
    if (!stripe || !elements) return;
    
    setProcessing(true);
    try {
      // 1. Create order (gets PaymentIntent)
      const order = await createOrder('ONLINE');
      
      if (!order.stripe_client_secret) {
        alert('Payment setup failed. Please try again.');
        setProcessing(false);
        return;
      }
      
      // 2. Confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        order.stripe_client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: cardName || user?.full_name || 'Customer' },
          },
        }
      );
      
      if (error) {
        alert(error.message);
        setProcessing(false);
        return;
      }
      
      // 3. Verify with backend
      await axios.post(`${API}/orders/verify-payment`, {
        order_id: order._id,
        payment_intent_id: paymentIntent.id,
      });
      
      onSuccess(order._id);
    } catch (err) {
      console.error('Card Payment Error:', err);
      alert(err.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle simulated payment (UPI, Netbanking, Wallets)
  const handleSimulatedPayment = async (methodName) => {
    setProcessing(true);
    try {
      const order = await createOrder('ONLINE');
      
      // Simulate a brief delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await axios.post(`${API}/orders/verify-payment`, {
        order_id: order._id,
        simulated: true,
      });
      
      onSuccess(order._id);
    } catch (err) {
      console.error(`${methodName} Payment Error:`, err);
      alert(err.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
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

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button onClick={onBack} className="text-sm text-primary font-semibold mb-4 hover:underline">← Back to Order Summary</button>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Payment Methods */}
          <div className="lg:col-span-7">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h1>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* WALLETS */}
              <AccordionSection
                id="wallets"
                title="Wallets"
                icon={Wallet}
                isOpen={activeSection === 'wallets'}
                onToggle={toggleSection}
              >
                <div className="grid grid-cols-2 gap-3">
                  {WALLETS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWallet(w.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedWallet === w.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: w.color }}
                      >
                        {w.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{w.name}</span>
                      {selectedWallet === w.id && <CheckCircle2 size={18} className="text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
                {selectedWallet && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSimulatedPayment('Wallet')}
                    disabled={processing}
                    className="mt-5 w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    Pay ₹{payableAmount.toFixed(0)}
                  </motion.button>
                )}
              </AccordionSection>

              {/* CREDIT & DEBIT CARDS */}
              <AccordionSection
                id="cards"
                title="Add credit or debit cards"
                icon={CreditCard}
                isOpen={activeSection === 'cards'}
                onToggle={toggleSection}
              >
                <div className="space-y-4">
                  {/* Card Brand Icons */}
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={18} className="text-primary" />
                    <span className="text-sm font-semibold text-slate-700">Add Debit / Credit / ATM Card</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    {CARD_BRANDS.map(brand => (
                      <div key={brand} className="px-2.5 py-1.5 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                        {brand}
                      </div>
                    ))}
                  </div>
                  
                  {/* Name on Card */}
                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  
                  {/* Stripe CardElement */}
                  <div className="border border-slate-200 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
                    <CardElement
                      options={CARD_ELEMENT_OPTIONS}
                      onChange={(e) => {
                        setCardError(e.error ? e.error.message : null);
                        setCardComplete(e.complete);
                      }}
                    />
                  </div>
                  {cardError && <p className="text-xs text-red-500 mt-1">{cardError}</p>}
                  
                  {/* Test Card Info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                    <span className="text-amber-500 text-lg mt-0.5">💳</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Test Mode Card</p>
                      <p className="text-xs text-amber-700 mt-0.5">Use card number: <span className="font-mono font-bold">4242 4242 4242 4242</span></p>
                      <p className="text-xs text-amber-700">Expiry: any future date | CVV: any 3 digits</p>
                    </div>
                  </div>
                  
                  {/* Pay Button */}
                  <button
                    onClick={handleCardPayment}
                    disabled={processing || !cardComplete}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    {processing ? 'Processing...' : `Pay ₹${payableAmount.toFixed(0)}`}
                  </button>
                  
                  <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                    <Lock size={10} /> Your card details are secured with SSL encryption
                  </p>
                </div>
              </AccordionSection>

              {/* NETBANKING */}
              <AccordionSection
                id="netbanking"
                title="Netbanking"
                icon={Building2}
                isOpen={activeSection === 'netbanking'}
                onToggle={toggleSection}
              >
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {POPULAR_BANKS.map(bank => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedBank === bank.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.letter}
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{bank.name}</span>
                      {selectedBank === bank.id && (
                        <CheckCircle2 size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* All Banks Dropdown */}
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option>All Banks</option>
                  <option>Bank of Baroda</option>
                  <option>Canara Bank</option>
                  <option>Central Bank</option>
                  <option>Federal Bank</option>
                  <option>Indian Bank</option>
                  <option>IndusInd Bank</option>
                  <option>Punjab National Bank</option>
                  <option>Union Bank</option>
                  <option>Yes Bank</option>
                </select>
                
                {selectedBank && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSimulatedPayment('Netbanking')}
                    disabled={processing}
                    className="mt-5 w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    Pay ₹{payableAmount.toFixed(0)}
                  </motion.button>
                )}
              </AccordionSection>

              {/* UPI */}
              <AccordionSection
                id="upi"
                title="UPI"
                icon={Smartphone}
                isOpen={activeSection === 'upi'}
                onToggle={toggleSection}
              >
                <div className="space-y-4">
                  {/* UPI ID Input */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Enter UPI ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 px-4 py-3.5 border border-slate-200 rounded-xl text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  
                  {/* UPI Apps */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3 font-medium">Or pay using UPI apps</p>
                    <div className="flex items-center gap-3">
                      {[
                        { name: 'GPay', color: '#4285F4', letter: 'G' },
                        { name: 'PhonePe', color: '#5F259F', letter: 'P' },
                        { name: 'Paytm', color: '#00BAF2', letter: 'P' },
                        { name: 'Others', color: '#64748b', letter: '...' },
                      ].map(app => (
                        <div key={app.name} className="flex flex-col items-center gap-1.5">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.letter}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSimulatedPayment('UPI')}
                    disabled={processing || !upiId.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    {processing ? 'Verifying...' : `Pay ₹${payableAmount.toFixed(0)}`}
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
              >
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                    <Banknote size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Pay when your order arrives</p>
                      <p className="text-xs text-slate-500 mt-1">Please keep exact change ready for a smooth delivery experience.</p>
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
                  <div className="flex justify-between text-base font-bold border-t border-dashed border-slate-200 pt-3 mt-3">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">₹{payableAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium py-2">
                <Lock size={12} />
                <span>100% Safe & Secure Payment</span>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
