import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
        animation: 'slide_from_right'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="send-money" />
        <Stack.Screen 
          name="fraud-alert" 
          options={{
            presentation: 'transparentModal',
            animation: 'fade'
          }} 
        />
        <Stack.Screen name="account-frozen" />
      </Stack>
    </AuthProvider>
  );
}
