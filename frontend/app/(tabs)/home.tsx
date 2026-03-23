import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const FALLBACK_TRANSACTIONS = [
  { id: '1', receiver: 'Grocery Store', amount: 250, timestamp: new Date(Date.now() - 2*3600000).toISOString(), risk_level: 'low', risk_score: 10, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [], ai_analysis: 'Regular merchant.' },
  { id: '2', receiver: 'Amazon', amount: 799, timestamp: new Date(Date.now() - 5*3600000).toISOString(), risk_level: 'low', risk_score: 15, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [], ai_analysis: 'Trusted platform.' },
  { id: '3', receiver: 'Unknown Merchant', amount: 12500, timestamp: new Date(Date.now() - 86400000).toISOString(), risk_level: 'high', risk_score: 90, status: 'blocked', location: { city: 'Delhi' }, fraud_reasons: ['High amount', 'Unknown merchant'], ai_analysis: 'High risk.' },
  { id: '4', receiver: 'Swiggy', amount: 1200, timestamp: new Date(Date.now() - 172800000).toISOString(), risk_level: 'medium', risk_score: 50, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: ['Late night'], ai_analysis: 'Medium risk.' },
  { id: '5', receiver: 'Fuel Station Delhi', amount: 25000, timestamp: new Date(Date.now() - 259200000).toISOString(), risk_level: 'high', risk_score: 95, status: 'blocked', location: { city: 'Delhi' }, fraud_reasons: ['New location', 'High amount'], ai_analysis: 'High risk.' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>(FALLBACK_TRANSACTIONS);
  const [fraudScore, setFraudScore] = useState(35);
  const [balance, setBalance] = useState(user?.balance || 45250);
  const bounceAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  const fetchData = useCallback(async () => {
    if (!token || token === 'demo-token') {
      setBalance(user?.balance || 45250);
      return;
    }
    try {
      // Fetch transactions
      const txRes = await fetch(`${BACKEND_URL}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData && txData.length > 0) {
          setTransactions(txData);
        }
      }

      // Fetch profile for balance and fraud score
      const profRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        setBalance(profData.balance);
        setFraudScore(profData.fraud_susceptibility_score || 35);
      }
    } catch (error) {
      console.log('Using fallback data');
    }
  }, [token, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getScoreColor = () => fraudScore <= 30 ? '#10b981' : fraudScore <= 60 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = () => fraudScore <= 30 ? 'Low Risk' : fraudScore <= 60 ? 'Medium Risk' : 'High Risk';

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      default: return 'SAFE';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'blocked': return 'close-circle';
      case 'pending': return 'time';
      default: return 'checkmark-circle';
    }
  };

  const recentTx = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
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
            <Text style={styles.protectedBadge}>AI Protected</Text>
          </View>
          <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.safetyIndicator}>
              <View style={[styles.safetyDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.safetyText}>Account Safe</Text>
            </View>
            <Text style={styles.encryptedText}>Encrypted</Text>
          </View>
        </Animated.View>

        <View style={styles.fraudScoreCard}>
          <View style={styles.fraudScoreHeader}>
            <Text style={styles.fraudScoreTitle}>Fraud Susceptibility Score</Text>
            <Text style={[styles.fraudScoreValue, { color: getScoreColor() }]}>{fraudScore}/100</Text>
          </View>
          <View style={styles.fraudScoreMeter}>
            <View style={styles.fraudScoreBg}>
              <View style={[styles.fraudScoreFill, { width: `${fraudScore}%`, backgroundColor: getScoreColor() }]} />
            </View>
          </View>
          <Text style={[styles.fraudScoreLabel, { color: getScoreColor() }]}>{getScoreLabel()}</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/send-money')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="send" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/qr-scanner')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="qr-code" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Scan & Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-money')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="wallet" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fraudTipsCard} onPress={() => router.push('/report-fraud')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fraudTipsTitle}>Recent Fraud Alert</Text>
            <Text style={styles.fraudTipsText}>Beware of fake UPI apps! Always verify merchant details before payment.</Text>
          </View>
          <Ionicons name="megaphone" size={24} color="#ef4444" />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {recentTx.map((tx: any) => {
            const riskColor = getRiskColor(tx.risk_level);
            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.transactionCard}
                onPress={() => router.push({
                  pathname: '/transaction-detail',
                  params: {
                    id: tx.id?.toString(),
                    recipient: tx.receiver,
                    amount: tx.amount?.toString(),
                    status: tx.status,
                    riskLevel: getRiskLabel(tx.risk_level),
                    riskScore: tx.risk_score?.toString(),
                    timestamp: tx.timestamp,
                    city: tx.location?.city || 'Unknown',
                    upi_id: tx.upi_id || '',
                    fraud_reasons: JSON.stringify(tx.fraud_reasons || []),
                  }
                })}
              >
                <View style={styles.transactionLeft}>
                  <View style={[styles.txIcon, { backgroundColor: `${riskColor}20` }]}>
                    <Ionicons name={getStatusIcon(tx.status)} size={20} color={riskColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txRecipient}>{tx.receiver}</Text>
                    <Text style={styles.txTime}>{format(new Date(tx.timestamp), 'MMM dd, hh:mm a')}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.txAmount, { color: tx.status === 'blocked' ? '#ef4444' : '#fff' }]}>
                    -₹{tx.amount.toLocaleString('en-IN')}
                  </Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${riskColor}20` }]}>
                    <Text style={[styles.riskText, { color: riskColor }]}>
                      {tx.status === 'blocked' ? 'BLOCKED' : getRiskLabel(tx.risk_level)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tipsCard}>
          <Ionicons name="bulb" size={20} color="#f59e0b" />
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
  protectedBadge: { fontSize: 11, color: '#3b82f6', fontWeight: '600' },
  balanceAmount: { fontSize: 44, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  safetyIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  safetyDot: { width: 8, height: 8, borderRadius: 4 },
  safetyText: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  encryptedText: { fontSize: 11, color: '#6b7280' },
  fraudScoreCard: { marginHorizontal: 20, padding: 20, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', marginBottom: 16 },
  fraudScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fraudScoreTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', flex: 1 },
  fraudScoreValue: { fontSize: 24, fontWeight: 'bold' },
  fraudScoreMeter: { marginBottom: 8 },
  fraudScoreBg: { height: 10, backgroundColor: '#374151', borderRadius: 5, overflow: 'hidden' },
  fraudScoreFill: { height: '100%', borderRadius: 5 },
  fraudScoreLabel: { fontSize: 12, fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 16 },
  actionButton: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)' },
  actionText: { fontSize: 12, color: '#d1d5db', fontWeight: '600' },
  fraudTipsCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 16, gap: 12 },
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
  transactionRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskText: { fontSize: 9, fontWeight: 'bold' },
  tipsCard: { marginHorizontal: 20, marginBottom: 24, padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipText: { flex: 1, fontSize: 13, color: '#f59e0b', fontWeight: '500' },
});
