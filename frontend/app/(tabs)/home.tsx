import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

const DUMMY_TRANSACTIONS = [
  { id: '1', recipient: '🛒 Grocery Store', amount: 250, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 10, icon: 'cart', color: '#10b981', insight: 'Regular merchant, typical amount' },
  { id: '2', recipient: '📦 Amazon', amount: 799, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 15, icon: 'cube', color: '#10b981', insight: 'Trusted online platform' },
  { id: '3', recipient: '❓ Unknown Merchant', amount: 12500, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), riskLevel: 'HIGH', riskScore: 90, icon: 'alert-circle', color: '#ef4444', alert: '🚨', insight: '5x higher than usual spending' },
  { id: '4', recipient: '🍔 Swiggy', amount: 1200, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), riskLevel: 'MEDIUM', riskScore: 50, icon: 'restaurant', color: '#f59e0b', insight: 'Late night transaction detected' },
  { id: '5', recipient: '📍 New Location (Delhi)', amount: 25000, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), riskLevel: 'HIGH', riskScore: 95, icon: 'location', color: '#ef4444', alert: '🚨', insight: 'Transaction from unusual location' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [fraudScore, setFraudScore] = useState(35);
  const bounceAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  const getScoreColor = () => fraudScore <= 30 ? '#10b981' : fraudScore <= 60 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = () => fraudScore <= 30 ? 'Low Risk' : fraudScore <= 60 ? 'Medium Risk' : 'High Risk';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }} tintColor="#3b82f6" />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back! 👋</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.shieldContainer}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
            <View style={styles.aiDot} />
          </View>
        </View>

        <Animated.View style={[styles.balanceCard, { transform: [{ scale: bounceAnim }] }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.protectedBadge}>🔒 AI Protected</Text>
          </View>
          <Text style={styles.balanceAmount}>₹45,250</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.safetyIndicator}>
              <Text style={styles.safetyDot}>🟢</Text>
              <Text style={styles.safetyText}>Account Safe</Text>
            </View>
            <Text style={styles.encryptedText}>🔐 Encrypted</Text>
          </View>
        </Animated.View>

        <View style={styles.fraudScoreCard}>
          <View style={styles.fraudScoreHeader}>
            <Text style={styles.fraudScoreTitle}>🧠 Fraud Susceptibility Score</Text>
            <Text style={[styles.fraudScoreValue, { color: getScoreColor() }]}>{fraudScore}/100</Text>
          </View>
          <View style={styles.fraudScoreMeter}>
            <View style={styles.fraudScoreBg}>
              <View style={[styles.fraudScoreFill, { width: `${fraudScore}%`, backgroundColor: getScoreColor() }]} />
            </View>
          </View>
          <Text style={[styles.fraudScoreLabel, { color: getScoreColor() }]}>{getScoreLabel()} - Keep blocking suspicious transactions!</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/send-money')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={styles.actionEmoji}>💸</Text>
            </View>
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/scan-pay')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.actionEmoji}>📱</Text>
            </View>
            <Text style={styles.actionText}>Scan & Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-money')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.actionEmoji}>💳</Text>
            </View>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fraudTipsCard} onPress={() => router.push('/fraud-news')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fraudTipsTitle}>🚨 Recent Fraud Alert</Text>
            <Text style={styles.fraudTipsText}>Beware of fake UPI apps! Always verify merchant details before payment.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ef4444" />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {DUMMY_TRANSACTIONS.map((tx) => (
            <TouchableOpacity key={tx.id} style={styles.transactionCard} onPress={() => router.push('/transaction-detail')}>
              <View style={styles.transactionLeft}>
                <View style={[styles.txIcon, { backgroundColor: `${tx.color}20` }]}>
                  <Ionicons name={tx.icon as any} size={20} color={tx.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txRecipient}>{tx.recipient}</Text>
                  <Text style={styles.txTime}>{format(tx.timestamp, 'MMM dd, hh:mm a')}</Text>
                  <Text style={styles.txInsight}>🤖 {tx.insight}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.txAmount, { color: tx.color }]}>-₹{tx.amount.toLocaleString('en-IN')}</Text>
                <View style={[styles.riskBadge, { backgroundColor: `${tx.color}20` }]}>
                  <Text style={[styles.riskText, { color: tx.color }]}>{tx.alert || ''} {tx.riskLevel}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>Tip: Never share OTP, PIN, or CVV with anyone!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  greeting: { fontSize: 14, color: '#9ca3af' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  shieldContainer: { position: 'relative' },
  shieldEmoji: { fontSize: 48 },
  aiDot: { position: 'absolute', top: 5, right: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981' },
  balanceCard: { marginHorizontal: 20, padding: 24, backgroundColor: '#1f2937', borderRadius: 20, borderWidth: 2, borderColor: '#3b82f6', marginBottom: 16 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 14, color: '#9ca3af' },
  protectedBadge: { fontSize: 11, color: '#3b82f6' },
  balanceAmount: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  safetyIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  safetyDot: { fontSize: 12 },
  safetyText: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  encryptedText: { fontSize: 11, color: '#6b7280' },
  fraudScoreCard: { marginHorizontal: 20, padding: 20, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', marginBottom: 16 },
  fraudScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fraudScoreTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', flex: 1 },
  fraudScoreValue: { fontSize: 24, fontWeight: 'bold' },
  fraudScoreMeter: { marginBottom: 8 },
  fraudScoreBg: { height: 10, backgroundColor: '#374151', borderRadius: 5, overflow: 'hidden' },
  fraudScoreFill: { height: '100%' },
  fraudScoreLabel: { fontSize: 12, fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 16 },
  actionButton: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)' },
  actionEmoji: { fontSize: 32 },
  actionText: { fontSize: 12, color: '#d1d5db', fontWeight: '600' },
  fraudTipsCard: { marginHorizontal: 20, padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 16 },
  fraudTipsTitle: { fontSize: 13, fontWeight: 'bold', color: '#ef4444', marginBottom: 6 },
  fraudTipsText: { fontSize: 12, color: '#f87171' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  seeAll: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txRecipient: { fontSize: 14, fontWeight: '600', color: '#fff' },
  txTime: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  txInsight: { fontSize: 10, color: '#6b7280', marginTop: 2, fontStyle: 'italic' },
  transactionRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskText: { fontSize: 9, fontWeight: 'bold' },
  tipsCard: { marginHorizontal: 20, marginBottom: 24, padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipEmoji: { fontSize: 24 },
  tipText: { flex: 1, fontSize: 13, color: '#f59e0b', fontWeight: '500' },
});
