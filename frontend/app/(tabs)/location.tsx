import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

export default function LocationScreen() {
  const [currentLocation, setCurrentLocation] = useState('Mumbai, Maharashtra');
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const locationHistory = [
    { id: 1, city: 'Mumbai', state: 'Maharashtra', time: 'Current', status: 'Safe', color: '#10b981' },
    { id: 2, city: 'Mumbai', state: 'Maharashtra', time: '2 hours ago', status: 'Safe', color: '#10b981' },
    { id: 3, city: 'Pune', state: 'Maharashtra', time: 'Yesterday', status: 'Verified', color: '#3b82f6' },
    { id: 4, city: 'Delhi', state: 'Delhi NCR', time: '2 days ago', status: 'Suspicious', color: '#ef4444' },
    { id: 5, city: 'Mumbai', state: 'Maharashtra', time: '3 days ago', status: 'Safe', color: '#10b981' },
  ];

  const updateLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        Alert.alert('✅ Success', 'Location updated successfully');
      } else {
        Alert.alert('Permission Denied', 'Please enable location access');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location Security</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <Text style={styles.currentEmoji}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>Current Location</Text>
              <Text style={styles.currentLocation}>{currentLocation}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✅ Safe</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={updateLocation} disabled={loading}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.updateButtonText}>{loading ? 'Updating...' : 'Update Location'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Location Tracking</Text>
              <Text style={styles.settingDesc}>Monitor for fraud detection</Text>
            </View>
            <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
          </View>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Location Alerts</Text>
              <Text style={styles.settingDesc}>Notify on new location</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>📍 Location History</Text>
        {locationHistory.map((loc) => (
          <View key={loc.id} style={styles.historyCard}>
            <View style={[styles.historyIcon, { backgroundColor: `${loc.color}20` }]}>
              <Ionicons name="location" size={24} color={loc.color} />
            </View>
            <View style={styles.historyContent}>
              <Text style={styles.historyCity}>{loc.city}, {loc.state}</Text>
              <Text style={styles.historyTime}>{loc.time}</Text>
            </View>
            <View style={[styles.historyBadge, { backgroundColor: `${loc.color}20` }]}>
              <Text style={[styles.historyStatus, { color: loc.color }]}>{loc.status}</Text>
            </View>
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>We track location only during transactions to prevent fraud. Your privacy is protected.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  currentCard: { backgroundColor: '#1f2937', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  currentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  currentEmoji: { fontSize: 32 },
  currentLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  currentLocation: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statusBadge: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#10b981' },
  updateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 12 },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  settingsCard: { backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  settingDesc: { fontSize: 12, color: '#6b7280' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  historyIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  historyContent: { flex: 1 },
  historyCity: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  historyTime: { fontSize: 12, color: '#9ca3af' },
  historyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  historyStatus: { fontSize: 12, fontWeight: 'bold' },
  infoBox: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, marginTop: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  infoText: { flex: 1, fontSize: 13, color: '#9ca3af', lineHeight: 18 },
});
