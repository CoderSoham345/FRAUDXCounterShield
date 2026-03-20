import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const FRAUD_NEWS = [
  { id: 1, title: 'UPI Scam Alert: Fake Payment Apps', date: 'Today', description: 'Fraudsters creating fake UPI apps. Download only from official stores.', severity: 'HIGH', icon: 'warning', color: '#ef4444' },
  { id: 2, title: 'WhatsApp OTP Scams Rising', date: 'Today', description: 'Never share OTP with anyone claiming to be bank officials.', severity: 'HIGH', icon: 'chatbubbles', color: '#ef4444' },
  { id: 3, title: 'QR Code Scam at Petrol Pumps', date: 'Yesterday', description: 'Verify merchant details before scanning any QR code.', severity: 'MEDIUM', icon: 'qr-code', color: '#f59e0b' },
  { id: 4, title: 'Lottery Winner Fraud Alert', date: 'Yesterday', description: 'Messages claiming lottery wins are fake. Never pay processing fees.', severity: 'MEDIUM', icon: 'trophy', color: '#f59e0b' },
  { id: 5, title: 'Fake Delivery Payment Scams', date: '2 days ago', description: 'Verify delivery through official channels before making payment.', severity: 'HIGH', icon: 'bicycle', color: '#ef4444' },
  { id: 6, title: 'Investment Scheme Frauds', date: '2 days ago', description: 'High-return schemes are often Ponzi. Verify before investing.', severity: 'MEDIUM', icon: 'trending-up', color: '#f59e0b' },
  { id: 7, title: 'Credit Card Cloning Alert', date: '3 days ago', description: 'Use secure ATMs only. Cover PIN while entering.', severity: 'HIGH', icon: 'card', color: '#ef4444' },
  { id: 8, title: 'Job Scam Warning', date: '3 days ago', description: 'Never pay for job opportunities. Legitimate companies dont charge.', severity: 'MEDIUM', icon: 'briefcase', color: '#f59e0b' },
];

const FINANCE_NEWS = [
  { id: 1, title: 'RBI Increases UPI Transaction Limit', date: 'Today', description: 'Single transaction limit increased to ₹5 lakh for certain categories.', icon: 'trending-up', color: '#10b981' },
  { id: 2, title: 'New Digital Payment Guidelines', date: 'Yesterday', description: 'Enhanced security measures for all digital transactions announced.', icon: 'shield', color: '#3b82f6' },
  { id: 3, title: 'Bank Interest Rates Updated', date: '2 days ago', description: 'Savings account interest rates revised by major banks.', icon: 'cash', color: '#10b981' },
  { id: 4, title: 'Cryptocurrency Regulations', date: '3 days ago', description: 'New framework for crypto transactions under consideration.', icon: 'logo-bitcoin', color: '#f59e0b' },
];

export default function NewsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('fraud');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest News & Alerts</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fraud' && styles.tabActive]}
          onPress={() => setActiveTab('fraud')}
        >
          <Text style={[styles.tabText, activeTab === 'fraud' && styles.tabTextActive]}>🚨 Fraud Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'finance' && styles.tabActive]}
          onPress={() => setActiveTab('finance')}
        >
          <Text style={[styles.tabText, activeTab === 'finance' && styles.tabTextActive]}>💼 Finance News</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'fraud' ? (
          <View>
            {FRAUD_NEWS.map((news) => (
              <TouchableOpacity key={news.id} style={styles.newsCard}>
                <View style={[styles.newsIcon, { backgroundColor: `${news.color}20` }]}>
                  <Ionicons name={news.icon as any} size={24} color={news.color} />
                </View>
                <View style={styles.newsContent}>
                  <View style={styles.newsHeader}>
                    <Text style={styles.newsDate}>{news.date}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: `${news.color}20` }]}>
                      <Text style={[styles.severityText, { color: news.color }]}>{news.severity}</Text>
                    </View>
                  </View>
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <Text style={styles.newsDescription}>{news.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {FINANCE_NEWS.map((news) => (
              <TouchableOpacity key={news.id} style={styles.newsCard}>
                <View style={[styles.newsIcon, { backgroundColor: `${news.color}20` }]}>
                  <Ionicons name={news.icon as any} size={24} color={news.color} />
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsDate}>{news.date}</Text>
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <Text style={styles.newsDescription}>{news.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1f2937', alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  tabActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  tabTextActive: { color: '#fff' },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  newsCard: { flexDirection: 'row', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  newsIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  newsContent: { flex: 1 },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  newsDate: { fontSize: 12, color: '#6b7280' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: 'bold' },
  newsTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  newsDescription: { fontSize: 13, color: '#9ca3af', lineHeight: 18 },
});
