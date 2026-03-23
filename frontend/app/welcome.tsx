import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && token) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, token]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark" size={64} color="#3b82f6" />
          </View>
          <Text style={styles.title}>FraudX</Text>
          <Text style={styles.tagline}>Soch samajh ke pay karo!</Text>
          <Text style={styles.subtitle}>AI-Powered Payment Guardian</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => router.push('/login')}
          >
            <View style={[styles.optionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="log-in" size={28} color="#3b82f6" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Login</Text>
              <Text style={styles.optionSubtitle}>Already have an account</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => router.push('/create-account')}
          >
            <View style={[styles.optionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="person-add" size={28} color="#10b981" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Create Account</Text>
              <Text style={styles.optionSubtitle}>New to FraudX</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, styles.demoCard]}
            onPress={() => router.push('/login')}
          >
            <View style={[styles.optionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="play-circle" size={28} color="#f59e0b" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Try Demo</Text>
              <Text style={styles.optionSubtitle}>Explore with demo data</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={14} color="#10b981" />
          <Text style={styles.footerText}>End-to-End Encrypted & AI Protected</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  shieldCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, borderWidth: 3, borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  title: { fontSize: 44, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 14, color: '#ef4444', fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  optionsContainer: { gap: 12, marginBottom: 32 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1f2937', borderRadius: 16,
    padding: 18, gap: 16,
    borderWidth: 1, borderColor: '#374151',
  },
  demoCard: { borderColor: 'rgba(245, 158, 11, 0.3)' },
  optionIcon: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 17, fontWeight: '600', color: '#fff', marginBottom: 2 },
  optionSubtitle: { fontSize: 13, color: '#9ca3af' },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
  },
  footerText: { fontSize: 12, color: '#10b981' },
});
