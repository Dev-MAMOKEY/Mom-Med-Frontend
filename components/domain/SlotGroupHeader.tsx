// dev008 슬라이스 1 — 알림 화면의 슬롯 그룹 헤더.
// 한 슬롯(아침 등) 카드들 위에 한 줄짜리 라벨.

import { Text, View } from 'react-native';

import { SLOT_DEFAULTS, type Slot } from '@/utils/schedule';

export interface SlotGroupHeaderProps {
  slot: Slot;
  /** 표시 시각을 외부에서 주입 가능 (S2의 식사 시간 반영). 없으면 SLOT_DEFAULTS. */
  hour?: number;
  minute?: number;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function SlotGroupHeader({ slot, hour, minute }: SlotGroupHeaderProps) {
  const meta = SLOT_DEFAULTS[slot];
  const h = hour ?? meta.hour;
  const m = minute ?? meta.minute;
  return (
    <View
      className={`flex-row items-center gap-2 mt-4 mb-2 rounded-md px-3 py-1.5 ${meta.color}`}
    >
      <Text className="text-base">{meta.emoji}</Text>
      <Text className="text-sm font-bold text-text">{meta.label}</Text>
      <Text className="text-xs text-text-soft">· {pad(h)}:{pad(m)}</Text>
    </View>
  );
}
