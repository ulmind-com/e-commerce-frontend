import React, { useState, useEffect } from 'react';
import { X, CreditCard, HelpCircle, CheckCircle2, Loader2, ArrowRight, Banknote, Landmark, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RefundModal({ isOpen, onClose, request, onSubmit }) {
  const isOnline = request?.payment_mode === 'ONLINE';
  const [method, setMethod] = useState(isOnline ? 'Razorpay' : 'UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({ acc: '', ifsc: '' });
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMethod(isOnline ? 'Razorpay' : 'UPI');
      setUpiId('');
      setBankDetails({ acc: '', ifsc: '' });
      setIsVerifying(false);
      setIsVerified(false);
      setIsProcessing(false);
      setProgressStep(0);
    }
  }, [isOpen, isOnline]);

  if (!isOpen || !request) return null;

  const handleVerifyUPI = () => {
    if (!upiId) return;
    setIsVerifying(true);
    // Mock NPCI Verification Delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setVerifiedName('Verified Customer'); // In real app, this comes from API
    }, 1500);
  };

  const handleVerifyBank = () => {
    if (!bankDetails.acc || !bankDetails.ifsc) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setVerifiedName('Verified Customer Account');
    }, 1500);
  };

  const handleProcessRefund = () => {
    setIsProcessing(true);
    setProgressStep(1); // Connecting to gateway

    setTimeout(() => {
      setProgressStep(2); // Transferring funds
      setTimeout(() => {
        setProgressStep(3); // Success
        setTimeout(() => {
          onSubmit({ 
            method, 
            transactionId: method === 'Razorpay' ? 'RZP_AUTO_' + Date.now() : 'AUTO_PAYOUT_' + Date.now(), 
            amount: request.total_amount 
          });
        }, 1000);
      }, 1500);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={!isProcessing ? onClose : undefined}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-slate-900 px-6 py-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[64px] opacity-20"></div>
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                Process Refund
              </h2>
              {!isProcessing && (
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white mb-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full opacity-10 blur-2xl"></div>
              <p className="text-emerald-50 text-xs uppercase tracking-wider font-semibold mb-1">Refund Amount</p>
              <div className="text-3xl font-extrabold tracking-tight">₹{request.total_amount?.toLocaleString()}</div>
            </div>

            {isProcessing ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-500"
                  />
                  {progressStep === 3 ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-500 rounded-full p-2">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                  ) : (
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {progressStep === 1 && "Connecting to Gateway..."}
                    {progressStep === 2 && "Transferring Funds..."}
                    {progressStep === 3 && "Refund Successful!"}
                  </h3>
                  <p className="text-sm text-slate-500">Please do not close this window</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {isOnline ? (
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Source Account Refund</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          This order was paid online. The amount will be automatically credited back to the customer's original payment method via Razorpay.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Select Payout Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['UPI', 'Bank', 'Wallet'].map(m => (
                          <button
                            key={m}
                            onClick={() => { setMethod(m); setIsVerified(false); }}
                            className={`py-2.5 px-3 border-2 rounded-xl text-sm font-bold transition-all ${method === m ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200 text-slate-500 hover:text-slate-700'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {method === 'UPI' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">Customer UPI ID</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={upiId}
                              onChange={(e) => { setUpiId(e.target.value); setIsVerified(false); }}
                              placeholder="e.g. 9876543210@ybl"
                              disabled={isVerified || isVerifying}
                              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none disabled:opacity-60 transition-all font-medium"
                            />
                            {!isVerified && (
                              <button 
                                onClick={handleVerifyUPI}
                                disabled={!upiId || isVerifying}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center min-w-[90px]"
                              >
                                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {method === 'Bank' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Account Number</label>
                              <input 
                                type="text" 
                                value={bankDetails.acc}
                                onChange={(e) => { setBankDetails(prev => ({...prev, acc: e.target.value})); setIsVerified(false); }}
                                disabled={isVerified || isVerifying}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                              />
                            </div>
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">IFSC Code</label>
                                <input 
                                  type="text" 
                                  value={bankDetails.ifsc}
                                  onChange={(e) => { setBankDetails(prev => ({...prev, ifsc: e.target.value.toUpperCase()})); setIsVerified(false); }}
                                  disabled={isVerified || isVerifying}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-medium uppercase"
                                />
                              </div>
                              {!isVerified && (
                                <button 
                                  onClick={handleVerifyBank}
                                  disabled={!bankDetails.acc || !bankDetails.ifsc || isVerifying}
                                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors h-[42px] min-w-[90px] flex items-center justify-center"
                                >
                                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isVerified && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Verified Receiver</p>
                            <p className="text-sm font-bold text-slate-800">{verifiedName}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )}
          </div>

          {!isProcessing && (
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={handleProcessRefund}
                disabled={!isOnline && !isVerified && method !== 'Wallet'}
                className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black disabled:from-slate-300 disabled:to-slate-300 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                Initiate Automatic Payout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
