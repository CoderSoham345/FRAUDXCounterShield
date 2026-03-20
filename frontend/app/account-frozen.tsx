import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AccountFrozenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(30);
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  const freezeUntil = params.freezeUntil ? new Date(params.freezeUntil as string) : new Date(Date.now() + 30000);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((freezeUntil.getTime() - now.getTime()) / 1000));
      setTimeRemaining(diff);

      // Haptic feedback every 5 seconds
      if (diff % 5 === 0 && diff > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (diff === 0) {
        clearInterval(interval);
        handleUnfreeze();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUnfreeze = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/account/unfreeze?token=${token}`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Account Unfrozen', 'Your account is now active. Stay safe!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
        ]);
      }
    } catch (error) {
      console.error('Unfreeze error:', error);
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Lock Icon */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.lockEmoji}>🔒</Text>
            <Text style={styles.snowflakeEmoji}>❄️</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Account Frozen! ❄️</Text>
        <Text style={styles.subtitle}>We stopped a potential fraud attempt!</Text>

        {/* Success Badge */}
        <View style={styles.successBadge}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successText}>Suspicious transaction blocked</Text>
        </View>

        {/* Animated Countdown Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>⏰ Auto-Unlock In</Text>
          <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.timerText}>{timeRemaining}</Text>
            <Text style={styles.timerUnit}>seconds</Text>
          </Animated.View>
        </View>

        {/* Info Cards with Emojis */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🛡️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your Money is Safe</Text>
              <Text style={styles.infoText}>AI detected unusual activity</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⚡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Quick Recovery</Text>
              <Text style={styles.infoText}>Account unlocks automatically</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🤖</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>AI Protection Active</Text>
              <Text style={styles.infoText}>24/7 fraud monitoring</Text>
            </View>
          </View>
        </View>

        {/* Unfreeze Button */}
        <TouchableOpacity style={styles.unfreezeButton} onPress={handleUnfreeze}>
          <Text style={styles.unfreezeEmoji}>🔓</Text>
          <Text style={styles.unfreezeButtonText}>Unfreeze Now</Text>
        </TouchableOpacity>

        {/* Help Section */}
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.helpText}>Why was my account frozen?</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>💡 This is a security feature to protect you from fraud</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 4,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockEmoji: {
    fontSize: 80,
  },
  snowflakeEmoji: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 32,
  },
  successEmoji: {
    fontSize: 24,
  },
  successText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10b981',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
    fontWeight: '600',
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1f2937',
    borderWidth: 6,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  timerUnit: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  infoCards: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoEmoji: {
    fontSize: 32,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unfreezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  unfreezeEmoji: {
    fontSize: 24,
  },
  unfreezeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
