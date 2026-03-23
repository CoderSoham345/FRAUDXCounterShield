import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function CreateAccountScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateAccount = async () => {
    if (!formData.name || !formData.mobile || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (formData.mobile.length !== 10) {
      Alert.alert('Error', 'Enter valid 10-digit mobile number');
      return;
    }
    if (formData.password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: formData.mobile,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        await login(data.token, data.user);
        Alert.alert('Account Created!', 'Welcome to FraudX!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
        ]);
      } else {
        Alert.alert('Error', data.detail || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person-add" size={40} color="#10b981" />
            </View>
            <Text style={styles.welcomeText}>Join FraudX</Text>
            <Text style={styles.welcomeSubtext}>AI-powered payment protection</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#6b7280"
                  value={formData.name}
                  onChangeText={(v) => updateField('name', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.mobile}
                  onChangeText={(v) => updateField('mobile', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(v) => updateField('password', v)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={formData.confirmPassword}
                  onChangeText={(v) => updateField('confirmPassword', v)}
                />
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>Your account is protected by AI fraud detection from day one</Text>
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <Text style={styles.loginLinkBold}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#374151',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  iconWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  welcomeSubtext: { fontSize: 14, color: '#9ca3af' },
  formSection: { gap: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1f2937', borderRadius: 12,
    paddingHorizontal: 16, height: 56,
    borderWidth: 1, borderColor: '#374151', gap: 12,
  },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 24, marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: '#3b82f6' },
  createButton: {
    backgroundColor: '#10b981', height: 56, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  createButtonDisabled: { opacity: 0.6 },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginLink: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  loginLinkText: { color: '#6b7280', fontSize: 14 },
  loginLinkBold: { color: '#3b82f6', fontSize: 14, fontWeight: '700' },
});
