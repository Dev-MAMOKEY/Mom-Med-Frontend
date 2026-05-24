import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParentSwitcher } from '@/components/domain';
import { useParents } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// [parentId] 부모 컨텍스트 — URL ↔ store 동기화 + 헤더 ParentSwitcher (탭 전환과 무관하게 유지)
export default function ParentScopedLayout() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const router = useRouter();
  const setParent = useCurrentParentStore((s) => s.setParent);
  const { data } = useParents();
  const parents = data?.parents ?? [];

  useEffect(() => {
    if (!parentId || !data) return;
    const found = data.parents.find((p) => p.parent_id === parentId);
    if (found) setParent(found.parent_id, found.display_name);
  }, [parentId, data, setParent]);

  // 부모 전환 — URL 갈아끼기 (store는 useEffect로 자동 동기화)
  const handleSwitch = (newParentId: string) => {
    router.replace({
      pathname: '/(caregiver)/[parentId]/home',
      params: { parentId: newParentId },
    });
  };

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-bg">
        <View className="px-5 pt-4 pb-3">
          <ParentSwitcher
            currentParentId={parentId ?? ''}
            parents={parents}
            onSwitch={handleSwitch}
          />
        </View>
      </SafeAreaView>
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}
