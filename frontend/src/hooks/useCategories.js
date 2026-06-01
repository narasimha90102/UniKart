import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/categories');
      const categoriesList = [...res.data.data];
      const sportsIndex = categoriesList.findIndex(c => c.toLowerCase() === 'sports');
      const othersIndex = categoriesList.findIndex(c => c.toLowerCase() === 'others' || c.toLowerCase() === 'other');
      
      if (sportsIndex !== -1 && othersIndex !== -1) {
        const temp = categoriesList[sportsIndex];
        categoriesList[sportsIndex] = categoriesList[othersIndex];
        categoriesList[othersIndex] = temp;
      }

      const formatted = categoriesList.map((cat, index) => ({
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
