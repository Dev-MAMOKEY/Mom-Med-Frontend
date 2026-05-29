// dev008 슬라이스 1 — 복용 일정 등록/수정 바텀시트.
//
// 약 상세 화면의 "일정 추가/수정" 버튼이 이 시트를 연다.
// 사용자가 약 종류·슬롯·주기·시작일·종료일을 고르고 등록하면
// onSubmit(CreateScheduleReq)이 호출된다. 부모가 mutation/라우팅 처리.
//
// 디자인: AppSheet 위에 폼 UI. 슬롯/약 종류는 칩 토글, 주기는 라디오.
// 검증: 슬롯 0개면 등록 버튼 비활성.

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppSheet } from '@/components/AppSheet';
import { Button, Input } from '@/components/primitives';
import { ROUTE_META, SLOT_DEFAULTS } from '@/utils/schedule';
import type {
  CreateScheduleReq,
  FrequencyType,
  Route,
  Slot,
} from '@/api/types/schedule';

export interface ScheduleSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CreateScheduleReq) => void;
  /** 시작일 기본값 — 보통 "오늘" (YYYY-MM-DD). 부모가 주입해 테스트·SSR 안정. */
  defaultStartedOn?: string;
  /** 수정 모드: 기존 일정의 값으로 폼 채움. */
  initialValues?: Partial<CreateScheduleReq>;
  /** 등록 버튼 라벨 (생성 "등록하기" / 수정 "저장하기" 등). */
  submitLabel?: string;
  /** 수정 모드에서만 우상단에 "일정 삭제" 버튼 노출. 미전달 시 버튼 숨김. */
  onDelete?: () => void;
}

const SLOT_ORDER: readonly Slot[] = ['morning', 'noon', 'evening', 'bedtime'];
const ROUTE_ORDER: readonly Route[] = ['oral', 'eye', 'topical', 'injection'];

function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ScheduleSheet({
  open,
  onClose,
  onSubmit,
  defaultStartedOn,
  initialValues,
  submitLabel = '등록하기',
  onDelete,
}: ScheduleSheetProps) {
  // 수정 모드(initialValues가 의미 있게 주어진 상태)에서만 삭제 노출.
  // 단순히 onDelete prop 유무로는 부족 — 생성 모드에서도 콜백을 줄 수 있으니
  // initialValues의 존재로 같이 가드.
  const showDelete = !!onDelete && !!initialValues;
  const [route, setRoute] = useState<Route>(initialValues?.route ?? 'oral');
  const [slots, setSlots] = useState<Slot[]>(initialValues?.slots ?? []);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    initialValues?.frequency_type ?? 'daily'
  );
  const [startedOn, setStartedOn] = useState<string>(
    initialValues?.started_on ?? defaultStartedOn ?? todayStr()
  );
  const [endsOn, setEndsOn] = useState<string>(initialValues?.ends_on ?? '');
  const [intervalDays, setIntervalDays] = useState<string>(
    initialValues?.interval_days?.toString() ?? '2'
  );

  const toggleSlot = (slot: Slot) => {
    setSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const canSubmit = slots.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const req: CreateScheduleReq = {
      route,
      slots,
      frequency_type: frequencyType,
      started_on: startedOn,
      meal_offset_min: 0,
      ...(endsOn ? { ends_on: endsOn } : {}),
      ...(frequencyType === 'every_n_days'
        ? { interval_days: Number(intervalDays) || 1 }
        : {}),
    };
    onSubmit(req);
  };

  return (
    <AppSheet open={open} onClose={onClose} snapPoints={['80%']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-extrabold text-text">복용 일정</Text>
          {showDelete && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="일정 삭제"
              onPress={onDelete}
              hitSlop={8}
              className="px-3 py-1 rounded-md border border-danger"
            >
              <Text className="text-xs font-bold text-danger">일정 삭제</Text>
            </Pressable>
          )}
        </View>

        {/* 약 종류 */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-text-soft">약 종류</Text>
          <View className="flex-row flex-wrap gap-2">
            {ROUTE_ORDER.map((r) => {
              const meta = ROUTE_META[r];
              const selected = route === r;
              return (
                <Pressable
                  key={r}
                  accessibilityRole="button"
                  accessibilityHint={`${meta.label} 약 종류 선택`}
                  accessibilityState={{ selected }}
                  onPress={() => setRoute(r)}
                  className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                    selected
                      ? 'bg-primary-soft border-primary-bold'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-base">{meta.emoji}</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-primary-bold' : 'text-text'
                    }`}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 슬롯 (다중 선택) */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-text-soft">
            언제 드세요? (여러 개 선택 가능)
          </Text>
          <View className="flex-row gap-2">
            {SLOT_ORDER.map((s) => {
              const meta = SLOT_DEFAULTS[s];
              const selected = slots.includes(s);
              const pad = (n: number) => n.toString().padStart(2, '0');
              return (
                <Pressable
                  key={s}
                  accessibilityRole="button"
                  accessibilityHint={`${meta.label} 슬롯 선택`}
                  accessibilityState={{ selected }}
                  onPress={() => toggleSlot(s)}
                  className={`flex-1 items-center rounded-md border py-3 ${
                    selected
                      ? 'bg-primary-soft border-primary-bold'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-2xl">{meta.emoji}</Text>
                  <Text
                    className={`text-xs font-bold mt-1 ${
                      selected ? 'text-primary-bold' : 'text-text'
                    }`}
                  >
                    {meta.label}
                  </Text>
                  <Text className="text-[10px] text-text-mute">
                    {pad(meta.hour)}:{pad(meta.minute)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 주기 */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-text-soft">주기</Text>
          {(['daily', 'weekly', 'every_n_days'] as const).map((f) => {
            const selected = frequencyType === f;
            const label =
              f === 'daily' ? '매일' : f === 'weekly' ? '요일별' : 'N일에 한 번';
            return (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityHint={`주기 ${label} 선택`}
                accessibilityState={{ selected }}
                onPress={() => setFrequencyType(f)}
                className={`flex-row items-center gap-2 rounded-md border px-3 py-2 ${
                  selected
                    ? 'bg-primary-soft border-primary-bold'
                    : 'bg-surface border-border'
                }`}
              >
                <View
                  className={`w-4 h-4 rounded-full border ${
                    selected ? 'border-primary-bold' : 'border-border'
                  } items-center justify-center`}
                >
                  {selected && <View className="w-2 h-2 rounded-full bg-primary-bold" />}
                </View>
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-primary-bold' : 'text-text'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}

          {frequencyType === 'every_n_days' && (
            <View className="ml-6">
              <Input
                variant="number"
                value={intervalDays}
                onChangeText={setIntervalDays}
                placeholder="2"
              />
            </View>
          )}
        </View>

        {/* 시작일 / 종료일 */}
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Input
              label="시작일"
              value={startedOn}
              onChangeText={setStartedOn}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View className="flex-1">
            <Input
              label="종료일 (선택)"
              value={endsOn}
              onChangeText={setEndsOn}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <View className="mt-2">
          <Button
            label={submitLabel}
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </AppSheet>
  );
}
