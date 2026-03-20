import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { format } from 'date-fns';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const DUMMY_TRANSACTIONS = [
  { id: '1', recipient: '🛒 Grocery Store', amount: 250, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 10, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [] },
  { id: '2', recipient: '📦 Amazon', amount: 799, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 15, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [] },
  { id: '3', recipient: '❓ Unknown Merchant', amount: 12500, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), riskLevel: 'HIGH', riskScore: 90, status: 'blocked', location: { city: 'Delhi' }, fraud_reasons: ['High amount', 'Unknown merchant'] },
  { id: '4', recipient: '🍔 Swiggy', amount: 1200, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), riskLevel: 'MEDIUM', riskScore: 50, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: ['Late night transaction'] },
  { id: '5', recipient: '📍 Fuel Station Delhi', amount: 5000, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), riskLevel: 'HIGH', riskScore: 85, status: 'blocked', location: { city: 'Delhi' }, fraud_reasons: ['New location', 'High amount'] },
  { id: '6', recipient: '🏪 Local Store', amount: 450, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 12, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [] },
  { id: '7', recipient: '💊 Medical Store', amount: 890, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 8, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [] },
  { id: '8', recipient: '🎬 Movie Tickets', amount: 1500, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 20, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [] },
  { id: '9', recipient: '⚡ Electricity Bill', amount: 3200, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), riskLevel: 'SAFE', riskScore: 5, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [] },
  { id: '10', recipient: '🏦 Credit Card Payment', amount: 15000, timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), riskLevel: 'MEDIUM', riskScore: 45, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: ['High amount'] },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [transactions, setTransactions] = useState(DUMMY_TRANSACTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo-token') {
      fetchTransactions();
    }
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/history?token=${token}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setTransactions(data);
      }
    } catch (error) {
      console.log('Using dummy data');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (token && token !== 'demo-token') {
      fetchTransactions();
    } else {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'SAFE': case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'blocked': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.transactionCard} onPress={() => router.push('/transaction-detail')}>
      <View style={styles.cardHeader}>
        <View style={styles.transactionLeft}>
          <View style={[styles.txIcon, { backgroundColor: `${getRiskColor(item.riskLevel)}20` }]}>
            <Ionicons name="arrow-up" size={20} color={getRiskColor(item.riskLevel)} />
          </View>
          <View style={styles.txDetails}>
            <Text style={styles.txRecipient}>{item.recipient}</Text>
            <Text style={styles.txTime}>{format(new Date(item.timestamp), 'MMM dd, yyyy · hh:mm a')}</Text>
            <Text style={styles.txLocation}>
              <Ionicons name="location-outline" size={12} color="#6b7280" />
              {' '}{item.location.city}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.txAmount}>-₹{item.amount.toLocaleString('en-IN')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.riskSection}>
        <View style={styles.riskMeter}>
          <View style={styles.riskMeterBg}>
            <View
              style={[
                styles.riskMeterFill,
                {
                  width: `${item.riskScore}%`,
                  backgroundColor: getRiskColor(item.riskLevel),
                },
              ]}
            />
          </View>
          <Text style={styles.riskScore}>Risk Score: {item.riskScore}/100</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(item.riskLevel)}20` }]}>
          <Text style={[styles.riskText, { color: getRiskColor(item.riskLevel) }]}>
            {item.riskLevel}
          </Text>
        </View>
      </View>

      {item.fraud_reasons && item.fraud_reasons.length > 0 && (
        <View style={styles.reasonsSection}>
          {item.fraud_reasons.map((reason: string, index: number) => (
            <View key={index} style={styles.reasonItem}>
              <Ionicons name="alert-circle" size={14} color="#f59e0b" />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{transactions.length} Total</Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerBadge: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  headerBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6' },
  listContainer: { padding: 20 },
  transactionCard: { backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  transactionLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txDetails: { flex: 1 },
  txRecipient: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4 },
  txTime: { fontSize: 12, color: '#9ca3af', marginBottom: 2 },
  txLocation: { fontSize: 12, color: '#6b7280' },
  transactionRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 18, fontWeight: 'bold', color: '#ef4444' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  riskSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  riskMeter: { flex: 1, marginRight: 12 },
  riskMeterBg: { height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  riskMeterFill: { height: '100%' },
  riskScore: { fontSize: 10, color: '#9ca3af' },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  riskText: { fontSize: 12, fontWeight: 'bold' },
  reasonsSection: { gap: 6 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reasonText: { fontSize: 12, color: '#d1d5db', flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
});
