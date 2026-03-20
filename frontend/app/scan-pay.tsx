import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanPayScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const scanAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scanLinePosition = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>📱 Align QR code within frame</Text>

        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLinePosition }] }]} />
          
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={120} color="rgba(59, 130, 246, 0.3)" />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          <Text style={styles.infoText}>AI will verify merchant before payment</Text>
        </View>

        <TouchableOpacity style={styles.manualButton}>
          <Ionicons name="keypad" size={20} color="#3b82f6" />
          <Text style={styles.manualButtonText}>Enter UPI ID Manually</Text>
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
  content: { flex: 1, alignItems: 'center', paddingTop: 40 },
  instruction: { fontSize: 16, color: '#9ca3af', marginBottom: 40 },
  scannerFrame: { width: 300, height: 300, position: 'relative', marginBottom: 40 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3b82f6', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#3b82f6', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  qrPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 24 },
  infoText: { fontSize: 13, color: '#10b981', fontWeight: '600' },
  manualButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  manualButtonText: { fontSize: 15, color: '#3b82f6', fontWeight: '600' },
});
