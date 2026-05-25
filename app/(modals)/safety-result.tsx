import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import type { Evidence } from '@/api/types';
import { ScreenContainer } from '@/components';
import { EmptyState } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useDrugDetail } from '@/hooks';

const closeIconColor = tokens.color.neutral.text.value;

// 안전판정 결과 모달 — add-medication에서 BLOCK/WARN 결정 시 router.replace로 진입.
// evidences는 #39가 JSON.stringify로 params에 첨부, attempted drug는 itemSeq로 useDrugDetail 재조회 (params 부담 회피)
export default function SafetyResult() {
  const params = useLocalSearchParams<{
    decision: string;
    parentId: string;
    itemSeq: string;
    medicationId?: string;
    evidences?: string;
  }>();

  const decision = params.decision === 'BLOCK' || params.decision === 'WARN' ? params.decision : null;

  // evidences는 JSON.stringify된 문자열로 들어옴 — 파싱 실패 시 빈 배열로 폴백
  const evidences: Evidence[] = useMemo(() => {
    if (!params.evidences) return [];
    try {
      return JSON.parse(params.evidences) as Evidence[];
    } catch {
      return [];
    }
  }, [params.evidences]);

  const { data: attemptedDrug } = useDrugDetail(params.itemSeq ?? '');

  // 풀스크린 모달이라 닫기 X만 우측 정렬 (목업 v2 화면 8번 헤더 패턴)
  const header = (
    <View className="flex-row items-center justify-end px-5 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        onPress={() => router.back()}
        hitSlop={8}
      >
        <X size={24} color={closeIconColor} />
      </Pressable>
    </View>
  );

  // 잘못된 진입 — decision 누락이거나 알 수 없는 값
  if (!decision) {
    return (
      <ScreenContainer header={header}>
        <EmptyState
          title="결과를 표시할 수 없어요"
          description="다시 시도해주세요"
        />
      </ScreenContainer>
    );
  }

  // 본문 — 후속 커밋에서 SafetyBanner·비교 카드·사유·대처 안내·하단 액션 조립
  // void 참조로 unused 경고 방지 (다음 커밋에서 실제 사용)
  void evidences;
  void attemptedDrug;
  void params.medicationId;

  return (
    <ScreenContainer header={header}>
      <View className="px-5 pt-2 pb-24 gap-3" />
    </ScreenContainer>
  );
}
