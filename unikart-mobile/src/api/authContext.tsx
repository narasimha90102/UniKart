import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './client';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, regNo: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token and fetch user details on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Set authorization header manually for the initial verification call
          const response = await client.get('/auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data.data || response.data);
        }
      } catch (err) {
        console.warn('Session restoration failed. Clearing invalid token:', err);
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const { token: receivedToken, user: loggedUser } = response.data;
      
      await AsyncStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      throw new Error(msg);
    }
  };

  const register = async (name: string, email: string, password: string, regNo: string, phoneNumber: string) => {
    try {
      const response = await client.post('/auth/register', { name, email, password, regNo, phoneNumber });
      const { token: receivedToken, user: loggedUser } = response.data;
      
      await AsyncStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check details.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Logout storage failure:', err);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
