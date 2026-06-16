import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Search, Bell, Sparkles, TrendingUp, Compass, ShoppingBag } from 'lucide-react-native';
import client from '../api/client';
import { Product, Category } from '../api/types';

const { width } = Dimensions.get('window');

const BANNERS = [
  { id: '1', title: 'Campus Essentials', subtitle: 'Up to 40% Off on Electronics', color: '#6366F1', image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&auto=format&fit=crop&q=60' },
  { id: '2', title: 'Dorm Decor & Books', subtitle: 'Sell or buy used books instantly', color: '#EC4899', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60' },
];

export function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          client.get('/categories'),
          client.get('/products?status=active'),
        ]);
        
        // Extract array from response body
        const categoriesData = categoriesRes.data.data || categoriesRes.data;
        const productsData = productsRes.data.data || productsRes.data;

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const renderBanner = ({ item }: any) => (
    <View style={[styles.bannerCard, { backgroundColor: item.color }]}>
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>Explore Now</Text>
        </TouchableOpacity>
      </View>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
    </View>
  );

  const renderProduct = ({ item }: any) => {
    // Check if item has images, fallback to default placeholder
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
            {typeof item.category === 'object' ? item.category.name : 'University marketplace'}
          </Text>
          <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.condition ? item.condition.replace('_', ' ') : 'used'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading campus catalog...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Search */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <Text style={styles.searchText}>Search books, cycles, electronics...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Banners */}
      <FlatList
        data={BANNERS}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.bannerList}
      />

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            onPress={() => navigation.navigate('Search', { categoryId: cat._id })}
            style={styles.categoryBadge}
          >
            <Compass size={18} color="#6366F1" style={styles.catIcon} />
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed Title */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TrendingUp size={18} color="#EC4899" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Recently Listed</Text>
        </View>
      </View>

      {/* Products Feed */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={false}
        contentContainerStyle={styles.productGrid}
      />
      <View style={{ height: 32 }} />
    </ScrollView>
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  notifBtn: {
    padding: 6,
  },
  bannerList: {
    marginVertical: 16,
  },
  bannerCard: {
    width: width - 32,
    height: 150,
    borderRadius: 24,
    marginHorizontal: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 20,
  },
  bannerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  bannerBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  bannerBtnText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  categoryScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  productGrid: {
    paddingHorizontal: 12,
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
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
});
