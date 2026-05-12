import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings as SettingsIcon, Shield, CreditCard, 
  MapPin, Bell, Globe, Moon, Accessibility, 
  Lock, Smartphone, Key, Users, CheckCircle, 
  ShoppingBag, List, Heart, Bookmark, HelpCircle, 
  AlertCircle, MessageSquare, FileText, Info, 
  LogOut, Trash2, ChevronRight, Edit, History, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export function Settings() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openModal = (title, desc) => {
    setModalContent({ title, desc });
  };

  const SettingSection = ({ title, items }) => (
    <div className="mb-8">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">{title}</h3>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else if (item.path) navigate(item.path);
                else openModal(item.label, item.desc);
              }}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.danger ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-black ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>{item.label}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-1 rounded-lg">{item.value}</span>}
                <ChevronRight className={`w-4 h-4 ${item.danger ? 'text-red-200' : 'text-gray-300'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Settings</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your UniKart experience</p>
        </div>
      </div>

      <SettingSection title="General" items={[
        { label: 'Account Settings', desc: 'Basic info and profile management', icon: User, path: '/dashboard/profile' },
        { label: 'Edit Profile', desc: 'Change name, photo and college', icon: Edit, path: '/dashboard/profile' },
        { label: 'Change Password', desc: 'Update your login credentials', icon: Key, path: '/dashboard/profile' },
        { label: 'Privacy Center', desc: 'Control your visibility and data', icon: Shield },
        { label: 'Notification Settings', desc: 'Manage alerts and messages', icon: Bell, path: '/dashboard/notifications' },
        { label: 'Language Selection', desc: 'English (US)', icon: Globe, value: 'English' },
        { label: 'Theme / Dark Mode', desc: 'Personalize your interface', icon: Moon, value: 'Light' },
        { label: 'Accessibility', desc: 'Font size and screen readers', icon: Accessibility },
      ]} />

      <SettingSection title="Security" items={[
        { label: 'Manage Devices', desc: 'View and logout from other devices', icon: Smartphone },
        { label: 'Login Activity', desc: 'Recent login locations and times', icon: History },
        { label: 'Two-Factor Authentication', desc: 'Add extra layer of security', icon: Lock, value: 'Disabled' },
        { label: 'Session Management', desc: 'Active session controls', icon: Shield },
        { label: 'Blocked Users', desc: 'Manage your blocked list', icon: Users },
        { label: 'Account Verification', desc: 'Get the verified badge', icon: CheckCircle, value: user?.isVerified ? 'Verified' : 'Verify Now' },
      ]} />

      <SettingSection title="Marketplace" items={[
        { label: 'My Orders', desc: 'Track and manage your purchases', icon: ShoppingBag, path: '/dashboard/orders' },
        { label: 'Selling Products', desc: 'Manage your active listings', icon: List, path: '/sell' },
        { label: 'Wishlist', desc: 'Items you have saved for later', icon: Heart, path: '/dashboard/wishlist' },
        { label: 'Saved Items', desc: 'Saved searches and sellers', icon: Bookmark },
        { label: 'Payment Settings', desc: 'Cards, UPI and wallets', icon: CreditCard, path: '/dashboard/payments' },
        { label: 'Address Management', desc: 'Campus delivery locations', icon: MapPin },
      ]} />

      <SettingSection title="Support & Feedback" items={[
        { label: 'Help Center', desc: 'FAQs and support guides', icon: HelpCircle },
        { label: 'Report a Problem', desc: 'Technical issues or safety concerns', icon: AlertCircle },
        { label: 'Contact Support', desc: 'Chat with our campus team', icon: MessageSquare },
        { label: 'Terms & Conditions', desc: 'Platform usage rules', icon: FileText },
        { label: 'Privacy Policy', desc: 'Data protection policies', icon: Shield },
        { label: 'About UniKart', desc: 'Version 2.1.0', icon: Info },
      ]} />

      <SettingSection title="Danger Zone" items={[
        { label: 'Sign Out', desc: 'Securely logout from your account', icon: LogOut, onClick: handleLogout, danger: true },
      ]} />

      <div className="text-center py-6">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">UniKart • Production Build v2.1.0</p>
      </div>

      {/* Professional Modal for Features */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setModalContent(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative z-10 text-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                <SettingsIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">{modalContent.title}</h3>
              <p className="text-sm text-gray-500 font-bold mb-8">{modalContent.desc}</p>
              <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Coming Soon</p>
                <p className="text-[10px] text-gray-400 mt-1">We are working on bringing this feature to your campus.</p>
              </div>
              <Button onClick={() => setModalContent(null)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">Got it</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
