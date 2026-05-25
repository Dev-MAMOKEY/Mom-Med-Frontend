import { router, useLocalSearchParams } from 'expo-router';
import { MoreVertical } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { PillCard } from '@/components/domain';
import { EmptyState, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import { useDrugDetail } from '@/hooks';

const moreIconColor = tokens.color.neutral['text-soft'].value;

// 약 상세 모달 — 약장(meds.tsx)에서 약 카드 탭 시 진입. 식약처 마스터(DrugDetail) 기반 표시
export default function MedicationDetail() {
  const { itemSeq } = useLocalSearchParams<{ itemSeq: string }>();
  const { data: drug, isLoading, error } = useDrugDetail(itemSeq);

  // 더보기 메뉴는 자리만 — 실제 동작은 추후
  const onMore = () => undefined;

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
    <ScreenContainer header={header}>
      <View className="px-5 pt-2 pb-6">
        {/* 알약 사진·제목·제조사·정보 그리드 4칸·주의사항·복용 정보 placeholder를 한 번에 조립.
            DrugDetail에 dosage_schedule 필드가 없어 showDosage는 placeholder 문구(의사·약사 지시) 노출용 */}
        <PillCard drug={drug} showCautions showDosage />
      </View>
    </ScreenContainer>
  );
}
