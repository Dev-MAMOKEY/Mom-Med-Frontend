import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Loading } from '@/components/primitives';
import { useRoleStore } from '@/stores';

// 앱 진입 가드 — zustand persist 복원 후 역할에 따라 홈/로그인으로 분기
export default function Index() {
  const role = useRoleStore((s) => s.role);
  const [hydrated, setHydrated] = useState(() => useRoleStore.persist.hasHydrated());

  useEffect(() => {
    // persist 복원이 비동기이므로 완료 시점 구독
    const unsub = useRoleStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Loading text="불러오는 중..." />
      </View>
    );
  }

  if (role === 'parent') return <Redirect href="/(parent)/home" />;
  if (role === 'caregiver') return <Redirect href="/(caregiver)/parents" />;
  return <Redirect href="/(auth)/login" />;
}
