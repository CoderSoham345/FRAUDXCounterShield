import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SendMoneyScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        // For demo, we'll use mock city names
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        setLocation({
          city: randomCity,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } else {
        // Use default location if permission denied
        setLocation({
          city: 'Mumbai',
          lat: 19.0760,
          lng: 72.8777,
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocation({
        city: 'Mumbai',
        lat: 19.0760,
        lng: 72.8777,
      });
    }
  };

  const handlePayment = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountNum > (user?.balance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setAnalyzing(true);
    setLoading(true);

    try {
      // Initiate transaction with fraud detection
      const response = await fetch(`${BACKEND_URL}/api/transaction/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient,
          amount: amountNum,
          location: location || { city: 'Unknown', lat: 0, lng: 0 },
        }),
      });

      const data = await response.json();

      setAnalyzing(false);

      if (data.is_suspicious) {
        // Navigate to fraud alert screen
        router.push({
          pathname: '/fraud-alert',
          params: {
            transactionId: data.transaction_id,
            recipient,
            amount: amountNum.toString(),
            riskScore: data.risk_score.toString(),
            riskLevel: data.risk_level,
            fraudReasons: JSON.stringify(data.fraud_reasons),
            aiAnalysis: data.ai_analysis,
          },
        });
      } else {
        // Auto-approve low-risk transaction
        const confirmRes = await fetch(`${BACKEND_URL}/api/transaction/confirm?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_id: data.transaction_id,
            action: 'allow',
          }),
        });

        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          Alert.alert('Success', 'Payment completed successfully', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
      console.error(error);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹{user?.balance?.toLocaleString('en-IN') || '0'}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recipient UPI ID / Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="name@upi or 9876543210"
                  placeholderTextColor="#6b7280"
                  value={recipient}
                  onChangeText={setRecipient}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.quickAmounts}>
                {['500', '1000', '5000', '10000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickAmountBtn}
                    onPress={() => setAmount(amt)}
                  >
                    <Text style={styles.quickAmountText}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {location && (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color="#10b981" />
                <Text style={styles.locationText}>Location: {location.city}</Text>
              </View>
            )}
          </View>

          {analyzing && (
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.analyzingText}>AI analyzing transaction...</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.payButtonText}>Pay Securely</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  balanceCard: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#374151',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickAmountBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickAmountText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#10b981',
  },
  analyzingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginTop: 16,
  },
  analyzingText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    height: 56,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
