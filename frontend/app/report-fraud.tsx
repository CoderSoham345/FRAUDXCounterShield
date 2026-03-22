import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportFraudScreen() {
  const router = useRouter();

  const openCyberCrime = () => {
    Linking.openURL('https://cybercrime.gov.in/Webform/Crime_NodalOfficer.aspx');
  };

  const openMaharashtraPortal = () => {
    Linking.openURL('https://cybercrime.gov.in/');
  };

  const callHelpline = () => {
    Linking.openURL('tel:1930');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Fraud</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🚨</Text>
          <Text style={styles.bannerTitle}>Report Cyber Fraud</Text>
          <Text style={styles.bannerText}>Help us stop fraudsters and protect others</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ Maharashtra Cyber Cell</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Official Cyber Crime Portal</Text>
            <Text style={styles.infoText}>National Cyber Crime Reporting Portal</Text>
            <TouchableOpacity style={styles.actionButton} onPress={openCyberCrime}>
              <Ionicons name="globe" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Visit cybercrime.gov.in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>24x7 Helpline</Text>
            <Text style={styles.infoText}>National Cyber Crime Helpline</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]} onPress={callHelpline}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Call 1930</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📧 Email</Text>
            <Text style={styles.infoText}>complaints.mh@cyberpolice.gov.in</Text>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f59e0b' }]} 
              onPress={() => Linking.openURL('mailto:complaints.mh@cyberpolice.gov.in')}
            >
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 How to Register Complaint</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Visit Cyber Crime Portal</Text>
              <Text style={styles.stepText}>Go to cybercrime.gov.in or call 1930</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select Complaint Type</Text>
              <Text style={styles.stepText}>Choose "Financial Fraud" → "UPI/Digital Payment Fraud"</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Fill Details</Text>
              <Text style={styles.stepText}>Provide transaction details, amount, UPI ID, date & time</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Upload Evidence</Text>
              <Text style={styles.stepText}>Screenshot of transaction, messages, call recordings</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Complaint Number</Text>
              <Text style={styles.stepText}>Save the acknowledgment number for tracking</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Required Information</Text>
          <View style={styles.requirementCard}>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.requirementText}>Transaction ID & Amount</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.requirementText}>UPI ID or Account Number</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.requirementText}>Date & Time of Transaction</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.requirementText}>Bank Statement or Screenshot</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.requirementText}>Fraudster Contact Details</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={openMaharashtraPortal}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="document-text" size={24} color="#3b82f6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>File Online Complaint</Text>
              <Text style={styles.quickActionText}>Register FIR online instantly</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={callHelpline}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="headset" size={24} color="#10b981" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Talk to Expert</Text>
              <Text style={styles.quickActionText}>24/7 Cyber Crime Helpline</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="time" size={24} color="#f59e0b" />
          <Text style={styles.warningText}>⚠️ Report within 24 hours for better chances of fund recovery</Text>
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
  infoCard: { backgroundColor: '#1f2937', padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  infoText: { fontSize: 14, color: '#9ca3af', marginBottom: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 8 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stepCard: { flexDirection: 'row', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumberText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  stepText: { fontSize: 13, color: '#9ca3af', lineHeight: 18 },
  requirementCard: { backgroundColor: '#1f2937', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#374151', gap: 12 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requirementText: { fontSize: 14, color: '#d1d5db' },
  quickActionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quickActionContent: { flex: 1 },
  quickActionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  quickActionText: { fontSize: 13, color: '#9ca3af' },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 12, marginHorizontal: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  warningText: { flex: 1, fontSize: 13, color: '#f59e0b', fontWeight: '600', lineHeight: 18 },
});
