import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/welcome');
      }
    }
  }, [isLoading, token]);

  return null;
}
