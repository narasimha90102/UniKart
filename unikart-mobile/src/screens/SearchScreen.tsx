import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Search, X, Grid, SlidersHorizontal } from 'lucide-react-native';
import client from '../api/client';
import { Product, Category } from '../api/types';

const { width } = Dimensions.get('window');

export function SearchScreen({ route, navigation }: any) {
  const initialCategoryId = route.params?.categoryId || '';
  
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await client.get('/categories');
        const data = response.data.data || response.data;
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      let query = '/products?status=active';
      if (keyword.trim()) {
        query += `&keyword=${encodeURIComponent(keyword.trim())}`;
      }
      if (selectedCategory) {
        query += `&category=${selectedCategory}`;
      }
      
      const response = await client.get(query);
      const data = response.data.data || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [keyword, selectedCategory]);

  const handleClear = () => {
    setKeyword('');
  };

  const renderProduct = ({ item }: any) => {
    const imageUrl = item.images && item.images.length > 0
      ? item.images[0]
      : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        style={styles.productCard}
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text numberOfLines={1} style={styles.productCategory}>
            {typeof item.category === 'object' ? item.category.name : 'Catalog'}
          </Text>
          <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search items, textbooks, cycles..."
            placeholderTextColor="#9CA3AF"
            value={keyword}
            onChangeText={setKeyword}
            style={styles.input}
            autoFocus={!initialCategoryId}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <X size={16} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Horizontal Filter */}
      <View style={{ backgroundColor: '#FFFFFF', paddingBottom: 12 }}>
        <FlatList
          data={[{ _id: '', name: 'All Categories' }, ...categories]}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item._id)}
              style={[
                styles.categoryBadge,
                selectedCategory === item._id && styles.categoryBadgeActive
              ]}
            >
              <Text style={[styles.categoryText, selectedCategory === item._id && styles.categoryTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Grid size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No matching products</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your keyword or category filters.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.productGrid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  categoryList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryBadgeActive: {
    backgroundColor: '#EEF2F6',
    borderColor: '#6366F1',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#6366F1',
  },
  productGrid: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 36) / 2,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  productImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});
