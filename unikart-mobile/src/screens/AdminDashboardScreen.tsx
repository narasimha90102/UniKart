import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Users, ShoppingBag, ShieldAlert, CheckCircle, Trash2, ArrowLeft } from 'lucide-react-native';
import client from '../api/client';

export function AdminDashboardScreen({ navigation }: any) {
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'users'>('listings');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes] = await Promise.all([
        client.get('/users'),
        client.get('/products'),
      ]);

      const usersList = usersRes.data.data || usersRes.data;
      const productsList = productsRes.data.data || productsRes.data;

      setUsersCount(Array.isArray(usersList) ? usersList.length : 0);
      setProductsCount(Array.isArray(productsList) ? productsList.length : 0);

      if (activeTab === 'listings') {
        setItems(Array.isArray(productsList) ? productsList : []);
      } else {
        setItems(Array.isArray(usersList) ? usersList : []);
      }
    } catch (err) {
      console.warn('Admin fetch dashboard failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const handleDeleteItem = (itemId: string, itemName: string) => {
    const endpoint = activeTab === 'listings' ? `/products/${itemId}` : `/users/${itemId}`;
    Alert.alert('Delete Confirmation', `Are you sure you want to delete "${itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(endpoint);
            Alert.alert('Deleted', 'Deleted successfully.');
            fetchDashboardData();
          } catch (err: any) {
            Alert.alert('Failed', err.response?.data?.message || 'Delete operation failed.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: any) => {
    const name = activeTab === 'listings' ? item.name : item.name;
    const subtitle = activeTab === 'listings' ? `₹${item.price} • Status: ${item.status}` : item.email;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemMeta}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteItem(item._id || item.id, name)} style={styles.deleteBtn}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Admin Control Center</Text>
          <Text style={styles.subtitle}>UniKart Site Administration</Text>
        </View>
      </View>

      {/* Mini Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Users size={20} color="#4F46E5" />
          <Text style={styles.statNum}>{usersCount}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <ShoppingBag size={20} color="#10B981" />
          <Text style={styles.statNum}>{productsCount}</Text>
          <Text style={styles.statLabel}>Total Listings</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('listings')}
          style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('users')}
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Users</Text>
        </TouchableOpacity>
      </View>

      {/* Catalog / Accounts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={styles.list}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#6366F1',
  },
  list: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemMeta: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
});
