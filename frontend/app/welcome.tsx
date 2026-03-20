import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace('/(tabs)/home');
      } else {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
          setShowOptions(true);
        }, 1500);
      }
    }
  }, [isLoading, token]);

  if (!showOptions) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.title}>FraudX</Text>
          <Text style={styles.tagline}>Smart AI Protection for Payments</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.welcomeEmoji}>👋</Text>
        <Text style={styles.welcomeTitle}>Welcome to FraudX</Text>
        <Text style={styles.welcomeSubtitle}>Your AI-Powered Payment Guardian</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => router.push('/login')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="log-in" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.optionTitle}>Already a Member</Text>
            <Text style={styles.optionSubtitle}>Login to your account</Text>
            <View style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Continue →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => router.push('/create-account')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-add" size={32} color="#10b981" />
            </View>
            <Text style={styles.optionTitle}>New User</Text>
            <Text style={styles.optionSubtitle}>Create your account</Text>
            <View style={[styles.optionButton, { backgroundColor: '#10b981' }]}>
              <Text style={styles.optionButtonText}>Get Started →</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  logoContainer: { alignItems: 'center' },
  logo: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 14, color: '#9ca3af' },
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  welcomeEmoji: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: '#9ca3af', marginBottom: 48, textAlign: 'center' },
  optionsContainer: { width: '100%', gap: 16, marginBottom: 24 },
  optionCard: { backgroundColor: '#1f2937', borderRadius: 20, padding: 24, borderWidth: 2, borderColor: '#374151', alignItems: 'center' },
  optionIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  optionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  optionSubtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  optionButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  optionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipButton: { marginTop: 16 },
  skipText: { color: '#6b7280', fontSize: 14 },
});
