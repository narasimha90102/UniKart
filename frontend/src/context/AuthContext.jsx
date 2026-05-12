import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('unikart_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    
    // Store user data
    setUser(userData);
    localStorage.setItem('unikart_user', JSON.stringify(userData));
    localStorage.setItem('unikart_token', token);
    
    return userData;
  };

  const signup = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data;
    // We don't log in immediately because OTP verification might be needed
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unikart_user');
  };

  const value = React.useMemo(() => ({ 
    user, 
    login, 
    signup, 
    logout, 
    setUser 
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
