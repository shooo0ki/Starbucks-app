import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { DBProvider } from '@/db/DBProvider';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/colors';

function RootLayoutNav() {
  const { session, isLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipes/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="recipes/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="recipes/[id]/edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="practice/orders" options={{ gestureEnabled: false }} />
      <Stack.Screen name="practice/question" options={{ gestureEnabled: false }} />
      <Stack.Screen name="practice/feedback" options={{ gestureEnabled: false }} />
      <Stack.Screen name="practice/result" options={{ gestureEnabled: false }} />
      <Stack.Screen name="review/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="review/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="wrong-answers" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DBProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </DBProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
