// dev008 슬라이스 1 — 복용 일정의 슬롯·약 종류 상수와 시각 알고리즘.
// 4슬롯 고정 시각(아침 08·점심 12·저녁 18·취침 22), 4종 약 라벨,
// 그리고 "현재 시각에 가장 가까운 (가급적 미체크) intake" 선택 알고리즘.

export type Slot = 'morning' | 'noon' | 'evening' | 'bedtime';
export type Route = 'oral' | 'eye' | 'topical' | 'injection';

interface SlotMeta {
  hour: number;
  minute: number;
  label: string;
  emoji: string;
  color: string;
}

// 시간대별 옅은 배경 — 기존 design tokens 안에서 분위기 맞춰 매핑.
// (dev008은 orange-soft·indigo-soft를 제안했지만 토큰 미정의 → 안전 fallback)
export const SLOT_DEFAULTS: Record<Slot, SlotMeta> = {
  morning: { hour: 8, minute: 0, label: '아침', emoji: '🌅', color: 'bg-primary-soft' },
  noon: { hour: 12, minute: 0, label: '점심', emoji: '🌞', color: 'bg-warning-soft' },
  evening: { hour: 18, minute: 0, label: '저녁', emoji: '🌙', color: 'bg-danger-soft' },
  bedtime: { hour: 22, minute: 0, label: '취침', emoji: '🌃', color: 'bg-info-soft' },
};

export const ROUTE_META: Record<Route, { label: string; emoji: string }> = {
  oral: { label: '먹는약', emoji: '💊' },
  eye: { label: '안약', emoji: '💧' },
  topical: { label: '연고', emoji: '🧴' },
  injection: { label: '주사', emoji: '💉' },
};

export interface IntakeLite {
  intake_id: string;
  scheduled_at: string;
  status: 'pending' | 'taken' | 'skipped';
}

// pending이 있으면 그중 |scheduled_at - now| 최소값을, 없으면 전체에서 최소값을 반환.
// 빈 배열은 null.
export function pickClosestIntake<T extends IntakeLite>(intakes: T[], now: Date): T | null {
  if (intakes.length === 0) return null;
  const pending = intakes.filter((i) => i.status === 'pending');
  const pool = pending.length > 0 ? pending : intakes;
  const nowMs = now.getTime();
  return pool.reduce((best, cur) => {
    const dCur = Math.abs(new Date(cur.scheduled_at).getTime() - nowMs);
    const dBest = Math.abs(new Date(best.scheduled_at).getTime() - nowMs);
    return dCur < dBest ? cur : best;
  }, pool[0]);
}
