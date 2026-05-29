import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Evidence } from '@/api/types';
import { ScreenContainer } from '@/components';
import { PillImage, SafetyBanner, SafetyDetailCard } from '@/components/domain';
import { Button, EmptyState } from '@/components/primitives';
import { useDeleteMedication, useDrugDetail } from '@/hooks';

const TOAST_MS = 1500;

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
  const deleteMed = useDeleteMedication(params.parentId ?? '');

  // 인라인 토스트 — 제거 mutation 결과 안내용 (medication-detail·add-medication과 동일 패턴)
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  // 진입 시 Haptics — BLOCK은 Error, WARN은 Warning. 웹은 no-op
  useEffect(() => {
    if (params.decision === 'BLOCK') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (params.decision === 'WARN') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [params.decision]);

  // 비교 카드 — 충돌 약은 evidences의 conflicting_drug에서 첫 번째 발견 사용 (mock에선 동일 와파린 참조)
  const conflictingDrug = useMemo(
    () => evidences.find((e) => e.conflicting_drug)?.conflicting_drug,
    [evidences],
  );

  // SafetyDetailCard는 DUR/NB만 표시(컴포넌트 시그니처 한계). patient_class는 현재 mock 시나리오에 없음 — 필요해지면 컴포넌트 확장
  const displayEvidences = useMemo(
    () =>
      evidences.filter(
        (e): e is Evidence & { source: 'DUR' | 'NB' } => e.source !== 'patient_class',
      ),
    [evidences],
  );

  // dev008: 우측 상단 X 제거 — 하단 "알겠어요"/"확인했어요" 버튼으로 닫을 수 있어 중복.

  // 잘못된 진입 — decision 누락이거나 알 수 없는 값
  if (!decision) {
    return (
      <ScreenContainer>
        <EmptyState
          title="결과를 표시할 수 없어요"
          description="다시 시도해주세요"
        />
      </ScreenContainer>
    );
  }

  // BLOCK은 mockup의 SafetyBanner 기본 문구를 그대로 사용, WARN은 "약은 추가됐어요"로 사용자에게 상태를 명확히 안내
  const bannerSubtitle = decision === 'WARN' ? '약은 추가됐어요' : undefined;

  // 닫기 액션 — BLOCK "알겠어요", WARN "확인했어요" 공용
  const handleConfirm = () => {
    if (router.canGoBack()) router.back();
  };

  // WARN의 "제거" — useDeleteMedication.mutate. medication_id가 없으면(데이터 손실) 그냥 닫기
  const handleRemove = () => {
    if (!params.medicationId) {
      handleConfirm();
      return;
    }
    deleteMed.mutate(params.medicationId, {
      onSuccess: () => {
        setToast(`${attemptedDrug?.item_name ?? '약'}을(를) 제거했어요`);
        setTimeout(handleConfirm, TOAST_MS);
      },
      onError: () => setToast('제거에 실패했어요'),
    });
  };

  return (
    <View className="flex-1 relative">
      <ScreenContainer>
        <View className="px-5 pt-2 pb-24 gap-3">
        <SafetyBanner
          decision={decision}
          subtitle={bannerSubtitle}
        >
          {/* 약 비교 — 배너와 같은 색조 안에 합쳐서 "하나의 덩어리"로 인지되게.
              빨간 배경 위라 글자/구분선은 흰색 계열로 통일. */}
          {(conflictingDrug || attemptedDrug) && (
            <View className="flex-row items-center justify-between pt-4 border-t border-surface/30">
              <View className="flex-1 items-center">
                <PillImage
                  drugName={conflictingDrug?.item_name ?? '?'}
                  size="sm"
                />
                <Text className="text-xs font-bold text-surface mt-1.5 text-center" numberOfLines={1}>
                  {conflictingDrug?.item_name ?? '복용중 약'}
                </Text>
                <Text className="text-[10px] text-surface/80 mt-0.5">복용 중</Text>
              </View>

              <Text className="text-2xl px-3 text-surface">✕</Text>

              <View className="flex-1 items-center">
                <PillImage
                  drugName={attemptedDrug?.item_name ?? params.itemSeq ?? '?'}
                  imageUrl={attemptedDrug?.pill_visual?.item_image}
                  size="sm"
                />
                <Text className="text-xs font-bold text-surface mt-1.5 text-center" numberOfLines={1}>
                  {attemptedDrug?.item_name ?? '추가하려는 약'}
                </Text>
                <Text className="text-[10px] text-surface/80 mt-0.5">
                  추가 시도
                </Text>
              </View>
            </View>
          )}
        </SafetyBanner>

        {/* 사유 카드 리스트 — 별도 헤더 없이 카드 안 뱃지 좌측에 컨텍스트 라벨(차단/주의 사유) 노출 */}
        {displayEvidences.length > 0 && (
          <View className="gap-2">
            {displayEvidences.map((e, idx) => (
              <SafetyDetailCard
                key={`${e.source}-${idx}`}
                source={e.source}
                severity={e.severity}
                message={e.message}
                citation={e.citation}
                citationSource={e.citation_source}
                contextLabel={
                  idx === 0
                    ? decision === 'BLOCK'
                      ? '차단 사유'
                      : '주의 사유'
                    : undefined
                }
              />
            ))}
          </View>
        )}

        {/* 대처 안내 — 흰 카드, 차단 사유 카드와 같은 톤(미니멀)으로 통일. */}
        <View className="bg-surface rounded-lg p-4 mt-1">
          <Text className="text-sm font-bold text-text mb-2">
            어떻게 해야 하나요?
          </Text>
          <Text className="text-sm text-text-soft leading-relaxed">
            {decision === 'BLOCK'
              ? '처방하신 의사·약사에게 알리고 대체약을 상의해주세요.'
              : '주치의나 약사에게 이 결과를 보여주고 함께 복용해도 괜찮은지 확인해주세요.'}
          </Text>
        </View>
        </View>
      </ScreenContainer>

      {/* 하단 액션 — v1.1: BLOCK "알겠어요" 단일 (mockup의 bg-text 다크 버튼), WARN "확인했어요"/"제거" 이중 */}
      <View className="absolute bottom-6 left-0 right-0 px-5">
        {decision === 'BLOCK' ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleConfirm}
            className="w-full bg-text rounded-md py-4 items-center justify-center"
          >
            <Text className="text-base font-bold text-surface">알겠어요</Text>
          </Pressable>
        ) : (
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                label="확인했어요"
                variant="secondary"
                onPress={handleConfirm}
                disabled={deleteMed.isPending}
              />
            </View>
            <View className="flex-1">
              <Button
                label="제거"
                variant="primary"
                loading={deleteMed.isPending}
                onPress={handleRemove}
              />
            </View>
          </View>
        )}
      </View>

      {/* 인라인 토스트 — 제거 mutation 결과 */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-text rounded-md px-4 py-3">
          <Text className="text-surface font-bold text-center">{toast}</Text>
        </View>
      )}
    </View>
  );
}
