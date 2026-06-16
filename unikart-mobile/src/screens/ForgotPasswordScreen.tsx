import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import client from '../api/client';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await client.post('/auth/forgotpassword', { email: email.trim().toLowerCase() });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle size={64} color="#10B981" style={styles.successIcon} />
        <Text style={styles.successTitle}>Request Sent!</Text>
        <Text style={styles.successMessage}>
          If an account exists for {email}, a secure reset link has been dispatched to your email.
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLoginBtn}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backHeader}>
        <ArrowLeft size={20} color="#374151" />
        <Text style={styles.backHeaderText}>Back to Login</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address below and we'll send you instructions to reset your password.
        </Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

        <TouchableOpacity onPress={handleForgotPassword} disabled={loading} style={styles.submitBtn}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitText}>Send Reset Link</Text>
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
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  backHeaderText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  form: {},
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
    marginBottom: 20,
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
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
    fontWeight: '500',
  },
  backToLoginBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingHorizontal: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
