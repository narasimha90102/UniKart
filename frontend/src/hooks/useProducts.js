import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      console.log('[useProducts Hook] API response received successfully:', res.data);
      setProducts(res.data.data);
    } catch (err) {
      console.error('[useProducts Hook] Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.addEventListener('products-updated', fetchProducts);
    return () => window.removeEventListener('products-updated', fetchProducts);
  }, []);

  return [products, fetchProducts, loading];
}
