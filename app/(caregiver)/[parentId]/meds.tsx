import { router, useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import type { Medication } from '@/api/types';
import { Header, ScreenContainer } from '@/components';
import { MedicationList, SafetyBanner } from '@/components/domain';
import { EmptyState, Input, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useMedicationsWithSafety } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

const fabIconColor = tokens.color.neutral.surface.value;

// 자녀 → 부모 약장 화면 (F2 데모 핵심) — useMedicationsWithSafety로 약장+사전 안전점검을 동시에 fetch
export default function MedsScreen() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const displayName = useCurrentParentStore((s) => s.displayName);
  const { data, isLoading, error } = useMedicationsWithSafety(parentId);
  const [query, setQuery] = useState('');

  // 검색은 약 이름·영문 성분에 대해 trim·lowercase 부분 일치 (서버 사이드 검색은 useDrugSearch로 추후 교체)
  const meds = data?.list.medications ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meds;
    return meds.filter(
      (m) =>
        m.item_name.toLowerCase().includes(q) ||
        (m.main_ingr_en?.toLowerCase().includes(q) ?? false),
    );
  }, [meds, query]);

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

  // 약 카드 탭 → 약 상세 모달 (#37에서 실제 본문 구현)
  const onMedicationPress = (med: Medication) => {
    router.push({
      pathname: '/(modals)/medication-detail',
      params: { itemSeq: med.item_seq, parentId },
    });
  };

  // 약 추가 모달로 이동 — 빈 상태 CTA + FAB가 공유
  const goAddMedication = () => {
    router.push({
      pathname: '/(modals)/add-medication',
      params: { parentId },
    });
  };

  // 약장 자체가 비어 있을 때 — 검색·배너 없이 큰 빈 상태 + 등록 CTA
  if (meds.length === 0) {
    return (
      <ScreenContainer header={header}>
        <View className="flex-1 items-center justify-center">
          <EmptyState
            title="등록된 약이 없어요"
            description="첫 약을 추가해보세요"
            cta={{ label: '+ 약 추가', onPress: goAddMedication }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View className="flex-1 relative">
      <ScreenContainer header={header}>
        <View className="px-5 pt-1 pb-24 gap-3">
          {/* 약장 전체 안전 점검 — ALLOW가 아닐 때만 풀배너 노출 */}
          {safety.overall_decision !== 'ALLOW' && (
            <SafetyBanner
              decision={safety.overall_decision}
              title="복용 중인 약 사이 주의가 필요해요"
            />
          )}

          {/* 검색 바 — 약 이름이나 영문 성분으로 약장 내 클라이언트 필터링 */}
          <Input
            variant="search"
            placeholder="약 이름이나 성분 검색"
            value={query}
            onChangeText={setQuery}
          />

          {/* 약 카드 리스트 — 항응고제 자동 최상단 정렬은 MedicationList가 처리.
              검색 결과 0개일 때만 작은 EmptyState로 안내 (약장 자체 비어 있는 케이스는 위에서 처리됨) */}
          <MedicationList
            medications={filtered}
            onItemPress={onMedicationPress}
            emptyState={
              query ? (
                <EmptyState title={`"${query}" 검색 결과가 없어요`} />
              ) : undefined
            }
          />
        </View>
      </ScreenContainer>

      {/* FAB '+ 약 추가' — 우측 하단 고정 원형 버튼 (목업 v2 화면 5번 기준) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="약 추가"
        onPress={goAddMedication}
        className="absolute right-5 bottom-6 w-14 h-14 rounded-full bg-primary-bold items-center justify-center"
      >
        <Plus size={28} color={fabIconColor} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
