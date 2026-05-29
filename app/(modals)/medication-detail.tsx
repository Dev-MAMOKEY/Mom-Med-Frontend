import { router, useLocalSearchParams } from 'expo-router';
import { MoreVertical } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Header, ScreenContainer } from '@/components';
import { PillCard, ScheduleSheet } from '@/components/domain';
import { Button, EmptyState, Loading } from '@/components/primitives';
import tokens from '@/design-tokens.json';
import {
  useCreateSchedule,
  useDeleteMedication,
  useDeleteSchedule,
  useDrugDetail,
  useSchedule,
  useUpdateSchedule,
} from '@/hooks';
import { ROUTE_META, SLOT_DEFAULTS } from '@/utils/schedule';
import type { CreateScheduleReq, Slot } from '@/api/types/schedule';

const TOAST_MS = 1500;

const moreIconColor = tokens.color.neutral['text-soft'].value;

// dev008 슬라이스 1: itemSeq를 schedule의 식별자로도 사용 (BE의 medication_id 자리).
// 실 BE 도착 시 useLocalSearchParams로 medicationId까지 받아 교체.
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

const SLOT_ORDER: readonly Slot[] = ['morning', 'noon', 'evening', 'bedtime'];

function freqLabel(freq: string): string {
  if (freq === 'daily') return '매일';
  if (freq === 'weekly') return '요일별';
  return 'N일에 한 번';
}

// 약 상세 모달 — 약장(meds.tsx)에서 약 카드 탭 시 진입. 식약처 마스터(DrugDetail) 기반 표시.
// dev008 슬라이스 1: 하단 "일정 추가/수정" 버튼 + ScheduleSheet + 일정 미리보기.
export default function MedicationDetail() {
  // itemSeq:    식약처 약 코드 (예: 'DEMO_MET_001'). DrugDetail·schedule mock의 키.
  // medicationId: BE patient_medications.id (예: '42'). 약 추가·삭제 등 BE 변이의 키.
  //              약장에서 진입할 때 router.push로 함께 전달됨.
  const { itemSeq, parentId, medicationId } = useLocalSearchParams<{
    itemSeq: string;
    parentId: string;
    medicationId: string;
  }>();
  const { data: drug, isLoading, error } = useDrugDetail(itemSeq);
  // schedule hook은 medicationId(BE id)를 키로 사용 — 약 삭제 시 BE/mock CASCADE가
  // medicationId 기준이라 키를 통일해야 cascade 후 알림 화면이 즉시 갱신된다.
  const { data: schedule } = useSchedule(medicationId);
  const createSchedule = useCreateSchedule(medicationId, parentId ?? '', drug?.item_name);
  const updateSchedule = useUpdateSchedule(medicationId, parentId ?? '');
  const deleteSchedule = useDeleteSchedule(medicationId, parentId ?? '');
  const deleteMedication = useDeleteMedication(parentId ?? '');

  const [toast, setToast] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // 토스트 표시 후 자동 해제 — verify.tsx의 인라인 토스트 패턴과 동일
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const onMore = () => undefined;

  // 약 삭제 — BE의 ON DELETE CASCADE로 그 약의 일정·intake도 함께 사라진다.
  // 삭제 후 약장으로 돌아간다.
  // medicationId는 BE의 numeric id (string으로 변환된 것) — itemSeq를 넘기면 BE가 400.
  const onDeleteMedication = async () => {
    if (!medicationId) {
      setToast('약 식별 정보가 없어요. 다시 시도해주세요.');
      return;
    }
    await deleteMedication.mutateAsync(medicationId);
    router.back();
  };

  // 시트의 우상단 "일정 삭제" 버튼이 호출. 약은 그대로 두고 일정만 제거.
  const onDeleteSchedule = async () => {
    setSheetOpen(false);
    await deleteSchedule.mutateAsync();
    setToast('일정을 삭제했어요');
  };

  const onOpenScheduleSheet = () => setSheetOpen(true);
  const onCloseSheet = () => setSheetOpen(false);

  const onSubmitSchedule = async (req: CreateScheduleReq) => {
    setSheetOpen(false);
    if (schedule) {
      await updateSchedule.mutateAsync(req);
      setToast('일정을 수정했어요');
    } else {
      await createSchedule.mutateAsync(req);
      setToast('일정을 등록했어요');
    }
  };

  const hasSchedule = !!schedule;
  const actionLabel = hasSchedule ? '일정 수정' : '일정 추가';

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
          {/* 약 사진·메타·외형·주의사항. showDosage placeholder는 schedule 영역으로 교체됨. */}
          <PillCard drug={drug} showCautions showDosage={false} />

          {/* 일정 미리보기 / 빈 상태 */}
          <View className="mt-3">
            {hasSchedule && schedule ? (
              <View className="bg-primary-soft rounded-lg p-3.5">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-bold text-primary-bold">복용 일정</Text>
                  <Text className="text-[10px] text-text-soft">
                    {ROUTE_META[schedule.route].emoji} {ROUTE_META[schedule.route].label}
                    {' · '}
                    {freqLabel(schedule.frequency_type)}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {SLOT_ORDER.filter((s) => schedule.slots.includes(s)).map((s) => {
                    const meta = SLOT_DEFAULTS[s];
                    return (
                      <View
                        key={s}
                        className="flex-row items-center gap-1 bg-surface rounded-md px-2 py-1"
                      >
                        <Text className="text-sm">{meta.emoji}</Text>
                        <Text className="text-xs font-semibold text-text">
                          {meta.label} {pad(meta.hour)}:{pad(meta.minute)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="bg-surface border border-border rounded-lg p-3.5">
                <Text className="text-xs font-bold text-text-soft">복용 일정</Text>
                <Text className="text-sm text-text-mute mt-1">
                  아직 일정이 없어요. 아래 "일정 추가" 버튼으로 등록해주세요.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScreenContainer>

      {/* 하단 액션 — 약 삭제(outline danger) + 일정 추가/수정(primary).
          일정 삭제는 시트 안에서 처리 (수정 모드일 때만 우상단 버튼) */}
      <View className="absolute bottom-6 left-0 right-0 px-5 flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={onDeleteMedication}
          className="flex-1 bg-surface border border-danger rounded-md py-3 items-center justify-center"
        >
          <Text className="text-base font-bold text-danger">약 삭제</Text>
        </Pressable>
        <View className="flex-1">
          <Button label={actionLabel} variant="primary" onPress={onOpenScheduleSheet} />
        </View>
      </View>

      {/* 일정 등록·수정 시트. onDelete는 수정 모드에서만 prop 전달 → 시트가 우상단 버튼 노출. */}
      <ScheduleSheet
        open={sheetOpen}
        onClose={onCloseSheet}
        onSubmit={onSubmitSchedule}
        initialValues={schedule ?? undefined}
        submitLabel={hasSchedule ? '저장하기' : '등록하기'}
        onDelete={hasSchedule ? onDeleteSchedule : undefined}
      />

      {/* 인라인 토스트 */}
      {toast && (
        <View className="absolute top-14 left-5 right-5 bg-text rounded-md px-4 py-3">
          <Text className="text-surface font-bold text-center">{toast}</Text>
        </View>
      )}
    </View>
  );
}
