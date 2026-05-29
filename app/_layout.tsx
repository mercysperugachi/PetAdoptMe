import { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from 'expo-router';

import { supabase } from '@/src/core/config/supabase';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isInitializing, setIsInitializing] = useState(true);

  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
        } as any);
      }

      setIsInitializing(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
          } as any);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timeout = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [
    user,
    segments,
    isInitializing,
    navigationState?.key,
  ]);

  // Pantalla de carga
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🐾</Text>

        <Text style={styles.title}>
          PetAdoptMe
        </Text>

        <Text style={styles.subtitle}>
          Conectando mascotas con familias
        </Text>

        <ActivityIndicator
          size="large"
          color="#0F766E"
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 72,
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },

  loader: {
    marginTop: 10,
  },
});