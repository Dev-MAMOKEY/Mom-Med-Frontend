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
  // 정확한 다음 약 시간 계산은 Phase 2 알람 시스템 — 지금은 약장 첫 약 표시
  const nextMedication = data?.list.medications[0];

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

        <View className="bg-primary-soft rounded-2xl p-5">
          <Text className="text-xs font-bold text-primary-bold">다음 약</Text>
          <Text className="text-xl font-extrabold text-text mt-1">
            {nextMedication?.item_name ?? '예정된 약 없음'}
          </Text>
          {nextMedication?.dosage_schedule && (
            <Text className="text-sm text-text-soft mt-1">
              {nextMedication.dosage_schedule}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
