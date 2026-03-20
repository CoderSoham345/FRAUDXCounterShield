import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const FRAUD_NEWS = [
  { id: 1, title: 'New UPI Scam Alert: Fake Payment Apps', description: 'Fraudsters creating fake UPI apps to steal credentials. Always download from official stores.', severity: 'HIGH', icon: 'warning', color: '#ef4444' },
  { id: 2, title: 'WhatsApp OTP Scams Rising', description: 'Never share your OTP received via SMS or WhatsApp with anyone claiming to be bank officials.', severity: 'HIGH', icon: 'chatbubbles', color: '#ef4444' },
  { id: 3, title: 'QR Code Scam at Petrol Pumps', description: 'Scammers replacing legitimate QR codes with fake ones. Verify merchant details before scanning.', severity: 'MEDIUM', icon: 'qr-code', color: '#f59e0b' },
  { id: 4, title: 'Lottery/Prize Winner Fraud', description: 'Messages claiming you won a lottery asking for processing fees. These are fake.', severity: 'MEDIUM', icon: 'trophy', color: '#f59e0b' },
  { id: 5, title: 'Delivery Payment Scams', description: 'Fake delivery agents asking for payment via UPI. Always verify through official channels.', severity: 'HIGH', icon: 'bicycle', color: '#ef4444' },
  { id: 6, title: 'Investment Scheme Frauds', description: 'High-return investment schemes are often Ponzi schemes. Verify before investing.', severity: 'MEDIUM', icon: 'trending-up', color: '#f59e0b' },
];

const SAFETY_TIPS = [
  { id: 1, title: 'Never Share OTP', tip: 'OTP is only for you. No bank or payment app will ever ask for it.', icon: 'lock-closed' },
  { id: 2, title: 'Verify Merchant Details', tip: 'Always check merchant name and details before completing payment.', icon: 'shield-checkmark' },
  { id: 3, title: 'Use Official Apps Only', tip: 'Download payment apps only from Google Play Store or Apple App Store.', icon: 'download' },
  { id: 4, title: 'Check Transaction History', tip: 'Regularly monitor your transactions for any unauthorized activity.', icon: 'list' },
  { id: 5, title: 'Enable Two-Factor Auth', tip: 'Add extra security layer with 2FA on all payment apps.', icon: 'finger-print' },
];

export default function FraudNewsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fraud Alerts & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🚨</Text>
          <Text style={styles.bannerTitle}>Stay Alert, Stay Safe!</Text>
          <Text style={styles.bannerText}>Read daily fraud alerts and protect yourself</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📰 Latest Fraud Alerts</Text>
          {FRAUD_NEWS.map((news) => (
            <TouchableOpacity key={news.id} style={styles.newsCard}>
              <View style={[styles.newsIcon, { backgroundColor: `${news.color}20` }]}>
                <Ionicons name={news.icon as any} size={24} color={news.color} />
              </View>
              <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: `${news.color}20` }]}>
                    <Text style={[styles.severityText, { color: news.color }]}>{news.severity}</Text>
                  </View>
                </View>
                <Text style={styles.newsDescription}>{news.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Safety Tips</Text>
          {SAFETY_TIPS.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon as any} size={20} color="#3b82f6" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.reportCard}>
          <Ionicons name="megaphone" size={32} color="#ef4444" />
          <Text style={styles.reportTitle}>Report Fraud</Text>
          <Text style={styles.reportText}>Noticed suspicious activity? Report immediately</Text>
          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.reportButtonText}>Report Now</Text>
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
  banner: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 20, marginTop: 20, marginBottom: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.3)' },
  bannerEmoji: { fontSize: 48, marginBottom: 12 },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ef4444', marginBottom: 4 },
  bannerText: { fontSize: 14, color: '#f87171' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  newsCard: { flexDirection: 'row', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  newsIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  newsContent: { flex: 1 },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  newsTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 8 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: 'bold' },
  newsDescription: { fontSize: 13, color: '#9ca3af', lineHeight: 18 },
  tipCard: { flexDirection: 'row', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  tipIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#9ca3af', lineHeight: 18 },
  reportCard: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 20, marginBottom: 32, backgroundColor: '#1f2937', borderRadius: 16, borderWidth: 1, borderColor: '#374151' },
  reportTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 12, marginBottom: 6 },
  reportText: { fontSize: 14, color: '#9ca3af', marginBottom: 20 },
  reportButton: { backgroundColor: '#ef4444', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  reportButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
