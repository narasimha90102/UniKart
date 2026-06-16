import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { User as UserIcon, LogOut, Settings, ShieldAlert, Award, Phone, Mail, FileText, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../api/authContext';
import client from '../api/client';

export function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      const response = await client.put('/users/profile', {
        name: name.trim(),
        phoneNumber: phone.trim()
      });
      
      const updatedUser = response.data.data || response.data.user || response.data;
      updateUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          {user.avatar && user.avatar !== 'default-avatar.png' ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <UserIcon size={36} color="#4F46E5" />
          )}
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userRole}>
          {user.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'CAMPUS SELLER'}
        </Text>

        <View style={styles.completionRow}>
          <Text style={styles.completionText}>Profile completion: {user.profileCompletionPercentage || 0}%</Text>
          {user.isVerified && <CheckCircle size={14} color="#10B981" style={{ marginLeft: 4 }} />}
        </View>
      </View>

      {/* Edit Form / Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{isEditing ? 'Edit Profile' : 'Contact Information'}</Text>
        
        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />

            <View style={styles.btnRow}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.actionBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} disabled={loading} style={[styles.actionBtn, styles.saveBtn]}>
                {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Mail size={16} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={styles.detailText}>{user.email}</Text>
            </View>
            <View style={styles.detailItem}>
              <Phone size={16} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={styles.detailText}>{user.phoneNumber || 'Add phone number'}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Contact Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{user.wishlist?.length || 0}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>₹{user.balance || 0}</Text>
          <Text style={styles.statLabel}>UniWallet</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsList}>
        {user.role === 'admin' && (
          <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.adminActionItem}>
            <ShieldAlert size={20} color="#DC2626" style={{ marginRight: 12 }} />
            <Text style={styles.adminActionText}>Admin Panel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleLogout} style={styles.actionItem}>
          <LogOut size={20} color="#6B7280" style={{ marginRight: 12 }} />
          <Text style={styles.actionText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>UniKart Native v1.0.0 (Release)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  userRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1,
    marginTop: 4,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  completionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  detailsList: {},
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  editBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  editBtnText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 13,
  },
  form: {
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
    color: '#111827',
    fontSize: 14,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  actionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  adminActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  adminActionText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 40,
  },
});
