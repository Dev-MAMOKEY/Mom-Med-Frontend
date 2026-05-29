import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMenuButton, TabBar } from '@/components';
import { ParentSwitcher } from '@/components/domain';
import { useParents } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// 자녀 시점 부모 컨텍스트 탭바 — expo-router Tabs의 활성 라우트를 우리 TabBar에 연결
function ParentTabBar(props: BottomTabBarProps) {
  const route = props.state.routes[props.state.index];
  return (
    <TabBar
      activeTab={route.name}
      onTabPress={(tabId) => props.navigation.navigate(tabId as never)}
    />
  );
}

// [parentId] 부모 컨텍스트 — URL ↔ store 동기화 + ParentSwitcher 헤더 + 바텀탭 4개(홈·약장·질병·더보기)
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
      pathname: '/(caregiver)/[parentId]/notifications',
      params: { parentId: newParentId },
    });
  };

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-bg">
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <ParentSwitcher
              currentParentId={parentId ?? ''}
              parents={parents}
              onSwitch={handleSwitch}
            />
          </View>
          <AppMenuButton />
        </View>
      </SafeAreaView>
      <View className="flex-1">
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <ParentTabBar {...props} />}
        >
          <Tabs.Screen name="notifications" />
          <Tabs.Screen name="meds" />
          <Tabs.Screen name="conditions" />
          {/* dev008: more 자리에 settings — more.tsx 파일은 보존하되 탭 등록만 빠짐 */}
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>
    </View>
  );
}
