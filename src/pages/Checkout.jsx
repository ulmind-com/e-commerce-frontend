import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, CheckCircle2, ChevronRight, ShoppingBag, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import { LocationDrawer } from '../components/LocationDrawer';

const API = 'http://localhost:8000';

const PAYMENT_MODES = [
  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵' },
  { id: 'ONLINE', label: 'Online Payment', sub: 'UPI, Card, Net Banking via Razorpay', icon: '💳' },
];

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

// Dynamically load Razorpay checkout script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const Checkout = () => {
  const navigate = useNavigate();
  // 1: Address, 2: Order Summary, 3: Payment, 4: Success
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('ONLINE');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { cartItems, getCartTotal, clearCart, addToCart, removeFromCart } = useContext(CartContext);
  const { token, user, openAuthModal } = useContext(AuthContext);
  const { savedAddresses, currentLocation, selectLocation, shopLocation } = useContext(LocationContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const total = getCartTotal();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Mocking MRP by adding 15% to all prices
  const mrpTotal = cartItems.reduce((sum, item) => sum + (item.price * 1.15) * item.quantity, 0);
  const discountTotal = mrpTotal - total;
  const deliveryFee = 40;
  const deliveryDiscount = 40;

  const handlePlaceOrder = async () => {
    if (!token) {
      openAuthModal();
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product_id: item._id || item.id,
          title: item.title,
          image_url: item.imageUrls?.[0] || item.image_urls?.[0],
          quantity: item.quantity,
          price_at_purchase: item.price,
        })),
        total_amount: total,
        payment_mode: selectedPayment,
        delivery_location: currentLocation,
      };

      const res = await axios.post(`${API}/api/orders/`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const createdOrder = res.data;

      if (selectedPayment === 'ONLINE' && createdOrder.razorpay_order_id) {
        const loaded = await loadRazorpay();
        if (!loaded) { alert('Failed to load payment gateway. Please try again.'); setPlacingOrder(false); return; }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: Math.round(total * 100), // paise
          currency: 'INR',
          name: 'OneBasket',
          description: `Order #${createdOrder._id}`,
          order_id: createdOrder.razorpay_order_id,
          handler: async (response) => {
            await axios.post(`${API}/api/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            setOrderId(createdOrder._id);
            setCurrentStep(4);
          },
          prefill: { name: user?.full_name, email: user?.email },
          theme: { color: '#2874f0' },
          modal: { ondismiss: () => setPlacingOrder(false) },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      clearCart();
      setOrderId(createdOrder._id);
      setCurrentStep(4);
    } catch (err) {
      console.error('Order failed:', err);
      alert(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const isOrderSuccess = currentStep === 4;

  if (isOrderSuccess) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-2 text-slate-800">Order Placed! 🎉</h2>
        <p className="text-slate-500 mb-2">Thank you for shopping with us.</p>
        {orderId && (
          <p className="text-sm font-mono bg-slate-100 px-4 py-2 rounded-lg text-slate-600 mb-8 border border-slate-200">
            Order ID: {orderId}
          </p>
        )}
        <div className="flex gap-3">
          {orderId && (
            <button
              onClick={() => navigate(`/orders/${orderId}/track`)}
              className="bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-md font-bold transition-all shadow-sm"
            >
              Track Order
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-md font-semibold transition-all shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 max-w-6xl mx-auto pb-24 bg-slate-50">
      
      {/* Top Stepper */}
      <div className="max-w-3xl mx-auto mb-8 bg-white border border-slate-200 rounded-sm shadow-sm py-4 px-8 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-24 right-24 h-[2px] bg-slate-200 -z-10 -translate-y-1/2" />
        <div className="absolute top-1/2 left-24 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: currentStep > 1 ? (currentStep === 3 ? 'calc(100% - 12rem)' : '50%') : '0%' }} />

        <div className="flex flex-col items-center gap-2 bg-white px-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
            {currentStep > 1 ? <Check size={16} /> : '1'}
          </div>
          <span className={`text-sm ${currentStep >= 1 ? 'text-primary font-medium' : 'text-slate-500'}`}>Address</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-white px-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
            {currentStep > 2 ? <Check size={16} /> : '2'}
          </div>
          <span className={`text-sm ${currentStep >= 2 ? 'text-primary font-medium' : 'text-slate-500'}`}>Order Summary</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-white px-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
            3
          </div>
          <span className={`text-sm ${currentStep >= 3 ? 'text-primary font-medium' : 'text-slate-500'}`}>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Accordion Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* STEP 1: ADDRESS */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
            {/* Header */}
            <div className={`px-6 py-4 flex justify-between items-center ${currentStep === 1 ? 'bg-primary text-white' : 'text-slate-800'}`}>
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${currentStep === 1 ? 'bg-white text-primary' : 'bg-slate-200 text-slate-500'}`}>1</span>
                Delivery Address
              </h2>
              {currentStep > 1 && (
                <button onClick={() => setCurrentStep(1)} className="text-primary text-sm font-semibold hover:underline border px-4 py-1 rounded-sm border-slate-300">Change</button>
              )}
            </div>
            
            {/* Content (Active) */}
            {currentStep === 1 && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800">Select an address</h3>
                  <button onClick={() => setIsDrawerOpen(true)} className="text-primary font-semibold text-sm">+ ADD A NEW ADDRESS</button>
                </div>
                
                <div className="space-y-4">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => selectLocation(addr)}
                      className={`border p-4 rounded-sm cursor-pointer transition-all ${
                        currentLocation?.id === addr.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${currentLocation?.id === addr.id ? 'border-primary' : 'border-slate-300'}`}>
                            {currentLocation?.id === addr.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-slate-800">{user?.full_name || 'Customer'}</span>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm font-medium">{addr.label}</span>
                            <span className="font-semibold text-slate-800 ml-4">{user?.phone || '8092681269'}</span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {addr.flat ? `${addr.flat}, ` : ''}{addr.address}
                          </p>
                          {currentLocation?.id === addr.id && (
                            <button 
                              onClick={() => setCurrentStep(2)}
                              className="mt-4 bg-primary text-white px-8 py-3 rounded-sm font-semibold uppercase text-sm shadow-sm hover:shadow-md"
                            >
                              Deliver Here
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Current Location (if not in saved) */}
                  {currentLocation && !savedAddresses.find(a => a.id === currentLocation.id) && (
                    <div className="border border-primary bg-primary/5 p-4 rounded-sm">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-slate-800">{user?.full_name || 'Customer'}</span>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm font-medium">{currentLocation.label}</span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {currentLocation.flat ? `${currentLocation.flat}, ` : ''}{currentLocation.address}
                          </p>
                          <button 
                            onClick={() => setCurrentStep(2)}
                            className="mt-4 bg-primary text-white px-8 py-3 rounded-sm font-semibold uppercase text-sm shadow-sm hover:shadow-md"
                          >
                            Deliver Here
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Content (Collapsed Summary) */}
            {currentStep > 1 && currentLocation && (
              <div className="px-14 py-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-800">{user?.full_name || 'Customer'}</span> 
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm font-medium mx-2">{currentLocation.label}</span>
                <span className="text-slate-500 mx-2">|</span>
                <span className="text-slate-700">{currentLocation.flat ? `${currentLocation.flat}, ` : ''}{currentLocation.address}</span> 
                <span className="text-slate-500 mx-2">|</span>
                <span className="font-semibold text-slate-800">{user?.phone || '8092681269'}</span>
              </div>
            )}
          </div>

          {/* STEP 2: ORDER SUMMARY */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
            {/* Header */}
            <div className={`px-6 py-4 flex justify-between items-center ${currentStep === 2 ? 'bg-primary text-white' : 'text-slate-800'}`}>
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${currentStep === 2 ? 'bg-white text-primary' : 'bg-slate-200 text-slate-500'}`}>2</span>
                Order Summary
              </h2>
              {currentStep > 2 && (
                <button onClick={() => setCurrentStep(2)} className="text-primary text-sm font-semibold hover:underline border px-4 py-1 rounded-sm border-slate-300">Change</button>
              )}
            </div>
            
            {/* Content (Active) */}
            {currentStep === 2 && (
              <div>
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="w-24 flex-shrink-0 flex flex-col items-center gap-4">
                        <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                          {item.image_urls?.[0] || item.imageUrls?.[0] ? (
                            <img
                              src={item.image_urls?.[0] || item.imageUrls?.[0]}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">🛒</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 w-full justify-center">
                          <button 
                            onClick={() => removeFromCart(item._id || item.id)}
                            className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:border-slate-400"
                            disabled={item.quantity <= 1}
                          >-</button>
                          <span className="font-semibold px-4 border border-slate-300 py-0.5 rounded-sm bg-white">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:border-slate-400"
                          >+</button>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-[15px] text-slate-800 line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4 flex items-center gap-2">
                          Seller: <span className="text-xl tracking-tight ml-1 mr-1 flex items-center"><span className="font-extrabold text-[#172545]">One</span><span className="font-extrabold text-primary">Basket</span></span> <span className="bg-[#f8cb46] text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-widest uppercase">Assured</span>
                        </p>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-slate-400 line-through text-sm">₹{(item.price * 1.15).toFixed(0)}</span>
                          <span className="text-xl font-bold text-slate-900">₹{item.price}</span>
                          <span className="text-green-600 font-bold text-sm tracking-tight">15% Off</span>
                        </div>
                        {(() => {
                          let isExpress = false;
                          if (shopLocation && currentLocation?.lat && currentLocation?.lng && shopLocation.express_delivery_max_distance !== undefined) {
                            const distance = getDistanceFromLatLonInKm(
                              shopLocation.lat, shopLocation.lng,
                              currentLocation.lat, currentLocation.lng
                            );
                            if (distance !== null && distance <= shopLocation.express_delivery_max_distance) {
                              isExpress = true;
                            }
                          }
                          return (
                            <p className="text-sm font-medium text-slate-800 mt-6 flex items-center gap-1">
                              {isExpress ? (
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                  Delivered in 30-45 minutes (EXPRESS)
                                </span>
                              ) : (
                                <span className="text-slate-600 font-medium">Standard Delivery (2-3 days)</span>
                              )}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <input type="checkbox" className="w-4 h-4 accent-primary" /> Use GST Invoice
                  </div>
                  <div className="text-slate-600 flex items-center gap-2 text-xs">
                    Email ID required for delivery <button className="text-primary font-semibold hover:underline">Add Email</button>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] flex justify-between items-center sticky bottom-0 z-10">
                  <p className="text-xs text-slate-600 max-w-xl">
                    Order confirmation email will be sent to <span className="font-semibold text-slate-800">{user?.email || 'your email'}</span>
                  </p>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="bg-primary text-white px-10 py-3 rounded-sm font-bold uppercase text-sm shadow-sm hover:shadow-md"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Content (Collapsed Summary) */}
            {currentStep > 2 && (
              <div className="px-14 py-4 text-sm text-slate-700 font-semibold">
                {cartItems.length} Item(s) Selected
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
            {/* Header */}
            <div className={`px-6 py-4 flex justify-between items-center ${currentStep === 3 ? 'bg-primary text-white' : 'text-slate-800'}`}>
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${currentStep === 3 ? 'bg-white text-primary' : 'bg-slate-200 text-slate-500'}`}>3</span>
                Payment Options
              </h2>
            </div>
            
            {/* Content (Active) */}
            {currentStep === 3 && (
              <div className="p-0">
                <div className="divide-y divide-slate-100">
                  {PAYMENT_MODES.map((mode) => (
                    <div 
                      key={mode.id}
                      onClick={() => setSelectedPayment(mode.id)}
                      className={`p-6 cursor-pointer flex gap-4 transition-all ${
                        selectedPayment === mode.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === mode.id ? 'border-primary' : 'border-slate-300'}`}>
                          {selectedPayment === mode.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="text-xl">{mode.icon}</span> {mode.label}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{mode.sub}</p>
                        
                        {selectedPayment === mode.id && (
                          <div className="mt-6 flex justify-between items-center">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Payable Amount</p>
                              <p className="text-xl font-bold text-slate-900">₹{(total + 9).toFixed(2)}</p>
                            </div>
                            <button
                              onClick={handlePlaceOrder}
                              disabled={placingOrder}
                              className="bg-primary text-white px-10 py-3 rounded-sm font-semibold uppercase text-sm shadow-sm hover:shadow-md flex items-center gap-2 disabled:bg-slate-300"
                            >
                              {placingOrder && <Loader2 size={16} className="animate-spin" />}
                              Pay ₹{(total + 9).toFixed(2)}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <p className="text-[11px] text-slate-500 mt-4 px-2 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span>Policies: Returns Policy | Terms of use | Security | Privacy | Infringement</span>
            <span>© 2007-2026 Flipkart.com Clone</span>
          </p>

        </div>

        {/* Right Sidebar - Price Details */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm sticky top-24">
            <h3 className="px-6 py-4 text-slate-500 font-semibold uppercase text-sm border-b border-slate-100 tracking-wide">
              Price Details
            </h3>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-slate-800">
                <span>Price ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>₹{mrpTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-800">
                <span>Discount</span>
                <span className="text-green-600">- ₹{discountTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-800 border-b border-dashed border-slate-200 pb-4">
                <span>Delivery Charges</span>
                <div>
                  <span className="text-slate-400 line-through mr-2">₹{deliveryFee}</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>Secured Packaging Fee</span>
                <span>₹9</span>
              </div>
              
              <div className="border-t border-dashed border-slate-200 pt-4 mt-4 flex justify-between font-bold text-lg text-slate-900">
                <span>Total Amount</span>
                <span>₹{(total + 9).toFixed(0)}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-green-600 font-semibold text-sm">
                  You will save ₹{(discountTotal + deliveryDiscount).toFixed(0)} on this order
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 flex items-center gap-2 border-t border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-widest justify-center">
              <CheckCircle2 size={16} className="text-primary" /> Safe and Secure Payments.
            </div>
          </div>
        </div>
      </div>
      
      <LocationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};
