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
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const continueAsDemo = async () => {
    const demoUser = {
      mobile: 'DEMO',
      name: 'Demo User',
      balance: 45250,
    };
    await login('demo-token', demoUser);
    router.replace('/(tabs)/home');
  };

  const sendOTP = async () => {
    if (mobile.length !== 10) {
      Alert.alert('Error', 'Enter valid 10-digit mobile');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Use: 123456');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        await login(data.token, data.user);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield-checkmark" size={60} color="#3b82f6" />
          </View>
          <Text style={styles.title}>FraudX</Text>
          <Text style={styles.tagline}>🚨 Soch samajh ke pay karo!</Text>
          <Text style={styles.subtitle}>🔒 End-to-End Secured</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="phone-portrait-outline" size={24} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              editable={!otpSent}
            />
          </View>

          {otpSent && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor="#6b7280"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                secureTextEntry
              />
            </View>
          )}

          {!otpSent ? (
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={sendOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={verifyOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendButton} onPress={() => setOtpSent(false)}>
                <Text style={styles.resendText}>Change Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.demoButton} onPress={continueAsDemo}>
          <Ionicons name="play-circle" size={20} color="#3b82f6" />
          <Text style={styles.demoButtonText}>Continue as Demo User</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>🔒 Your data is encrypted & protected</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.3)' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 14, color: '#ef4444', fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#10b981' },
  form: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#374151' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#3b82f6', borderRadius: 12, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  resendButton: { alignItems: 'center', paddingVertical: 12 },
  resendText: { color: '#3b82f6', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#374151' },
  dividerText: { marginHorizontal: 16, color: '#6b7280', fontSize: 12 },
  demoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, height: 56, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  demoButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: '600' },
  privacyText: { textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 24 },
});
