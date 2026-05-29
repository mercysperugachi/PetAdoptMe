import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { supabase } from '@/src/core/config/supabase';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  // 🔴 CORRECCIÓN ZUSTAND: Extraemos los estados individualmente para evitar el loop infinito
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isInitializing, setIsInitializing] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  
  // 🔴 CORRECCIÓN EXPO ROUTER: Saber si la navegación ya está lista
  const navigationState = useRootNavigationState();

  // 1. Escuchar los cambios de sesión en Supabase
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id } as any);
      }
      setIsInitializing(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id } as any);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Proteger las rutas (AuthGuard)
  useEffect(() => {
    if (isInitializing) return;
    
    // Si la navegación de Expo no ha cargado, no hacemos nada todavía
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Usamos setTimeout para asegurar que React termine su ciclo actual antes de saltar de pantalla
    const timeout = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [user, segments, isInitializing, navigationState?.key]);

  // Pantalla de carga temporal
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  // 3. Renderizar el Stack principal
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}