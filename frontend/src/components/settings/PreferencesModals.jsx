import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme, THEMES, LANGUAGES } from '../../context/ThemeContext';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export function ThemeModal({ onClose }) {
  const { theme, setTheme, isDark } = useTheme();
  const [selected, setSelected] = useState(theme);

  const options = [
    {
      id: THEMES.LIGHT,
      icon: Sun,
      label: 'Light Mode',
      desc: 'Clean white interface, ideal for daytime',
      preview: 'bg-gray-50 border-gray-200',
      dot: 'bg-yellow-400',
    },
    {
      id: THEMES.DARK,
      icon: Moon,
      label: 'Dark Mode',
      desc: 'Easy on the eyes, great at night',
      preview: 'bg-gray-900 border-gray-700',
      dot: 'bg-indigo-400',
    },
    {
      id: THEMES.SYSTEM,
      icon: Monitor,
      label: 'System Default',
      desc: 'Automatically follows your OS setting',
      preview: 'bg-gradient-to-br from-gray-50 to-gray-800 border-gray-400',
      dot: 'bg-gray-400',
    },
  ];

  const handleApply = () => {
    setTheme(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tighter">Theme</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Choose your display mode</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-3 mb-8">
            {options.map(opt => {
              const Icon = opt.icon;
              const isActive = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    isActive ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Mini preview swatch */}
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${opt.preview}`}>
                    <Icon className={`w-5 h-5 ${opt.id === THEMES.DARK ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${isActive ? 'text-primary' : 'text-gray-900'}`}>{opt.label}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{opt.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >Cancel</button>
            <button
              onClick={handleApply}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >Apply</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function LanguageModal({ onClose }) {
  const { language, setLanguage, LANGUAGES } = useTheme();
  const [selected, setSelected] = useState(language);

  const handleApply = () => {
    setLanguage(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tighter">Language</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Select your preferred language</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-2 mb-8 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {LANGUAGES.map(lang => {
              const isActive = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelected(lang.code)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
                    isActive ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${isActive ? 'text-primary' : 'text-gray-900'}`}>{lang.label}</p>
                    <p className="text-[10px] font-bold text-gray-400">{lang.nativeLabel}</p>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >Cancel</button>
            <button
              onClick={handleApply}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >Apply</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
