import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAuth } from './contexts/AuthContext';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function QRScannerScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [scanning, setScanning] = useState(false);
  const scanAnim = new Animated.Value(0);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Scanning animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLinePosition = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScanning(true);

    try {
      // Validate QR with backend
      const response = await fetch(`${BACKEND_URL}/api/scan/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qr_string: data }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        Alert.alert(
          '✅ Valid QR Code',
          `UPI: ${result.upi_id}\nName: ${result.name}\nAmount: ${result.amount ? '₹' + result.amount : 'Not specified'}`,
          [
            { text: 'Cancel', onPress: () => setScanned(false) },
            {
              text: 'Proceed to Pay',
              onPress: () => {
                router.push({
                  pathname: '/payment-confirm',
                  params: {
                    upiId: result.upi_id,
                    name: result.name,
                    amount: result.amount || '',
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('❌ Invalid QR Code', 'This is not a valid UPI payment QR code', [
          { text: 'Scan Again', onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate QR code', [
        { text: 'Try Again', onPress: () => setScanned(false) }
      ]);
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = () => {
    if (!upiId) {
      Alert.alert('Error', 'Please enter UPI ID');
      return;
    }

    router.push({
      pathname: '/payment-confirm',
      params: {
        upiId: upiId,
        name: 'Manual Entry',
        amount: amount || '',
      }
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan & Pay</Text>
        <TouchableOpacity onPress={() => setShowManual(!showManual)} style={styles.manualButton}>
          <Ionicons name={showManual ? "qr-code" : "keypad"} size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {!showManual ? (
        <View style={styles.scannerContainer}>
          <View style={styles.instructionBox}>
            <Ionicons name="scan" size={24} color="#3b82f6" />
            <Text style={styles.instructionText}>🤖 AI-Powered QR Scanner</Text>
            <Text style={styles.instructionSubtext}>Position QR code within frame</Text>
          </View>

          <View style={styles.scannerFrame}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLinePosition }] }
              ]}
            />

            {scanning && (
              <View style={styles.scanningOverlay}>
                <Text style={styles.scanningText}>🔍 Validating QR...</Text>
              </View>
            )}
          </View>

          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.rescanButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>AI validates UPI format & detects fraud</Text>
          </View>
        </View>
      ) : (
        <View style={styles.manualContainer}>
          <View style={styles.manualHeader}>
            <Ionicons name="create" size={32} color="#3b82f6" />
            <Text style={styles.manualTitle}>Enter UPI Details</Text>
            <Text style={styles.manualSubtitle}>Type UPI ID manually</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>UPI ID *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="at" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="example@upi"
                placeholderTextColor="#6b7280"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Amount (Optional)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>💡 Example: merchant@paytm, user@ybl</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleManualSubmit}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  manualButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.2)', alignItems: 'center', justifyContent: 'center' },
  scannerContainer: { flex: 1, paddingTop: 20, alignItems: 'center' },
  instructionBox: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
  instructionText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  instructionSubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  scannerFrame: { width: 300, height: 300, position: 'relative', overflow: 'hidden', borderRadius: 12 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3b82f6', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: '#3b82f6', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  scanningText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  rescanButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  rescanButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginTop: 20 },
  infoText: { flex: 1, fontSize: 13, color: '#10b981', fontWeight: '600' },
  manualContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  manualHeader: { alignItems: 'center', marginBottom: 40 },
  manualTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  manualSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  form: { marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#374151', gap: 12 },
  currency: { fontSize: 18, fontWeight: 'bold', color: '#9ca3af' },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  exampleBox: { marginTop: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  exampleText: { fontSize: 12, color: '#9ca3af' },
  proceedButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10b981', height: 56, borderRadius: 12, marginTop: 'auto', marginBottom: 20 },
  proceedButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  loadingText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
