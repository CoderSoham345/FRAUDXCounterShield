import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const transaction = {
    id: 'TXN1234567890',
    recipient: '🛒 Grocery Store',
    amount: 250,
    timestamp: new Date(),
    status: 'Completed',
    riskLevel: 'SAFE',
    riskScore: 10,
    location: 'Mumbai, Maharashtra',
    paymentMethod: 'UPI',
    upiId: 'grocery@paytm',
    accountDetails: {
      bank: 'HDFC Bank',
      accountNumber: 'XXXX XXXX 4567',
      ifsc: 'HDFC0001234',
    },
    recipientDetails: {
      name: 'Metro Grocery Store',
      mobile: '+91 98765XXXXX',
      address: 'Andheri West, Mumbai',
    },
    aiInsight: 'This is a regular merchant transaction with typical amount pattern. No suspicious activity detected.',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statusCard}>
          <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          <Text style={styles.statusTitle}>Payment Successful</Text>
          <Text style={styles.amount}>-₹{transaction.amount.toLocaleString('en-IN')}</Text>
          <Text style={styles.timestamp}>{format(transaction.timestamp, 'dd MMM yyyy, hh:mm a')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💸 Transaction Information</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transaction.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid To</Text>
              <Text style={styles.detailValue}>{transaction.recipient}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>UPI ID</Text>
              <Text style={styles.detailValue}>{transaction.upiId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>📍 {transaction.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏦 Account Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Name</Text>
              <Text style={styles.detailValue}>{transaction.accountDetails.bank}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <Text style={styles.detailValue}>{transaction.accountDetails.accountNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>IFSC Code</Text>
              <Text style={styles.detailValue}>{transaction.accountDetails.ifsc}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Recipient Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{transaction.recipientDetails.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mobile</Text>
              <Text style={styles.detailValue}>{transaction.recipientDetails.mobile}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{transaction.recipientDetails.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Security Analysis</Text>
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View style={styles.riskBadge}>
                <Text style={styles.riskText}>✅ {transaction.riskLevel}</Text>
              </View>
              <Text style={styles.riskScore}>Risk Score: {transaction.riskScore}/100</Text>
            </View>
            <View style={styles.riskMeter}>
              <View style={[styles.riskMeterFill, { width: `${transaction.riskScore}%`, backgroundColor: '#10b981' }]} />
            </View>
            <View style={styles.aiInsightBox}>
              <Ionicons name="sparkles" size={20} color="#3b82f6" />
              <Text style={styles.aiInsightText}>{transaction.aiInsight}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Share Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollView: { flex: 1 },
  statusCard: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 20, marginTop: 20, marginBottom: 16, backgroundColor: '#1f2937', borderRadius: 16, borderWidth: 1, borderColor: '#374151' },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#10b981', marginTop: 16, marginBottom: 8 },
  amount: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  timestamp: { fontSize: 14, color: '#9ca3af' },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  card: { backgroundColor: '#1f2937', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#374151' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  detailLabel: { fontSize: 14, color: '#9ca3af' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'right', flex: 1, marginLeft: 16 },
  riskCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  riskBadge: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  riskText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  riskScore: { fontSize: 14, color: '#10b981', fontWeight: '600' },
  riskMeter: { height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  riskMeterFill: { height: '100%' },
  aiInsightBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  aiInsightText: { flex: 1, fontSize: 13, color: '#d1d5db', lineHeight: 18 },
  actionButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 32 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
});
