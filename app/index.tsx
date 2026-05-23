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
    // 디버그: hydration 단계 추적
    console.log('[Index] mount, hasHydrated=', useRoleStore.persist.hasHydrated(), 'role=', useRoleStore.getState().role);

    // 마운트와 subscribe 사이에 hydration이 이미 끝나 있을 수 있으므로 한 번 더 체크 (race 방지)
    if (useRoleStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsubFinish = useRoleStore.persist.onFinishHydration((state) => {
      console.log('[Index] onFinishHydration, role=', state?.role);
      setHydrated(true);
    });

    // AsyncStorage 실패 등으로 콜백이 영영 안 올 경우 대비 — 1.5초 fallback
    const fallback = setTimeout(() => {
      console.warn('[Index] hydration fallback fired — persist 이벤트 미수신');
      setHydrated(true);
    }, 1500);

    return () => {
      unsubFinish();
      clearTimeout(fallback);
    };
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
