import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { User, Mail, Lock, Phone, Key, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../api/authContext';

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !regNo || !phoneNumber || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, regNo.trim(), phoneNumber.trim());
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View className="items-center mb-6 mt-4">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join UniKart Marketplace</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Name */}
        <View style={styles.inputContainer}>
          <User size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="University Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* Register Number */}
        <View style={styles.inputContainer}>
          <Key size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Registration / ID Number"
            placeholderTextColor="#9CA3AF"
            value={regNo}
            onChangeText={setRegNo}
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputContainer}>
          <Phone size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9CA3AF"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Password (min 8 chars)"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.registerBtn}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Switch to Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
  },
  registerBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '700',
  },
});
