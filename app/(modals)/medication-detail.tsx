import { router, useLocalSearchParams } from 'expo-router';
import { MoreVertical } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { PillCard } from '@/components/domain';
import { Button, EmptyState, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useDrugDetail } from '@/hooks';

const TOAST_MS = 1500;

const moreIconColor = tokens.color.neutral['text-soft'].value;

// 약 상세 모달 — 약장(meds.tsx)에서 약 카드 탭 시 진입. 식약처 마스터(DrugDetail) 기반 표시
export default function MedicationDetail() {
  const { itemSeq } = useLocalSearchParams<{ itemSeq: string }>();
  const { data: drug, isLoading, error } = useDrugDetail(itemSeq);
  const [toast, setToast] = useState<string | null>(null);

  // 토스트 표시 후 자동 해제 — verify.tsx의 인라인 토스트 패턴과 동일
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  // 더보기 메뉴는 자리만 — 실제 동작은 추후
  const onMore = () => undefined;

  // 삭제·알람 설정은 본 PR 범위 밖 — "준비 중" 토스트만 노출
  const onDelete = () => setToast('약 삭제는 준비 중이에요');
  const onSetAlarm = () => setToast('알람 설정은 준비 중이에요');

  const header = (
    <Header
      title=""
      showBack
      onBack={() => router.back()}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="더보기"
          onPress={onMore}
          hitSlop={8}
        >
          <MoreVertical size={22} color={moreIconColor} />
        </Pressable>
      }
    />
  );

  if (isLoading) {
    return (
      <ScreenContainer header={header}>
        <View className="flex-1 items-center justify-center">
          <Loading text="약 정보를 불러오는 중..." />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !drug) {
    return (
      <ScreenContainer header={header}>
        <EmptyState
          title="약 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
        />
      </ScreenContainer>
    );
  }

  return (
    <View className="flex-1 relative">
      <ScreenContainer header={header}>
        <View className="px-5 pt-2 pb-24">
          {/* 알약 사진·제목·제조사·정보 그리드 4칸·주의사항·복용 정보 placeholder를 한 번에 조립.
              DrugDetail에 dosage_schedule 필드가 없어 showDosage는 placeholder 문구(의사·약사 지시) 노출용 */}
          <PillCard drug={drug} showCautions showDosage />
        </View>
      </ScreenContainer>

      {/* 하단 액션 — 목업 v2 화면 6번 기준 삭제(outline danger) + 알람(primary) 가로 분할 */}
      <View className="absolute bottom-6 left-0 right-0 px-5 flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          className="flex-1 bg-surface border border-danger rounded-md py-3 items-center justify-center"
        >
          <Text className="text-base font-bold text-danger">삭제</Text>
        </Pressable>
        <View className="flex-1">
          <Button label="알람 설정" variant="primary" onPress={onSetAlarm} />
        </View>
      </View>

      {/* 인라인 토스트 — 1.5초 후 자동 사라짐 (verify.tsx와 동일 패턴) */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-text rounded-md px-4 py-3">
          <Text className="text-surface font-bold text-center">{toast}</Text>
        </View>
      )}
    </View>
  );
}
