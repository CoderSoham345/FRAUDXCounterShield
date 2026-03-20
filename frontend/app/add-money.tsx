import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddMoneyScreen() {
  const router = useRouter();
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Enter valid amount');
      return;
    }
    if (pin !== '1234') {
      Alert.alert('⚠️ Security Check Failed', 'Incorrect PIN. Demo PIN is: 1234');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newBalance = (user?.balance || 0) + parseFloat(amount);
      updateBalance(newBalance);
      Alert.alert('✅ Success', `₹${amount} added to your account`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>₹{user?.balance?.toLocaleString('en-IN') || '0'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Enter Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.quickAmounts}>
            {['500', '1000', '5000', '10000'].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.quickButton}
                onPress={() => setAmount(amt)}
              >
                <Text style={styles.quickButtonText}>₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>🔒 Security PIN</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pin}
              onChangeText={setPin}
            />
          </View>
          <Text style={styles.pinHint}>💡 Demo PIN: 1234</Text>
        </View>

        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark" size={24} color="#10b981" />
          <Text style={styles.securityText}>Secured by AI fraud detection</Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddMoney}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>{loading ? 'Processing...' : 'Add Money Securely'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  balanceCard: { backgroundColor: '#1f2937', padding: 20, borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: '#374151' },
  balanceLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#374151', gap: 12 },
  currencySymbol: { fontSize: 20, fontWeight: 'bold', color: '#9ca3af' },
  input: { flex: 1, color: '#fff', fontSize: 20, fontWeight: 'bold' },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickButton: { flex: 1, backgroundColor: '#1f2937', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  quickButtonText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },
  pinHint: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  securityBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 24 },
  securityText: { flex: 1, fontSize: 14, color: '#10b981', fontWeight: '600' },
  addButton: { backgroundColor: '#10b981', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: 20 },
  addButtonDisabled: { opacity: 0.6 },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
