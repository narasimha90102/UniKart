import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - reuses existing backend endpoints
export const BASE_URL = 'https://lucky-eagle-23.loca.lt/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request if available
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Failed to load token from AsyncStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
