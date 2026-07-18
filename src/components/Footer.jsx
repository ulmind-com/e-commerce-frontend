import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0b1b14] text-slate-300 pt-16 pb-6 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12 border-b border-slate-700/50 pb-12">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">OneBasket</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed pr-4">
              Your one-stop destination for quality products at the best prices. Shop more, save more.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0f5132] hover:text-white transition-colors">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0f5132] hover:text-white transition-colors">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0f5132] hover:text-white transition-colors">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0f5132] hover:text-white transition-colors">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white text-base font-bold mb-5 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products" className="hover:text-white hover:underline transition-colors">All Categories</Link></li>
              <li><Link to="/products?search=Groceries" className="hover:text-white hover:underline transition-colors">Groceries</Link></li>
              <li><Link to="/products?search=Electronics" className="hover:text-white hover:underline transition-colors">Electronics</Link></li>
              <li><Link to="/products?search=Fashion" className="hover:text-white hover:underline transition-colors">Fashion</Link></li>
              <li><Link to="/products?search=Home" className="hover:text-white hover:underline transition-colors">Home Appliances</Link></li>
              <li><Link to="/products" className="hover:text-white hover:underline transition-colors">Deals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-base font-bold mb-5 uppercase tracking-wider">Customer Service</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/orders" className="hover:text-white hover:underline transition-colors">Track Order</Link></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Return & Refund</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white text-base font-bold mb-5 uppercase tracking-wider">Information</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white hover:underline transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Store Locator</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-white text-base font-bold mb-5 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-slate-400 mt-0.5" />
                <span className="hover:text-white transition-colors cursor-pointer">+92 314 435 7610</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-slate-400 mt-0.5" />
                <span className="hover:text-white transition-colors cursor-pointer">info@onebasket.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Bahawalnagar Road, Chok Marlay Sahiwal, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 OneBasket Shopping Mart. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-400">We Accept:</span>
            <div className="flex items-center gap-2">
              <div className="bg-white px-2 py-1 rounded text-xs font-black text-blue-900">VISA</div>
              <div className="bg-white px-2 py-1 rounded text-xs font-black text-red-600">MasterCard</div>
              <div className="bg-white px-2 py-1 rounded text-xs font-black text-sky-500">Paypal</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
