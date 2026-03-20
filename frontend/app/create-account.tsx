import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    bank: 'HDFC Bank',
    accountNumber: '',
    ifsc: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateAccount = async () => {
    if (!formData.name || !formData.mobile || !formData.accountNumber) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    const newUser = {
      mobile: formData.mobile,
      name: formData.name,
      balance: 45250,
      email: formData.email,
      bank: formData.bank,
      accountNumber: formData.accountNumber,
      ifsc: formData.ifsc,
    };

    await login('new-user-token', newUser);
    Alert.alert('✅ Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#6b7280"
              value={formData.name}
              onChangeText={(v) => updateField('name', v)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
              maxLength={10}
              value={formData.mobile}
              onChangeText={(v) => updateField('mobile', v)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bank Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Bank *</Text>
          <View style={styles.bankButtons}>
            {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'].map((bank) => (
              <TouchableOpacity
                key={bank}
                style={[styles.bankButton, formData.bank === bank && styles.bankButtonActive]}
                onPress={() => updateField('bank', bank)}
              >
                <Text style={[styles.bankButtonText, formData.bank === bank && styles.bankButtonTextActive]}>
                  {bank}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Number *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              value={formData.accountNumber}
              onChangeText={(v) => updateField('accountNumber', v)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>IFSC Code</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="code" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="e.g., HDFC0001234"
              placeholderTextColor="#6b7280"
              value={formData.ifsc}
              onChangeText={(v) => updateField('ifsc', v.toUpperCase())}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>Your bank details are encrypted and secure</Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#374151', gap: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  bankButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bankButton: { backgroundColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#374151' },
  bankButtonActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  bankButtonText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  bankButtonTextActive: { color: '#fff' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', marginBottom: 24 },
  infoText: { flex: 1, fontSize: 13, color: '#3b82f6' },
  createButton: { backgroundColor: '#10b981', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
