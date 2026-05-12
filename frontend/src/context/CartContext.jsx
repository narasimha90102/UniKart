import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get('/users/cart');
      setCart(response.data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return alert('Please login to add items to cart');
    try {
      const response = await api.post('/users/cart', { productId, quantity });
      // Re-fetch cart to get populated product data
      await fetchCart();
      return response.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/users/cart/${productId}`);
      setCart(prev => prev.filter(item => item.product._id !== productId));
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, fetchCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
