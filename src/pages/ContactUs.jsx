import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, MapPin, Send, MessageCircle, Headphones, Clock,
  ChevronDown, CheckCircle2,
} from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';
import { fadeUp, stagger } from '../lib/storefront';

const CONTACT_METHODS = [
  { icon: Headphones, title: 'Customer Care', value: '1800 123 4567', sub: 'Toll-free · 7 AM – 11 PM', accent: 'bg-emerald-50 text-[#0f5132]' },
  { icon: MessageCircle, title: 'WhatsApp Chat', value: '+91 98765 43210', sub: 'Instant replies, 24/7', accent: 'bg-amber-50 text-amber-600' },
  { icon: Mail, title: 'Email Us', value: 'care@onebasket.in', sub: 'Reply within 24 hours', accent: 'bg-sky-50 text-sky-600' },
];

const FAQS = [
  { q: 'How fast is OneBasket delivery?', a: 'Most orders arrive within 10–30 minutes from your nearest OneBasket store, depending on your location and time of day.' },
  { q: 'What are your delivery charges?', a: 'Delivery is free on orders over ₹2,000. A small fee applies to smaller baskets, shown clearly at checkout before you pay.' },
  { q: 'Can I return a product?', a: 'Yes — we offer a 7-day hassle-free return on eligible items. Perishables can be returned instantly if they arrive damaged or spoiled.' },
  { q: 'Which payment methods do you accept?', a: 'We accept UPI, all major credit/debit cards, net banking, popular wallets and Cash on Delivery.' },
  { q: 'How do I track my order?', a: 'Head to My Orders in your account, or use the live tracking link sent to you the moment your order is out for delivery.' },
];

const ContactUs = () => {
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Tell us how we can help';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // No backend contact endpoint — simulate a successful submission.
    setSent(true);
  };

  const field = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const inputBase =
    'w-full bg-slate-50 border rounded-lg px-4 py-3 outline-none transition-all focus:ring-1';

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1b14] via-[#0c4128] to-[#0f5132] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_18%_25%,#2dd4bf_0,transparent_40%),radial-gradient(circle_at_82%_75%,#f59e0b_0,transparent_45%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <Headphones size={14} /> We're here to help
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-[0.95]">
              Get in touch
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg font-medium">
              Questions, feedback or a hiccup with an order? The OneBasket team responds fast — usually within a few minutes.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── CONTACT METHOD CARDS ──────────────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="-mt-10 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {CONTACT_METHODS.map((m) => (
            <motion.div key={m.title} variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${m.accent}`}>
                <m.icon size={26} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{m.title}</h3>
              <p className="text-[#0f5132] font-black">{m.value}</p>
              <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── FORM + INFO ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-slate-100 mb-16">
          {/* Info sidebar */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-[#0f5132] to-[#0c4128] text-white p-8 md:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-white/5" />
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
            <h3 className="text-2xl font-black mb-3 relative">Contact Information</h3>
            <p className="text-emerald-100/90 mb-8 relative">Fill up the form and our team will get back to you within 24 hours.</p>
            <div className="flex flex-col gap-5 relative">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Phone size={18} className="text-emerald-200" /></div>
                <span className="font-medium">1800 123 4567</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Mail size={18} className="text-emerald-200" /></div>
                <span className="font-medium">care@onebasket.in</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><MapPin size={18} className="text-emerald-200" /></div>
                <span className="font-medium">OneBasket HQ, Prestige Tech Park, Marathahalli, Bengaluru 560103</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Clock size={18} className="text-emerald-200" /></div>
                <span className="font-medium">Support: 7:00 AM – 11:00 PM, all week</span>
              </div>
            </div>
            <div className="mt-auto pt-10 flex items-center gap-3 relative">
              {[FaInstagram, FaTwitter, FaFacebookF, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="social">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="w-full md:w-3/5 p-8 md:p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                    <CheckCircle2 size={44} className="text-[#0f5132]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Message sent!</h3>
                  <p className="text-slate-500 max-w-sm mb-6">Thanks for reaching out, {form.firstName || 'friend'}. Our team will get back to you within 24 hours.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ firstName: '', lastName: '', email: '', phone: '', message: '' }); }}
                    className="text-[#0f5132] font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input
                        value={form.firstName}
                        onChange={(e) => field('firstName', e.target.value)}
                        className={`${inputBase} ${errors.firstName ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#0f5132] focus:ring-[#0f5132]'}`}
                        placeholder="Aarav"
                      />
                      {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input
                        value={form.lastName}
                        onChange={(e) => field('lastName', e.target.value)}
                        className={`${inputBase} border-slate-200 focus:border-[#0f5132] focus:ring-[#0f5132]`}
                        placeholder="Sharma"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => field('email', e.target.value)}
                        className={`${inputBase} ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#0f5132] focus:ring-[#0f5132]'}`}
                        placeholder="aarav@example.com"
                      />
                      {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => field('phone', e.target.value)}
                        className={`${inputBase} border-slate-200 focus:border-[#0f5132] focus:ring-[#0f5132]`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Message</label>
                    <textarea
                      rows="4"
                      value={form.message}
                      onChange={(e) => field('message', e.target.value)}
                      className={`${inputBase} resize-none ${errors.message ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#0f5132] focus:ring-[#0f5132]'}`}
                      placeholder="How can we help you today?"
                    />
                    {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
                  </div>
                  <button
                    type="submit"
                    className="mt-2 bg-[#0f5132] text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#0c4128] transition-colors self-end w-full md:w-auto shadow-lg"
                  >
                    Send Message <Send size={18} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-800 text-center mb-2">Frequently asked questions</h2>
          <p className="text-slate-500 text-center mb-10">Quick answers to the things people ask us most.</p>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className={`bg-white rounded-2xl border transition-colors ${open ? 'border-[#0f5132]' : 'border-slate-100'}`}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-bold text-slate-800">{faq.q}</span>
                    <ChevronDown size={20} className={`shrink-0 text-[#0f5132] transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-slate-600 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
