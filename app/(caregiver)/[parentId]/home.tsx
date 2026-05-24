import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Loading } from '@/components/primitives';
import { useMedicationsWithSafety } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// 부모 홈 — 인사 + 오늘 알람 카운트 (다음 약 카드·위험 배너·FAB는 후속 커밋)
export default function ParentHome() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const displayName = useCurrentParentStore((s) => s.displayName);
  const { data, isLoading } = useMedicationsWithSafety(parentId ?? '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Loading text="불러오는 중..." />
      </View>
    );
  }

  const alertCount = data?.safety.evidences.length ?? 0;

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-6 gap-3"
      >
        <View>
          <Text className="text-xs text-text-soft">
            {displayName ?? '부모님'}의 오늘
          </Text>
          <Text className="text-2xl font-extrabold text-text mt-1">
            {alertCount > 0 ? `알림 ${alertCount}건 있어요` : '오늘 알림이 없어요'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
