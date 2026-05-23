import { router, Stack, useSegments } from 'expo-router';
import { View } from 'react-native';

import { CAREGIVER_TABS, TabBar } from '@/components';

// 자녀 시점 라우트 그룹 — Stack + 하단 TabBar (부모님/알림/설정)
// [parentId] 하위 진입 시에는 TabBar 숨김 ([parentId]/_layout이 별도 셸 제공)
export default function CaregiverLayout() {
  const segments = useSegments() as string[];
  // segments 예: ['(caregiver)', 'parents'] | ['(caregiver)', '[parentId]', 'home']
  const currentTab = segments[1] ?? 'parents';
  const isParentScoped = currentTab === '[parentId]';

  // 탭 ID → 라우트 매핑
  const onTabPress = (tab: string) => {
    if (tab === 'parents') router.replace('/(caregiver)/parents');
    else if (tab === 'notifications') router.replace('/(caregiver)/notifications');
    else if (tab === 'settings') router.replace('/(caregiver)/settings');
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {!isParentScoped && (
        <TabBar tabs={CAREGIVER_TABS} activeTab={currentTab} onTabPress={onTabPress} />
      )}
    </View>
  );
}
