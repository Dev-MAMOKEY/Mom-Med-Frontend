import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { IntakeCard, SafetyBanner, SlotGroupHeader } from '@/components/domain';
import { Loading } from '@/components/primitives';
import {
  useCheckIntake,
  useMedicationsWithSafety,
  useTodayIntakes,
} from '@/hooks';
import { useCurrentParentStore } from '@/stores';
import { SLOT_DEFAULTS, pickClosestIntake, type Slot } from '@/utils/schedule';
import type { CheckIntakeReq, IntakeLog } from '@/api/types/schedule';

const SLOT_ORDER: readonly Slot[] = ['morning', 'noon', 'evening', 'bedtime'];

type DateOffset = -1 | 0 | 1;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function offsetDate(offset: DateOffset): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

const KO_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function longDateLabel(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_WEEKDAYS[d.getDay()]})`;
}

function timeLabel(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}:${pad(m)}`;
}

function groupBySlot(intakes: IntakeLog[]): Record<Slot, IntakeLog[]> {
  const result: Record<Slot, IntakeLog[]> = {
    morning: [],
    noon: [],
    evening: [],
    bedtime: [],
  };
  for (const i of intakes) {
    result[i.slot].push(i);
  }
  for (const s of SLOT_ORDER) {
    result[s].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }
  return result;
}

// 부모의 오늘(또는 어제·내일) 복용 리스트 — dev008 슬라이스 1의 핵심 화면.
// 기존 "오늘 알림이 없어요"·"다음 약" placeholder를 통째로 교체.
export default function ParentNotifications() {
  const { parentId: urlParentId } = useLocalSearchParams<{ parentId: string }>();
  const storeParentId = useCurrentParentStore((s) => s.parentId);
  const parentId = urlParentId || storeParentId || '';
  const displayName = useCurrentParentStore((s) => s.displayName);

  const [dateOffset, setDateOffset] = useState<DateOffset>(0);
  const targetDate = useMemo(() => offsetDate(dateOffset), [dateOffset]);
  const dateStr = toLocalDateStr(targetDate);

  const { data: intakeData, isLoading } = useTodayIntakes(parentId, dateStr);
  const { data: safetyData } = useMedicationsWithSafety(parentId);
  const { mutate: checkIntake } = useCheckIntake(parentId);

  // pickClosestIntake는 자동 스크롤 타깃 계산용. 실제 스크롤은 web 환경별 측정이 필요해
  // 이 단계에선 알고리즘만 사용하고 시각 동작은 Playwright로 보완 (dev008 §4.3.4).
  const intakes = intakeData?.intakes ?? [];
  const closest = useMemo(() => pickClosestIntake(intakes, new Date()), [intakes]);
  const scrollRef = useRef<ScrollView>(null);

  const groupsBySlot = useMemo(() => groupBySlot(intakes), [intakes]);
  const totalCount = intakes.length;
  const doneCount = intakes.filter((i) => i.status === 'taken').length;

  const decision = safetyData?.safety.overall_decision;
  const showSafetyBanner = decision === 'WARN' || decision === 'BLOCK';

  const onCheck = (intake: IntakeLog) => (req: CheckIntakeReq) => {
    checkIntake({ intakeId: intake.intake_id, req });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Loading text="불러오는 중..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더: 부모 이름 + 큰 날짜 + 시각/카운트 */}
        <View className="mb-3">
          <Text className="text-xs text-text-soft">
            {displayName ?? '부모님'}의 일정
          </Text>
          <Text className="text-2xl font-extrabold text-text mt-1">
            {longDateLabel(targetDate)}
          </Text>
          <Text className="text-sm text-text-soft mt-1">
            {dateOffset === 0 ? `${timeLabel(new Date())} · ` : ''}
            {totalCount === 0
              ? '예정된 약이 없어요'
              : `약 ${totalCount}개 · ${doneCount}개 완료`}
          </Text>
        </View>

        {/* 날짜 토글: 어제·오늘·내일 */}
        <View className="flex-row gap-2 mb-3">
          {([
            { offset: -1, label: '어제' },
            { offset: 0, label: '오늘' },
            { offset: 1, label: '내일' },
          ] as const).map(({ offset, label }) => {
            const selected = dateOffset === offset;
            return (
              <Pressable
                key={offset}
                accessibilityRole="button"
                accessibilityLabel={`${label} 일정 보기`}
                accessibilityState={{ selected }}
                onPress={() => setDateOffset(offset as DateOffset)}
                className={`flex-1 items-center rounded-md py-2 border ${
                  selected
                    ? 'bg-primary-bold border-primary-bold'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    selected ? 'text-surface' : 'text-text'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showSafetyBanner && (
          <View className="mb-3">
            <SafetyBanner
              decision={decision}
              title="복용 중인 약 사이 주의가 필요해요"
              subtitle="약장 탭에서 자세히 확인해주세요"
            />
          </View>
        )}

        {totalCount === 0 ? (
          <View className="mt-6 bg-surface border border-border rounded-lg p-6 items-center">
            <Text className="text-3xl">💊</Text>
            <Text className="text-base font-bold text-text mt-2">
              {dateOffset === 0
                ? '오늘 예정된 약이 없어요'
                : '예정된 약이 없어요'}
            </Text>
            <Text className="text-sm text-text-soft mt-1 text-center">
              약장에서 약을 탭하면 일정을 등록할 수 있어요.
            </Text>
          </View>
        ) : (
          <View>
            {SLOT_ORDER.filter((s) => groupsBySlot[s].length > 0).map((slot) => (
              <View key={slot}>
                <SlotGroupHeader slot={slot} />
                <View className="gap-2">
                  {groupsBySlot[slot].map((intake) => (
                    <View
                      key={intake.intake_id}
                      // 가장 가까운 카드에 살짝 강조 보더 — 시각 가이드
                      className={
                        closest?.intake_id === intake.intake_id
                          ? 'rounded-lg border-2 border-primary-bold/60'
                          : ''
                      }
                    >
                      <IntakeCard intake={intake} onCheck={onCheck(intake)} />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// 슬롯 시각 export — 외부에서 SLOT_DEFAULTS의 시각이 필요할 때 import.
export { SLOT_DEFAULTS };
