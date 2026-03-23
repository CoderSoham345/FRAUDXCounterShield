import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { format } from 'date-fns';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const FALLBACK_TRANSACTIONS = [
  { id: '1', receiver: 'Grocery Store', amount: 250, timestamp: new Date(Date.now() - 2*3600000).toISOString(), risk_level: 'low', risk_score: 10, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [], ai_analysis: '' },
  { id: '2', receiver: 'Amazon', amount: 799, timestamp: new Date(Date.now() - 5*3600000).toISOString(), risk_level: 'low', risk_score: 15, status: 'completed', location: { city: 'Mumbai' }, fraud_reasons: [], ai_analysis: '' },
  { id: '3', receiver: 'Unknown Merchant', amount: 12500, timestamp: new Date(Date.now() - 86400000).toISOString(), risk_level: 'high', risk_score: 90, status: 'blocked', location: { city: 'Delhi' }, fraud_reasons: ['High amount', 'Unknown merchant'], ai_analysis: '' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>(FALLBACK_TRANSACTIONS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!token || token === 'demo-token') return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setTransactions(data);
        }
      }
    } catch (error) {
      console.log('Using fallback transaction data');
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'blocked': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const riskColor = getRiskColor(item.risk_level);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => router.push({
          pathname: '/transaction-detail',
          params: {
            id: item.id?.toString(),
            recipient: item.receiver,
            amount: item.amount?.toString(),
            status: item.status,
            riskLevel: getRiskLabel(item.risk_level),
            riskScore: item.risk_score?.toString(),
            timestamp: item.timestamp,
            city: item.location?.city || 'Unknown',
            upi_id: item.upi_id || '',
            fraud_reasons: JSON.stringify(item.fraud_reasons || []),
          }
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.transactionLeft}>
            <View style={[styles.txIcon, { backgroundColor: `${riskColor}20` }]}>
              <Ionicons
                name={item.status === 'blocked' ? 'close-circle' : item.status === 'pending' ? 'time' : 'arrow-up'}
                size={20}
                color={riskColor}
              />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txRecipient}>{item.receiver}</Text>
              <Text style={styles.txTime}>{format(new Date(item.timestamp), 'MMM dd, yyyy · hh:mm a')}</Text>
              <Text style={styles.txLocation}>
                <Ionicons name="location-outline" size={12} color="#6b7280" />
                {' '}{item.location?.city || 'Unknown'}
              </Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={styles.txAmount}>-₹{item.amount?.toLocaleString('en-IN')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.riskSection}>
          <View style={styles.riskMeter}>
            <View style={styles.riskMeterBg}>
              <View style={[styles.riskMeterFill, { width: `${item.risk_score}%`, backgroundColor: riskColor }]} />
            </View>
            <Text style={styles.riskScore}>Risk Score: {item.risk_score}/100</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: `${riskColor}20` }]}>
            <Text style={[styles.riskText, { color: riskColor }]}>{getRiskLabel(item.risk_level)}</Text>
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
  };

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
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
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
  riskMeterFill: { height: '100%', borderRadius: 4 },
  riskScore: { fontSize: 10, color: '#9ca3af' },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  riskText: { fontSize: 12, fontWeight: 'bold' },
  reasonsSection: { gap: 6 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reasonText: { fontSize: 12, color: '#d1d5db', flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
});
