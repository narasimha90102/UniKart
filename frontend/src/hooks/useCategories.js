import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/categories');
      // The API returns an array of strings, but the UI expects objects with 'id' and 'name'
      // to maintain compatibility with existing code.
      const formatted = res.data.data.map((cat, index) => ({
        id: index + 1,
        name: cat
      }));
      setCategories(formatted);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    window.addEventListener('categories-updated', fetchCategories);
    return () => window.removeEventListener('categories-updated', fetchCategories);
  }, []);

  return [categories, fetchCategories, loading];
}
