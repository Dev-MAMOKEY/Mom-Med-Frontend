import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { SafetyBanner } from '@/components/domain';
import { EmptyState, Loading } from '@/components/primitives';
import { useMedicationsWithSafety } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

// 자녀 → 부모 약장 화면 (F2 데모 핵심) — useMedicationsWithSafety로 약장+사전 안전점검을 동시에 fetch
export default function MedsScreen() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const displayName = useCurrentParentStore((s) => s.displayName);
  const { data, isLoading, error } = useMedicationsWithSafety(parentId);

  // 헤더 뒤로가기 — 스택이 비어 있으면 부모 목록으로 fallback
  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(caregiver)/parents');
  };

  const title = `${displayName ?? '부모님'} 약장`;
  const header = <Header title={title} showBack onBack={onBack} />;

  if (isLoading) {
    return (
      <ScreenContainer header={header}>
        <View className="flex-1 items-center justify-center">
          <Loading text="약장을 불러오는 중..." />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !data) {
    return (
      <ScreenContainer header={header}>
        <EmptyState
          title="약장을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
        />
      </ScreenContainer>
    );
  }

  const { safety } = data;

  return (
    <ScreenContainer header={header}>
      <View className="px-5 pt-1 pb-6 gap-3">
        {/* 약장 전체 안전 점검 — ALLOW가 아닐 때만 풀배너 노출 */}
        {safety.overall_decision !== 'ALLOW' && (
          <SafetyBanner
            decision={safety.overall_decision}
            title="복용 중인 약 사이 주의가 필요해요"
          />
        )}
      </View>
    </ScreenContainer>
  );
}
