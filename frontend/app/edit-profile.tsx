import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'Rajesh Kumar'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{user?.mobile || '+91 9876543210'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>rajesh.k@email.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>15 Aug 1995</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>Andheri West, Mumbai 400053</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bank Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank Name</Text>
            <Text style={styles.infoValue}>HDFC Bank</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Number</Text>
            <Text style={styles.infoValue}>XXXX XXXX 4567</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>IFSC Code</Text>
            <Text style={styles.infoValue}>HDFC0001234</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>Savings</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Location</Text>
            <Text style={styles.infoValue}>📍 Mumbai, Maharashtra</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Usual Location</Text>
            <Text style={styles.infoValue}>Mumbai (Verified)</Text>
          </View>
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons name="location" size={16} color="#3b82f6" />
            <Text style={styles.linkText}>Update Location</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Security Settings</Text>
        <View style={styles.infoCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Transaction alerts</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Biometric Login</Text>
              <Text style={styles.settingDesc}>Fingerprint / Face ID</Text>
            </View>
            <Switch value={biometric} onValueChange={setBiometric} />
          </View>
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons name="key" size={16} color="#3b82f6" />
            <Text style={styles.linkText}>Change PIN</Text>
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
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#3b82f6', borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12, marginTop: 8 },
  infoCard: { backgroundColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  infoLabel: { fontSize: 14, color: '#9ca3af' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12 },
  linkText: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 2 },
  settingDesc: { fontSize: 12, color: '#6b7280' },
});
