import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { MessageSquare, ArrowLeft, Heart, Share2, Shield, ShoppingCart, User as UserIcon } from 'lucide-react-native';
import client from '../api/client';
import { Product, User } from '../api/types';
import { useAuth } from '../api/authContext';

const { width } = Dimensions.get('window');

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { user: currentUser } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.get(`/products/${productId}`);
        setProduct(response.data.data || response.data);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChat = () => {
    if (!product || !currentUser) return;
    
    const seller = product.seller as User;
    const sellerId = typeof seller === 'object' ? seller._id : seller;
    const sellerName = typeof seller === 'object' ? seller.name : 'Seller';
    const sellerAvatar = typeof seller === 'object' ? seller.avatar : '';
    
    if (sellerId === currentUser._id) {
      alert("You cannot chat with yourself (you are the seller of this product).");
      return;
    }

    // Sort IDs alphabetically to generate room name
    const room = [currentUser._id, sellerId].sort().join('-');
    
    navigation.navigate('ChatDetail', {
      room,
      recipientId: sellerId,
      recipientName: sellerName,
      recipientAvatar: sellerAvatar,
      product: product
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  const sellerInfo = product.seller as User;
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Gallery Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          
          {/* Header Action Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayBtn}>
              <ArrowLeft size={20} color="#111827" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={[styles.overlayBtn, { marginRight: 10 }]}>
                <Heart size={20} color={isFavorite ? '#EF4444' : '#111827'} fill={isFavorite ? '#EF4444' : 'transparent'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.overlayBtn}>
                <Share2 size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.detailsContainer}>
          {/* Category */}
          <Text style={styles.categoryBadge}>
            {typeof product.category === 'object' ? product.category.name : 'Item'}
          </Text>
          
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>

          {/* Condition & Views */}
          <View style={styles.metaRow}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{product.condition ? product.condition.replace('_', ' ') : 'used'}</Text>
            </View>
            <Text style={styles.viewsText}>{product.views || 0} views</Text>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          <View style={styles.divider} />

          {/* Seller Card */}
          {sellerInfo && (
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatarContainer}>
                {sellerInfo.avatar && sellerInfo.avatar !== 'default-avatar.png' ? (
                  <Image source={{ uri: sellerInfo.avatar }} style={styles.sellerAvatar} />
                ) : (
                  <UserIcon size={24} color="#6B7280" />
                )}
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerLabel}>Seller Information</Text>
                <Text style={styles.sellerName}>{sellerInfo.name || 'Campus Student'}</Text>
                <Text style={styles.sellerStats}>Completion: {sellerInfo.profileCompletionPercentage || 0}%</Text>
              </View>
            </View>
          )}

          {/* Trust Seal */}
          <View style={styles.trustCard}>
            <Shield size={18} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text style={styles.trustText}>Always meet on campus and verify items before paying.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleChat} style={styles.chatBtn}>
          <MessageSquare size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.chatBtnText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  detailsContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 28,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  conditionBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginRight: 12,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    textTransform: 'uppercase',
  },
  viewsText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontWeight: '500',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sellerAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  sellerAvatar: {
    width: '100%',
    height: '100%',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1,
  },
  sellerStats: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '500',
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  chatBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
