// dev008 슬라이스 1 — 알림 화면의 한 회 복용 카드.
//
// pending: 약 이름·시각 + 액션 3개(먹음·거름·나중에)
// taken:   약 이름·시각 + "✓ X시 X분 복용 완료" 회색 표시
// skipped: 약 이름·시각 + "✗ 거름" 표시
//
// "나중에"는 단순히 카드 액션을 닫는 의도(상태 변경 없음). 알림 시스템 도착하면 스누즈 연결.

import { Pressable, Text, View } from 'react-native';

import { ROUTE_META } from '@/utils/schedule';
import type { CheckIntakeReq, IntakeLog } from '@/api/types/schedule';

export interface IntakeCardProps {
  intake: IntakeLog;
  onCheck: (req: CheckIntakeReq) => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function timeOf(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function IntakeCard({ intake, onCheck }: IntakeCardProps) {
  const route = ROUTE_META[intake.route];
  const isPending = intake.status === 'pending';
  const isTaken = intake.status === 'taken';
  const isSkipped = intake.status === 'skipped';

  const containerClass = isTaken
    ? 'bg-surface border border-border opacity-70'
    : isSkipped
      ? 'bg-surface border border-border'
      : 'bg-surface border border-border';

  return (
    <View className={`rounded-lg p-3.5 ${containerClass}`}>
      <View className="flex-row items-center gap-2">
        <Text className="text-base">{route.emoji}</Text>
        <Text className="flex-1 text-sm font-bold text-text" numberOfLines={1}>
          {intake.item_name}
        </Text>
        {isTaken && (
          <Text className="text-xs font-semibold text-primary-bold">
            ✓ {timeOf(intake.taken_at ?? intake.scheduled_at)} 복용 완료
          </Text>
        )}
        {isSkipped && (
          <Text className="text-xs font-semibold text-text-mute">✗ 거름</Text>
        )}
      </View>

      {isPending && (
        <View className="mt-3 flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${intake.item_name} 먹음`}
            onPress={() => onCheck({ status: 'taken' })}
            className="flex-1 bg-primary-bold rounded-md py-2 items-center"
          >
            <Text className="text-sm font-bold text-surface">먹음</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${intake.item_name} 거름`}
            onPress={() => onCheck({ status: 'skipped' })}
            className="flex-1 bg-surface border border-border rounded-md py-2 items-center"
          >
            <Text className="text-sm font-bold text-text">거름</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
