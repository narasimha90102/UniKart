import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Camera, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react-native';
import client from '../api/client';
import { Category } from '../api/types';

export function SellScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('good');
  const [description, setDescription] = useState('');
  
  // Custom image links (multiple support)
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await client.get('/categories');
        const data = response.data.data || response.data;
        setCategories(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setCategoryId(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCats();
  }, []);

  const handleAddImage = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImage = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated.length > 0 ? updated : ['']);
  };

  const handleImageUrlChange = (text: string, index: number) => {
    const updated = [...imageUrls];
    updated[index] = text;
    setImageUrls(updated);
  };

  const handleCreateProduct = async () => {
    if (!name || !price || !categoryId || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Filter out empty image links
    const filteredImages = imageUrls.filter(url => url.trim().length > 0);
    // If no images entered, fallback to a placeholder
    const finalImages = filteredImages.length > 0 
      ? filteredImages 
      : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60'];

    setLoading(true);
    try {
      await client.post('/products', {
        name: name.trim(),
        price: parseFloat(price),
        category: categoryId,
        condition,
        description: description.trim(),
        images: finalImages
      });
      
      Alert.alert('Success', 'Your listing has been posted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setPrice('');
            setDescription('');
            setImageUrls(['']);
            navigation.navigate('Home');
          }
        }
      ]);
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  if (catLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Post a Listing</Text>
        <Text style={styles.subtitle}>Sell to other campus students</Text>
      </View>

      <View style={styles.form}>
        {/* Name */}
        <Text style={styles.label}>Product Title *</Text>
        <TextInput
          placeholder="e.g. Hero Cycle, Engineering Book"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Price */}
        <Text style={styles.label}>Price (INR) *</Text>
        <TextInput
          placeholder="e.g. 1500"
          placeholderTextColor="#9CA3AF"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Category Selector */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.selectorRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              onPress={() => setCategoryId(cat._id)}
              style={[
                styles.selectorItem,
                categoryId === cat._id && styles.selectorItemActive
              ]}
            >
              <Text style={[styles.selectorItemText, categoryId === cat._id && styles.selectorItemTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Condition Selector */}
        <Text style={styles.label}>Condition *</Text>
        <View style={styles.selectorRow}>
          {['new', 'like_new', 'good', 'fair'].map((cond) => (
            <TouchableOpacity
              key={cond}
              onPress={() => setCondition(cond)}
              style={[
                styles.selectorItem,
                condition === cond && styles.selectorItemActive
              ]}
            >
              <Text style={[styles.selectorItemText, condition === cond && styles.selectorItemTextActive]}>
                {cond.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          placeholder="Provide detail on condition, purchase year, and pickup location."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        {/* Image URLs */}
        <View style={styles.imageHeaderRow}>
          <Text style={styles.label}>Product Image Links</Text>
          <TouchableOpacity onPress={handleAddImage} style={styles.addImageBtn}>
            <Plus size={16} color="#6366F1" style={{ marginRight: 4 }} />
            <Text style={styles.addImageText}>Add More</Text>
          </TouchableOpacity>
        </View>

        {imageUrls.map((url, index) => (
          <View key={index} style={styles.imageInputContainer}>
            <TextInput
              placeholder="Paste Image URL link"
              placeholderTextColor="#9CA3AF"
              value={url}
              onChangeText={(text) => handleImageUrlChange(text, index)}
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
            />
            {imageUrls.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveImage(index)} style={styles.removeImageBtn}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Submit */}
        <TouchableOpacity onPress={handleCreateProduct} disabled={loading} style={styles.submitBtn}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitText}>Publish Listing</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  form: {},
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    color: '#111827',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectorItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectorItemActive: {
    backgroundColor: '#EEF2F6',
    borderColor: '#6366F1',
  },
  selectorItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  selectorItemTextActive: {
    color: '#6366F1',
  },
  imageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  addImageText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '700',
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeImageBtn: {
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    shadowColor: '#6366F1',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
