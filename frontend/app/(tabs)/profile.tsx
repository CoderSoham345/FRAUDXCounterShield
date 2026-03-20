import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      '🚪 Logout',
      'Are you sure you want to logout from FraudX?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const personalInfo = [
    { icon: 'person', label: 'Full Name', value: user?.name || 'Rajesh Kumar' },
    { icon: 'call', label: 'Mobile', value: user?.mobile || '+91 9876543210' },
    { icon: 'mail', label: 'Email', value: 'rajesh.k@email.com' },
    { icon: 'calendar', label: 'Date of Birth', value: '15 Aug 1995' },
    { icon: 'location', label: 'Address', value: 'Andheri West, Mumbai 400053' },
  ];

  const bankDetails = [
    { label: 'Bank Name', value: 'HDFC Bank' },
    { label: 'Account Number', value: 'XXXX XXXX 4567' },
    { label: 'IFSC Code', value: 'HDFC0001234' },
    { label: 'Account Type', value: 'Savings Account' },
    { label: 'Branch', value: 'Andheri West, Mumbai' },
    { label: 'Card Expiry', value: '12/2028' },
    { label: 'CVV', value: 'XXX' },
  ];

  const securitySettings = [
    { icon: 'notifications', label: 'Transaction Alerts', value: 'Enabled', color: '#10b981' },
    { icon: 'lock-closed', label: 'Two-Factor Auth', value: 'Enabled', color: '#10b981' },
    { icon: 'finger-print', label: 'Biometric Login', value: 'Not Set', color: '#f59e0b' },
    { icon: 'shield-checkmark', label: 'AI Protection', value: 'Active', color: '#10b981' },
  ];

  const notifications = [
    { id: 1, icon: 'checkmark-circle', text: 'Payment of ₹250 to Grocery Store - Completed', time: '2 hours ago', color: '#10b981' },
    { id: 2, icon: 'alert-circle', text: 'Suspicious transaction blocked - ₹12,500', time: '1 day ago', color: '#ef4444' },
    { id: 3, icon: 'location', text: 'Login from new location detected', time: '2 days ago', color: '#f59e0b' },
  ];

  const privacySettings = [
    { label: 'Data Encryption', value: 'AES-256 Encrypted', icon: 'shield' },
    { label: 'Privacy Mode', value: 'Enhanced', icon: 'eye-off' },
    { label: 'Data Sharing', value: 'Disabled', icon: 'ban' },
    { label: 'Location Tracking', value: 'Only when using app', icon: 'location' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/edit-profile')}>
            <Ionicons name="create" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'R'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Rajesh Kumar'}</Text>
          <Text style={styles.userMobile}>{user?.mobile || '+91 9876543210'}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Personal Information</Text>
          <View style={styles.card}>
            {personalInfo.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#6b7280" />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏦 Bank Account Details</Text>
          <View style={styles.card}>
            {bankDetails.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Security Details</Text>
          <View style={styles.card}>
            {securitySettings.map((item, index) => (
              <View key={index} style={styles.securityRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
                <Text style={[styles.securityValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Recent Notifications</Text>
          <View style={styles.card}>
            {notifications.map((notif) => (
              <View key={notif.id} style={styles.notifRow}>
                <Ionicons name={notif.icon as any} size={24} color={notif.color} />
                <View style={styles.notifContent}>
                  <Text style={styles.notifText}>{notif.text}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Privacy Details</Text>
          <View style={styles.card}>
            {privacySettings.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#10b981" />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
                <Text style={[styles.infoValue, { color: '#10b981' }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Help & Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.helpRow} onPress={() => Alert.alert('💬 Live Chat', 'Connecting you to our support agent...\n\nDemo: This would open live chat in production.', [{ text: 'OK' }])}>
              <Ionicons name="chatbubbles" size={20} color="#3b82f6" />
              <Text style={styles.helpText}>Live Chat Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpRow} onPress={() => {
              Linking.openURL('tel:18001234567').catch(() => 
                Alert.alert('Call Support', 'Dial: 1800-123-4567')
              );
            }}>
              <Ionicons name="call" size={20} color="#3b82f6" />
              <Text style={styles.helpText}>Call: 1800-123-4567</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpRow} onPress={() => {
              Linking.openURL('mailto:support@fraudx.com?subject=FraudX Support Request').catch(() =>
                Alert.alert('Email Support', 'Email us at: support@fraudx.com')
              );
            }}>
              <Ionicons name="mail" size={20} color="#3b82f6" />
              <Text style={styles.helpText}>Email: support@fraudx.com</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpRow} onPress={() => Alert.alert('📚 FAQs', 'Common questions and answers about FraudX.\n\nDemo: This would open FAQ page in production.', [{ text: 'OK' }])}>
              <Ionicons name="help-circle" size={20} color="#3b82f6" />
              <Text style={styles.helpText}>FAQs & Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout from FraudX</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  profileCard: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 20, marginBottom: 16, backgroundColor: '#1f2937', borderRadius: 16, borderWidth: 1, borderColor: '#374151' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userMobile: { fontSize: 14, color: '#9ca3af', marginBottom: 8 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  verifiedText: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  card: { backgroundColor: '#1f2937', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#374151' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, color: '#9ca3af' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  securityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  securityValue: { fontSize: 13, fontWeight: '600' },
  notifRow: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  notifContent: { flex: 1 },
  notifText: { fontSize: 13, color: '#d1d5db', marginBottom: 4 },
  notifTime: { fontSize: 11, color: '#6b7280' },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#374151' },
  helpText: { flex: 1, fontSize: 14, color: '#d1d5db', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 8, marginBottom: 32, padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
