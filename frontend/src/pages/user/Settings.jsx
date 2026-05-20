import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, MapPin, Bell, Globe, Moon,
  Lock, Smartphone, Key, Users, CheckCircle, 
  ShoppingBag, List, Heart, HelpCircle, 
  AlertCircle, Info, 
  LogOut, ChevronRight, Edit, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Modals
import { ChangePasswordModal } from '../../components/settings/ChangePasswordModal';
import { PrivacyModal } from '../../components/settings/PrivacyModal';
import { NotificationModal } from '../../components/settings/NotificationModal';
import { ThemeModal, LanguageModal } from '../../components/settings/PreferencesModals';
import { ManageDevicesModal, LoginActivityModal, TwoFAModal, BlockedUsersModal } from '../../components/settings/SecurityModals';
import { AddressModal } from '../../components/settings/AddressModal';
import { PaymentModal } from '../../components/settings/PaymentModal';
import { HelpCenterModal, AboutModal } from '../../components/settings/HelpModals';

// Modal key → component mapping
const MODALS = {
  changePassword: ChangePasswordModal,
  privacy: PrivacyModal,
  notifications: NotificationModal,
  theme: ThemeModal,
  language: LanguageModal,
  devices: ManageDevicesModal,
  loginActivity: LoginActivityModal,
  twoFA: TwoFAModal,
  blockedUsers: BlockedUsersModal,
  address: AddressModal,
  payment: PaymentModal,
  helpCenter: HelpCenterModal,
  about: AboutModal,
};

export function Settings() {
  const { logout, user } = useAuth();
  const { currentLanguage, isDark } = useTheme();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  const open = (key) => setActiveModal(key);
  const close = () => setActiveModal(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ActiveModalComponent = activeModal ? MODALS[activeModal] : null;

  const SettingSection = ({ title, items }) => (
    <div className="mb-6">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">{title}</h3>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (item.onClick) item.onClick();
                else if (item.modal) open(item.modal);
                else if (item.path) navigate(item.path);
              }}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  item.danger
                    ? 'bg-red-50 text-red-500'
                    : 'bg-gray-50 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-black ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>{item.label}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-1 rounded-lg">
                    {item.value}
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${item.danger ? 'text-red-200' : 'text-gray-300'}`} />
              </div>
            </motion.button>
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

      {/* General */}
      <SettingSection title="General" items={[
        { label: 'Edit Profile', desc: 'Name, photo, college and bio', icon: Edit, path: '/dashboard/profile' },
        { label: 'Change Password', desc: 'Update your login credentials', icon: Key, modal: 'changePassword' },
        { label: 'Privacy Center', desc: 'Control your visibility and data', icon: Shield, modal: 'privacy' },
        { label: 'Notification Settings', desc: 'Manage alerts and messages', icon: Bell, modal: 'notifications' },
        { label: 'Language', desc: 'Select your preferred language', icon: Globe, modal: 'language', value: currentLanguage.label },
        { label: 'Theme / Dark Mode', desc: 'Personalize your interface', icon: Moon, modal: 'theme', value: isDark ? 'Dark' : 'Light' },
      ]} />

      {/* Security */}
      <SettingSection title="Security" items={[
        { label: 'Manage Devices', desc: 'View and logout from other devices', icon: Smartphone, modal: 'devices' },
        { label: 'Login Activity', desc: 'Recent login locations and times', icon: History, modal: 'loginActivity' },
        { label: 'Two-Factor Authentication', desc: 'Add extra layer of security', icon: Lock, modal: 'twoFA', value: user?.twoFA ? 'ON' : 'OFF' },
        { label: 'Blocked Users', desc: 'Manage your blocked list', icon: Users, modal: 'blockedUsers' },
        ...( user?.role !== 'admin' && user?.isVerified ? [{
          label: 'Account Verification',
          desc: 'Verified campus student',
          icon: CheckCircle,
          value: 'Verified',
          path: '/dashboard/profile'
        }] : []),
      ]} />

      {/* Marketplace */}
      <SettingSection title="Marketplace" items={[
        { label: 'My Orders', desc: 'Track and manage your purchases', icon: ShoppingBag, path: '/dashboard/orders' },
        { label: 'My Listings', desc: 'Manage your active products', icon: List, path: '/sell' },
        { label: 'Wishlist', desc: 'Items you have saved for later', icon: Heart, path: '/dashboard/wishlist' },
        { label: 'Payment Settings', desc: 'UPI IDs and payment methods', icon: CreditCard, modal: 'payment' },
        { label: 'Address Management', desc: 'Campus delivery locations', icon: MapPin, modal: 'address' },
      ]} />

      {/* Support */}
      <SettingSection title="Support & Feedback" items={[
        { label: 'Help Center & FAQs', desc: 'Guides, FAQs and contact support', icon: HelpCircle, modal: 'helpCenter' },
        { label: 'Report a Problem', desc: 'Technical issues or safety concerns', icon: AlertCircle, modal: 'helpCenter' },
        { label: 'About UniKart', desc: 'Version 2.1.0 · Production', icon: Info, modal: 'about' },
      ]} />

      {/* Danger Zone — Logout Only */}
      <SettingSection title="Danger Zone" items={[
        { label: 'Sign Out', desc: 'Securely logout from this device', icon: LogOut, onClick: handleLogout, danger: true },
      ]} />

      <div className="text-center py-6">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">UniKart • v2.1.0 • Campus Certified</p>
      </div>

      {/* Render Active Modal */}
      <AnimatePresence>
        {ActiveModalComponent && <ActiveModalComponent onClose={close} />}
      </AnimatePresence>
    </motion.div>
  );
}
