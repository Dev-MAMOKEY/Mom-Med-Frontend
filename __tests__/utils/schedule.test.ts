// dev008 슬라이스 1 Cycle 1 — 슬롯 유틸·시각 알고리즘.
// 알림 화면이 "현재 시각에 가장 가까운 카드"를 골라 자동 스크롤하는 핵심 동작.

import {
  SLOT_DEFAULTS,
  ROUTE_META,
  pickClosestIntake,
  type IntakeLite,
} from '../../utils/schedule';

describe('SLOT_DEFAULTS', () => {
  it('아침 슬롯은 08:00이다', () => {
    expect(SLOT_DEFAULTS.morning.hour).toBe(8);
    expect(SLOT_DEFAULTS.morning.minute).toBe(0);
  });
});

describe('pickClosestIntake', () => {
  // 사용자 시나리오: 사용자가 알림 화면에 들어왔을 때, 그 시점에 가장 가까운
  // (그리고 가급적 아직 안 먹은) 약 카드로 화면이 스크롤되어야 한다.
  // 1) 미체크(pending)가 있으면 그중 가장 가까운 것을 우선
  // 2) 다 체크 완료면 그중 가장 가까운 것을 반환

  function intake(scheduledAt: string, status: 'pending' | 'taken' = 'pending'): IntakeLite {
    return { intake_id: scheduledAt, scheduled_at: scheduledAt, status };
  }

  it('현재 시각이 점심 직전이면 점심 pending 카드를 고른다', () => {
    const now = new Date('2026-05-30T11:55:00');
    const intakes = [
      intake('2026-05-30T08:00:00'),
      intake('2026-05-30T12:00:00'),
      intake('2026-05-30T18:00:00'),
    ];
    expect(pickClosestIntake(intakes, now)?.scheduled_at).toBe('2026-05-30T12:00:00');
  });

  it('가까운 카드가 이미 먹음 상태면, 그 다음으로 가까운 pending을 고른다', () => {
    const now = new Date('2026-05-30T12:05:00');
    const intakes = [
      intake('2026-05-30T08:00:00', 'taken'),
      intake('2026-05-30T12:00:00', 'taken'),
      intake('2026-05-30T18:00:00', 'pending'),
    ];
    expect(pickClosestIntake(intakes, now)?.scheduled_at).toBe('2026-05-30T18:00:00');
  });

  it('모두 taken이면 시각상 가장 가까운 카드 자체를 반환한다', () => {
    const now = new Date('2026-05-30T11:55:00');
    const intakes = [
      intake('2026-05-30T08:00:00', 'taken'),
      intake('2026-05-30T12:00:00', 'taken'),
      intake('2026-05-30T18:00:00', 'taken'),
    ];
    expect(pickClosestIntake(intakes, now)?.scheduled_at).toBe('2026-05-30T12:00:00');
  });

  it('빈 배열이면 null을 반환한다', () => {
    expect(pickClosestIntake([], new Date())).toBeNull();
  });
});

describe('ROUTE_META', () => {
  it('네 가지 약 종류 라벨이 모두 정의돼 있다', () => {
    expect(ROUTE_META.oral.label).toBe('먹는약');
    expect(ROUTE_META.eye.label).toBe('안약');
    expect(ROUTE_META.topical.label).toBe('연고');
    expect(ROUTE_META.injection.label).toBe('주사');
  });
});
