import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Loading } from '@/components/primitives';
import { useSessionStore } from '@/stores';

const REDIRECT_DELAY_MS = 300;

// MVP 로그인 화면 — UI만 보여주고 짧은 지연 후 역할 선택으로 자동 이동
export default function Login() {
  const router = useRouter();
  const isDemoMode = useSessionStore((s) => s.isDemoMode);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/role-select');
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [router]);

  // 카카오·휴대폰 버튼 — MVP에서는 둘 다 동일하게 역할 선택으로 이동
  const goNext = () => router.replace('/(auth)/role-select');

  return (
    <View className="flex-1 bg-bg items-center justify-center px-6">
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center shadow-md mb-4">
          <Text className="text-4xl">💊</Text>
        </View>
        <Text className="text-3xl font-extrabold text-text">엄마약</Text>
        <Text className="text-sm text-text-soft mt-2">가족 약 관리, 안심하고</Text>
      </View>

      <Loading text="잠시만 기다려주세요..." />

      <View className="w-full mt-8 gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={goNext}
          className="w-full bg-warning py-4 rounded-md items-center"
        >
          <Text className="text-base font-bold text-text">카카오로 시작</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={goNext}
          className="w-full bg-surface border border-border py-4 rounded-md items-center"
        >
          <Text className="text-base font-bold text-text">휴대폰으로 시작</Text>
        </Pressable>
      </View>

      {isDemoMode && (
        <Text className="text-xs text-text-mute mt-8">데모 모드 · 로그인 없이 진행</Text>
      )}
    </View>
  );
}
