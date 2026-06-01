import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Bell, Globe, Moon,
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
  helpCenter: HelpCenterModal,
  about: AboutModal,
};

export function Settings() {
  const { logout, user } = useAuth();
  const { currentLanguage, isDark, t } = useTheme();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (activeModal) {
      // Capture and save the exact scroll position when a sub-page/modal opens
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
    } else {
      // Restore the exact scroll position when the modal is closed
      const savedScrollY = scrollPositionRef.current;
      if (savedScrollY > 0) {
        // Small delay to allow the DOM/animation to settle smoothly
        const timer = setTimeout(() => {
          window.scrollTo({
            top: savedScrollY,
            behavior: 'instant'
          });
        }, 10);
        return () => clearTimeout(timer);
      }
    }
  }, [activeModal]);

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
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{t('settings')}</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{t('manageExperience')}</p>
        </div>
      </div>

      {/* General */}
      <SettingSection title={t('general')} items={[
        { label: t('editProfile'), desc: t('editProfileDesc'), icon: Edit, path: '/dashboard/profile' },
        { label: t('changePassword'), desc: t('changePasswordDesc'), icon: Key, modal: 'changePassword' },
        { label: t('privacyCenter'), desc: t('privacyCenterDesc'), icon: Shield, modal: 'privacy' },
        { label: t('notificationSettings'), desc: t('notificationSettingsDesc'), icon: Bell, modal: 'notifications' },
        { label: t('language'), desc: t('languageDesc'), icon: Globe, modal: 'language', value: currentLanguage.label },
        { label: t('themeMode'), desc: t('themeModeDesc'), icon: Moon, modal: 'theme', value: isDark ? t('darkMode') : t('lightMode') },
      ]} />

      {/* Security */}
      <SettingSection title={t('securitySection')} items={[
        { label: t('manageDevicesLabel'), desc: t('manageDevicesDesc'), icon: Smartphone, modal: 'devices' },
        { label: t('loginActivityLabel'), desc: t('loginActivityDesc'), icon: History, modal: 'loginActivity' },
        { label: t('twoFactorAuth'), desc: t('twoFactorAuthDesc'), icon: Lock, modal: 'twoFA', value: user?.twoFA ? 'ON' : 'OFF' },
        { label: t('blockedUsersLabel'), desc: t('blockedUsersDesc'), icon: Users, modal: 'blockedUsers' },
        ...( user?.role !== 'admin' && user?.isVerified ? [{
          label: t('accountVerification'),
          desc: t('accountVerificationDesc'),
          icon: CheckCircle,
          value: t('verifiedLabel'),
          path: '/dashboard/profile'
        }] : []),
      ]} />

      {/* Marketplace */}
      <SettingSection title={t('marketplaceSection')} items={[
        { label: t('myOrders'), desc: t('myOrdersDesc'), icon: ShoppingBag, path: '/dashboard/orders' },
        { label: t('myListings'), desc: t('myListingsDesc'), icon: List, path: '/sell' },
        { label: t('wishlist'), desc: t('wishlistDesc'), icon: Heart, path: '/dashboard/wishlist' },
      ]} />

      {/* Support */}
      <SettingSection title={t('supportFeedback')} items={[
        { label: t('helpCenterFaqs'), desc: t('helpCenterDesc'), icon: HelpCircle, modal: 'helpCenter' },
        { label: t('reportProblem'), desc: t('reportProblemDesc'), icon: AlertCircle, modal: 'helpCenter' },
        { label: t('aboutUniKart'), desc: t('aboutDesc'), icon: Info, modal: 'about' },
      ]} />

      {/* Danger Zone — Logout Only */}
      <SettingSection title={t('dangerZone')} items={[
        { label: t('signOut'), desc: t('signOutDesc'), icon: LogOut, onClick: handleLogout, danger: true },
      ]} />



      {/* Render Active Modal */}
      <AnimatePresence>
        {ActiveModalComponent && <ActiveModalComponent onClose={close} />}
      </AnimatePresence>
    </motion.div>
  );
}
