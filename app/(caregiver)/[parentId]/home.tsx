import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SafetyBanner } from '@/components/domain';
import { Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useMedicationsWithSafety } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

const fabIconColor = tokens.color.neutral.surface.value;

// 부모 홈 — 인사 + 오늘 알람 카운트 (다음 약 카드·위험 배너·FAB는 후속 커밋)
export default function ParentHome() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const router = useRouter();
  const displayName = useCurrentParentStore((s) => s.displayName);
  const { data, isLoading } = useMedicationsWithSafety(parentId ?? '');

  // 약 추가 모달은 #39에서 본문·라우트 추가 — 추가되면 ts-expect-error 정리
  const goAddMedication = () =>
    router.push({
      // @ts-expect-error: /(modals)/add-medication 라우트는 #39에서 추가됨
      pathname: '/(modals)/add-medication',
      params: { parentId: parentId ?? '' },
    });

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
  const decision = data?.safety.overall_decision;
  const showSafetyBanner = decision === 'WARN' || decision === 'BLOCK';

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

        {showSafetyBanner && (
          <SafetyBanner
            decision={decision}
            title="복용 중인 약 사이 주의가 필요해요"
            subtitle="약장 탭에서 자세히 확인해주세요"
          />
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="약 추가"
        onPress={goAddMedication}
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-primary-bold items-center justify-center shadow"
      >
        <Plus size={28} color={fabIconColor} />
      </Pressable>
    </View>
  );
}
