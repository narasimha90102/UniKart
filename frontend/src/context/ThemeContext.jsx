import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import { TRANSLATIONS } from '../data/translations';

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇮🇳' },
];

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const resolved = theme === THEMES.SYSTEM ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }) {
  const { user, setUser } = useAuth();
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('unikart_theme') || THEMES.LIGHT;
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('unikart_language') || 'en';
  });

  // Sync with logged in user's saved language on load or user change
  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguageState(user.language);
      localStorage.setItem('unikart_language', user.language);
    }
  }, [user?.language]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to system theme changes if "system" is selected
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(THEMES.SYSTEM);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('unikart_theme', t);
    applyTheme(t);
  };

  const setLanguage = async (code) => {
    setLanguageState(code);
    localStorage.setItem('unikart_language', code);
    
    // Save to user profile database if logged in
    if (user) {
      try {
        const response = await api.put('/users/profile', { language: code });
        if (response.data?.success) {
          const updatedUser = { ...user, language: code };
          setUser(updatedUser);
          localStorage.setItem('unikart_user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error('Failed to sync language preference with backend:', err);
      }
    }
  };

  const resolvedTheme = theme === THEMES.SYSTEM ? getSystemTheme() : theme;
  const isDark = resolvedTheme === 'dark';
  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, language, setLanguage, currentLanguage, t, THEMES, LANGUAGES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
