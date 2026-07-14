import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Palette, 
  Type, 
  Layout, 
  Save,
  Moon,
  Sun,
  Monitor,
  Eye,
  Settings,
  ChevronDown
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const ThemeCustomizer = ({ token }) => {
  const [settings, setSettings] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#f43f5e',
    fontFamily: 'Inter',
    borderRadius: '1rem',
    darkMode: 'system'
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('colors');

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await axios.get(`${API}/cms/theme`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.primaryColor) {
        setSettings(res.data);
      }
    } catch (error) {
      console.error("Theme fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async () => {
    try {
      await axios.post(`${API}/cms/theme`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Theme updated successfully');
    } catch (error) {
      console.error(error);
      alert('Error saving theme');
    }
  };

  const ColorPicker = ({ label, value, onChange }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-white border-none outline-none ring-1 ring-gray-200"
        />
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 font-mono text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase shadow-sm"
        />
      </div>
    </div>
  );

  const Section = ({ id, title, icon: Icon, children }) => {
    const isOpen = activeSection === id;
    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setActiveSection(isOpen ? null : id)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
              <Icon size={16} />
            </div>
            <span className="text-sm font-bold text-gray-900">{title}</span>
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Palette size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Theme Customizer</h2>
            <p className="text-sm font-medium text-gray-500">Manage global design tokens & branding</p>
          </div>
        </div>
        <button onClick={saveTheme} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
          <Save size={18} /> Publish Theme
        </button>
      </div>

      {/* Settings Sections (Accordion) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column — Settings */}
        <div className="space-y-4">
          <Section id="colors" title="Colors & Palette" icon={Palette}>
            <ColorPicker label="Primary Color" value={settings.primaryColor} onChange={(v) => setSettings({...settings, primaryColor: v})} />
            <ColorPicker label="Secondary Color" value={settings.secondaryColor} onChange={(v) => setSettings({...settings, secondaryColor: v})} />
            <ColorPicker label="Accent Color" value={settings.accentColor} onChange={(v) => setSettings({...settings, accentColor: v})} />
            
            {/* Color Swatches Preview */}
            <div className="pt-2">
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Preview Swatches</label>
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl shadow-sm border border-gray-100" style={{ backgroundColor: settings.primaryColor }}></div>
                <div className="w-14 h-14 rounded-xl shadow-sm border border-gray-100" style={{ backgroundColor: settings.secondaryColor }}></div>
                <div className="w-14 h-14 rounded-xl shadow-sm border border-gray-100" style={{ backgroundColor: settings.accentColor }}></div>
                <div className="flex-1 h-14 rounded-xl shadow-sm border border-gray-100" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}></div>
              </div>
            </div>
          </Section>

          <Section id="typography" title="Typography" icon={Type}>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">Primary Font Family</label>
              <select 
                value={settings.fontFamily}
                onChange={(e) => setSettings({...settings, fontFamily: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option>Inter</option>
                <option>Roboto</option>
                <option>Outfit</option>
                <option>Playfair Display</option>
              </select>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100" style={{ fontFamily: settings.fontFamily }}>
              <p className="text-2xl font-black text-gray-900 mb-1">Heading Example</p>
              <p className="text-sm text-gray-500">This is how your chosen font will look in body text throughout the storefront.</p>
            </div>
          </Section>

          <Section id="layout" title="Layout & Components" icon={Layout}>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">Border Radius (Global)</label>
              <select 
                value={settings.borderRadius}
                onChange={(e) => setSettings({...settings, borderRadius: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="0">Square (0px)</option>
                <option value="0.25rem">Small (4px)</option>
                <option value="0.5rem">Medium (8px)</option>
                <option value="1rem">Large (16px)</option>
                <option value="9999px">Pill (Full)</option>
              </select>
            </div>
            {/* Radius preview */}
            <div className="flex gap-3 items-end">
              {['0', '0.25rem', '0.5rem', '1rem', '9999px'].map((r) => (
                <div 
                  key={r}
                  onClick={() => setSettings({...settings, borderRadius: r})}
                  className={`w-14 h-14 border-2 cursor-pointer transition-all shadow-sm ${settings.borderRadius === r ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                  style={{ borderRadius: r }}
                ></div>
              ))}
            </div>
          </Section>

          <Section id="appearance" title="Appearance Default" icon={Moon}>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
              <button 
                onClick={() => setSettings({...settings, darkMode: 'light'})}
                className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${settings.darkMode === 'light' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              ><Sun size={14}/> Light</button>
              <button 
                onClick={() => setSettings({...settings, darkMode: 'dark'})}
                className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${settings.darkMode === 'dark' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              ><Moon size={14}/> Dark</button>
              <button 
                onClick={() => setSettings({...settings, darkMode: 'system'})}
                className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${settings.darkMode === 'system' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              ><Monitor size={14}/> Auto</button>
            </div>
            <p className="text-xs text-gray-400 font-medium">This sets the default theme for your storefront visitors. They can override it if your template supports toggling.</p>
          </Section>
        </div>

        {/* Right Column — Live Preview */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
          
          {/* Browser Chrome */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex-1 bg-white rounded-lg text-center py-1.5 text-xs font-mono text-gray-400 border border-gray-200 shadow-sm flex items-center justify-center gap-2">
              <Eye size={12} /> Live Preview
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5" style={{ fontFamily: settings.fontFamily }}>
            
            {/* Mock Storefront Navbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="text-lg font-black text-gray-900">One<span style={{ color: settings.primaryColor }}>Basket</span></div>
              <div className="flex gap-3">
                <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
                <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="p-5 mb-5" style={{ backgroundColor: `${settings.primaryColor}10`, borderRadius: settings.borderRadius }}>
              <h1 className="text-xl font-black text-gray-900 mb-2 leading-tight">
                Your Custom Theme <span style={{ color: settings.primaryColor }}>Looks Amazing</span>
              </h1>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">This is a live preview of how your settings will look on the storefront.</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 text-white font-bold text-xs shadow-md" style={{ backgroundColor: settings.primaryColor, borderRadius: settings.borderRadius }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 font-bold text-xs" style={{ color: settings.secondaryColor, border: `2px solid ${settings.secondaryColor}`, borderRadius: settings.borderRadius }}>
                  Secondary
                </button>
              </div>
            </div>

            {/* Product Cards */}
            <h3 className="text-sm font-black text-gray-900 mb-3">Trending Products</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="border border-gray-200 bg-white p-3 shadow-sm" style={{ borderRadius: settings.borderRadius }}>
                  <div className="h-20 bg-gray-100 mb-2" style={{ borderRadius: `calc(${settings.borderRadius} * 0.6)` }}></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                  <div className="h-6 w-full opacity-30" style={{ backgroundColor: settings.accentColor, borderRadius: settings.borderRadius }}></div>
                </div>
              ))}
            </div>

            {/* CTA Banner */}
            <div className="p-5 text-center text-white" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`, borderRadius: settings.borderRadius }}>
              <p className="text-sm font-black mb-1">🎉 Special Offer!</p>
              <p className="text-xs opacity-80 mb-3">Get 20% off on your first order</p>
              <button className="px-5 py-2 bg-white font-bold text-xs shadow-lg" style={{ color: settings.primaryColor, borderRadius: settings.borderRadius }}>
                Shop Now
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
