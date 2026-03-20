import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function FraudAlertScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, updateBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const shakeAnim = new Animated.Value(0);
  const bounceAnim = new Animated.Value(0.8);

  const transactionId = params.transactionId as string;
  const recipient = params.recipient as string;
  const amount = params.amount as string;
  const riskScore = parseInt(params.riskScore as string);
  const riskLevel = params.riskLevel as string;
  const fraudReasons = JSON.parse(params.fraudReasons as string);
  const aiAnalysis = params.aiAnalysis as string;

  useEffect(() => {
    // Trigger haptic feedback on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Shake animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bounce in animation
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const getRiskColor = () => {
    if (riskScore >= 60) return '#ef4444';
    if (riskScore >= 30) return '#f59e0b';
    return '#10b981';
  };

  const handleAction = async (action: 'allow' | 'block') => {
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/confirm?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (action === 'allow') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          updateBalance(data.new_balance);
          Alert.alert('✅ Success', 'Payment completed successfully', [
            { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
          ]);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          router.replace({
            pathname: '/account-frozen',
            params: { freezeUntil: data.freeze_until },
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process action');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.alertCard,
            {
              transform: [
                { scale: bounceAnim },
                { translateX: shakeAnim }
              ]
            }
          ]}
        >
          {/* CARTOON HACKER/THIEF ICON */}
          <View style={styles.cartoonContainer}>
            <View style={[styles.cartoonCircle, { backgroundColor: `${getRiskColor()}20` }]}>
              <Text style={styles.cartoonEmoji}>🥷</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertEmoji}>🚨</Text>
              </View>
            </View>
          </View>

          {/* Title with animation */}
          <Text style={styles.title}>🚨 Fraud Alert!</Text>
          <Text style={styles.subtitle}>This payment looks suspicious!</Text>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>👤 To:</Text>
              <Text style={styles.detailValue}>{recipient}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💰 Amount:</Text>
              <Text style={[styles.detailValue, styles.amountText]}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Animated Risk Meter */}
          <View style={styles.riskMeterContainer}>
            <View style={styles.riskMeterHeader}>
              <Text style={styles.riskMeterLabel}>⚠️ Danger Level</Text>
              <Text style={[styles.riskScoreText, { color: getRiskColor() }]}>
                {riskScore}/100
              </Text>
            </View>
            <View style={styles.riskMeterBg}>
              <Animated.View
                style={[
                  styles.riskMeterFill,
                  {
                    width: `${riskScore}%`,
                    backgroundColor: getRiskColor(),
                  },
                ]}
              />
            </View>
            <View style={[styles.riskLevelBadge, { backgroundColor: `${getRiskColor()}20` }]}>
              <Text style={[styles.riskLevelText, { color: getRiskColor() }]}>
                {riskLevel === 'HIGH' ? '🔴 HIGH RISK' : riskLevel === 'MEDIUM' ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}
              </Text>
            </View>
          </View>

          {/* Warning Messages with Emojis */}
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>🤔 Why is this suspicious?</Text>
            {fraudReasons.map((reason: string, index: number) => (
              <View key={index} style={styles.warningItem}>
                <Text style={styles.warningBullet}>⚠️</Text>
                <Text style={styles.warningText}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* AI Analysis Card */}
          {aiAnalysis && (
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiEmoji}>🤖</Text>
                <Text style={styles.aiLabel}>AI Analysis</Text>
              </View>
              <Text style={styles.aiText}>{aiAnalysis}</Text>
            </View>
          )}

          {/* Fun Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.blockButton]}
              onPress={() => handleAction('block')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonEmoji}>🛑</Text>
                  <Text style={styles.buttonText}>Block It!</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.allowButton]}
              onPress={() => handleAction('allow')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonEmoji}>✅</Text>
                  <Text style={styles.buttonText}>Allow Anyway</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>⚡ AI is 95% accurate in detecting fraud</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: '#ef4444',
  },
  cartoonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cartoonCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ef4444',
    position: 'relative',
  },
  cartoonEmoji: {
    fontSize: 64,
  },
  alertBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#0a0a0a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  riskMeterContainer: {
    marginBottom: 20,
  },
  riskMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskMeterLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  riskScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  riskMeterBg: {
    height: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  riskMeterFill: {
    height: '100%',
  },
  riskLevelBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  warningBullet: {
    fontSize: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
  },
  aiCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiEmoji: {
    fontSize: 20,
  },
  aiLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  aiText: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
  },
  blockButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  allowButton: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  buttonEmoji: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimer: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});
