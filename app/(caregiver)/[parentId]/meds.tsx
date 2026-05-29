import { router, useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Medication } from '@/api/types';
import { ScreenContainer } from '@/components';
import { MedicationList, SafetyBanner } from '@/components/domain';
import { EmptyState, Input, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useAddMedicationFlow, useMedicationsWithWarnings } from '@/hooks';
import { useCurrentParentStore } from '@/stores';

const fabIconColor = tokens.color.neutral.surface.value;

// 자녀 → 부모 약장 화면 (F2 데모 핵심) — useMedicationsWithWarnings로 약장+안전점검+질병경고를 동시에 fetch
export default function MedsScreen() {
  // Tabs(자식) 화면에서 [parentId] 동적 세그먼트가 useLocalSearchParams로 안 들어오는 케이스가 있어
  // store(_layout이 URL 변화에 맞춰 sync)를 fallback으로 사용
  const { parentId: urlParentId } = useLocalSearchParams<{ parentId: string }>();
  const storeParentId = useCurrentParentStore((s) => s.parentId);
  const parentId = urlParentId || storeParentId || '';
  const { data, isLoading, error } = useMedicationsWithWarnings(parentId);
  const [query, setQuery] = useState('');
  const { onAddMedication, Components: AddMedFlow } = useAddMedicationFlow(parentId);

  // 검색은 약 이름·영문 성분에 대해 trim·lowercase 부분 일치 (서버 사이드 검색은 useDrugSearch로 추후 교체)
  const items = data?.medicationsWithWarnings ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      ({ medication: m }) =>
        m.item_name.toLowerCase().includes(q) ||
        (m.main_ingr_en?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Loading text="약장을 불러오는 중..." />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !data) {
    return (
      <ScreenContainer>
        <EmptyState
          title="약장을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
        />
      </ScreenContainer>
    );
  }

  const { safety } = data;

  // 약 카드 탭 → 약 상세 모달.
  // medicationId(BE patient_medications.id)도 함께 넘김 — 약 삭제 시 BE 키로 사용.
  const onMedicationPress = (med: Medication) => {
    router.push({
      pathname: '/(modals)/medication-detail',
      params: {
        itemSeq: med.item_seq,
        parentId,
        medicationId: med.medication_id ?? '',
      },
    });
  };

  // 약 추가 진입은 useAddMedicationFlow가 권한 체크 + NoticeDialog 분기까지 처리
  const goAddMedication = onAddMedication;

  // 약장 자체가 비어 있을 때 — 검색·배너 없이 큰 빈 상태 + FAB와 동일 스타일 CTA
  if (items.length === 0) {
    return (
      <>
        <ScreenContainer>
          <View className="flex-1 items-center justify-center">
            <EmptyState
              title="등록된 약이 없어요"
              description="첫 약을 추가해보세요"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="약 추가"
              onPress={goAddMedication}
              className="h-10 px-5 rounded-full bg-primary-bold flex-row items-center justify-center gap-2"
            >
              <Plus size={24} color={fabIconColor} strokeWidth={2.5} />
              <Text className="text-base font-bold text-surface">약 추가</Text>
            </Pressable>
          </View>
        </ScreenContainer>
        {AddMedFlow}
      </>
    );
  }

  return (
    <View className="flex-1 relative">
      <ScreenContainer>
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
              warningsMap은 검색 필터 결과만 포함하므로 숨겨진 약의 경고는 자동 제외.
              검색 결과 0개일 때만 작은 EmptyState로 안내 (약장 자체 비어 있는 케이스는 위에서 처리됨) */}
          <MedicationList
            medications={filtered.map((mw) => mw.medication)}
            warningsMap={Object.fromEntries(
              filtered.map((mw) => [mw.medication.item_seq, mw.warnings]),
            )}
            onItemPress={onMedicationPress}
            emptyState={
              query ? (
                <EmptyState title={`"${query}" 검색 결과가 없어요`} />
              ) : undefined
            }
          />
        </View>
      </ScreenContainer>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="약 추가"
        onPress={goAddMedication}
        className="absolute right-5 bottom-6 h-10 px-5 rounded-full bg-primary-bold flex-row items-center justify-center gap-2"
      >
        <Plus size={24} color={fabIconColor} strokeWidth={2.5} />
        <Text className="text-base font-bold text-surface">약 추가</Text>
      </Pressable>
      {AddMedFlow}
    </View>
  );
}
