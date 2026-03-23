import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const continueAsDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '9999999999', password: 'test123' }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        await login(data.token, data.user);
        router.replace('/(tabs)/home');
      } else {
        // Fallback: use local demo data
        const demoUser = { mobile: '9999999999', name: 'Rajesh Kumar', balance: 45250 };
        await login('demo-token', demoUser);
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      // Fallback to local demo
      const demoUser = { mobile: '9999999999', name: 'Rajesh Kumar', balance: 45250 };
      await login('demo-token', demoUser);
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (mobile.length !== 10) {
      Alert.alert('Error', 'Enter valid 10-digit mobile number');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        await login(data.token, data.user);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="shield-checkmark" size={60} color="#3b82f6" />
            </View>
            <Text style={styles.title}>FraudX</Text>
            <Text style={styles.tagline}>Soch samajh ke pay karo!</Text>
            <Text style={styles.subtitle}>End-to-End Secured</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait-outline" size={22} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#6b7280"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.demoHint}>
              <Ionicons name="information-circle" size={16} color="#6b7280" />
              <Text style={styles.demoHintText}>Demo: 9999999999 / test123</Text>
            </View>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.demoButton} onPress={continueAsDemo} disabled={loading}>
            <Ionicons name="play-circle" size={20} color="#3b82f6" />
            <Text style={styles.demoButtonText}>Continue as Demo User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createAccountLink} onPress={() => router.push('/create-account')}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <Text style={styles.createAccountBold}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.privacyText}>Your data is encrypted & protected</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 40 },
  header: { position: 'absolute', top: 0, left: 0, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  iconWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 14, color: '#ef4444', fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#10b981' },
  form: { gap: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1f2937', borderRadius: 12,
    paddingHorizontal: 16, borderWidth: 1, borderColor: '#374151',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: '#fff', fontSize: 16 },
  eyeBtn: { padding: 8 },
  button: {
    backgroundColor: '#3b82f6', borderRadius: 12, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  demoHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 4,
  },
  demoHintText: { color: '#6b7280', fontSize: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#374151' },
  dividerText: { marginHorizontal: 16, color: '#6b7280', fontSize: 12 },
  demoButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12,
    height: 56, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  demoButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: '600' },
  createAccountLink: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 20,
  },
  createAccountText: { color: '#6b7280', fontSize: 14 },
  createAccountBold: { color: '#3b82f6', fontSize: 14, fontWeight: '700' },
  privacyText: { textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 16 },
});
