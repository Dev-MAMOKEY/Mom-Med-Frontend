import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Evidence } from '@/api/types';
import { ScreenContainer } from '@/components';
import { PillImage, SafetyBanner } from '@/components/domain';
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

  // 비교 카드 — 충돌 약은 evidences의 conflicting_drug에서 첫 번째 발견 사용 (mock에선 동일 와파린 참조)
  const conflictingDrug = useMemo(
    () => evidences.find((e) => e.conflicting_drug)?.conflicting_drug,
    [evidences],
  );

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

  // BLOCK은 mockup의 SafetyBanner 기본 문구를 그대로 사용, WARN은 "약은 추가됐어요"로 사용자에게 상태를 명확히 안내
  const bannerSubtitle = decision === 'WARN' ? '약은 추가됐어요' : undefined;
  // ✕ 컬러는 decision에 맞춰 (BLOCK=danger, WARN=warning)
  const crossClass = decision === 'BLOCK' ? 'text-danger' : 'text-warning';
  const attemptedLabelClass = decision === 'BLOCK' ? 'text-danger' : 'text-warning';

  // 본문 — 사유·대처 안내·하단 액션은 후속 커밋에서 조립
  void params.medicationId;

  return (
    <ScreenContainer header={header}>
      <View className="px-5 pt-2 pb-24 gap-3">
        <SafetyBanner decision={decision} subtitle={bannerSubtitle} />

        {/* 약 비교 카드 — 복용중 약 ✕ 추가 시도 약. 둘 다 없으면 카드 자체를 숨김 */}
        {(conflictingDrug || attemptedDrug) && (
          <View className="bg-surface border border-border rounded-lg p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 items-center">
                <PillImage
                  drugName={conflictingDrug?.item_name ?? '?'}
                  size="sm"
                />
                <Text className="text-xs font-bold text-text mt-1.5 text-center" numberOfLines={1}>
                  {conflictingDrug?.item_name ?? '복용중 약'}
                </Text>
                <Text className="text-[10px] text-text-soft mt-0.5">복용 중</Text>
              </View>

              <Text className={`text-2xl px-3 ${crossClass}`}>✕</Text>

              <View className="flex-1 items-center">
                <PillImage
                  drugName={attemptedDrug?.item_name ?? params.itemSeq ?? '?'}
                  imageUrl={attemptedDrug?.pill_visual?.item_image}
                  size="sm"
                />
                <Text className="text-xs font-bold text-text mt-1.5 text-center" numberOfLines={1}>
                  {attemptedDrug?.item_name ?? '추가하려는 약'}
                </Text>
                <Text className={`text-[10px] mt-0.5 ${attemptedLabelClass}`}>
                  추가 시도
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
