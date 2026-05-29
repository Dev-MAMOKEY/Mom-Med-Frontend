import '@/styles/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PhoneFrame } from '@/components/PhoneFrame';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('@/assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Bold': require('@/assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('@/assets/fonts/Pretendard-ExtraBold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider는 가장 바깥 — TabBar, AppSheet 등이 useSafeAreaInsets로
          노치·홈 인디케이터 등 디바이스 안전영역 값을 받는다. */}
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PhoneFrame>
            {/* BottomSheetModalProvider는 PhoneFrame 안쪽이어야 함 — portal이 phone frame 너머로 튀어나가지 않도록 */}
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="demo" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(parent)" />
                <Stack.Screen name="(caregiver)" />
                <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
              </Stack>
            </BottomSheetModalProvider>
          </PhoneFrame>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
