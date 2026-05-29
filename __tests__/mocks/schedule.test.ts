// dev008 슬라이스 1 Cycle 3 — schedule mock 핵심 동작 검증.
// 1) create→get 라운드트립
// 2) lazy intake 생성 (그날 슬롯 수만큼 pending이 생김)
// 3) check intake가 상태를 변경

import {
  resetScheduleMocks,
  mockCreateSchedule,
  mockGetSchedule,
  mockDeleteSchedule,
  mockGetTodayIntakes,
  mockCheckIntake,
} from '../../mocks/schedule';
import { mockDeleteMedication } from '../../mocks/medications';

const PARENT = 'mom-001';
const MED = '198800002'; // 메트포르민 (mom-001 약장에 시드됨)

beforeEach(() => {
  resetScheduleMocks();
});

describe('mockCreateSchedule + mockGetSchedule', () => {
  it('생성한 일정을 medication_id로 다시 조회할 수 있다', async () => {
    const created = await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning', 'evening'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    expect(created.schedule_id).toBeTruthy();

    const fetched = await mockGetSchedule(MED);
    expect(fetched?.slots).toEqual(['morning', 'evening']);
    expect(fetched?.route).toBe('oral');
  });

  it('일정이 없으면 null', async () => {
    expect(await mockGetSchedule(MED)).toBeNull();
  });
});

describe('mockGetTodayIntakes (lazy 생성)', () => {
  it('daily 일정의 슬롯 수만큼 그날 pending intake가 생긴다', async () => {
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning', 'evening'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });

    const res = await mockGetTodayIntakes(PARENT, '2026-05-30');
    expect(res.intakes).toHaveLength(2);
    expect(res.intakes.map((i) => i.slot)).toEqual(['morning', 'evening']);
    expect(res.intakes.every((i) => i.status === 'pending')).toBe(true);
  });

  it('같은 날을 두 번 조회해도 중복 생성되지 않는다 (멱등)', async () => {
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });

    await mockGetTodayIntakes(PARENT, '2026-05-30');
    const res2 = await mockGetTodayIntakes(PARENT, '2026-05-30');
    expect(res2.intakes).toHaveLength(1);
  });

  it('시작일 이전 날짜는 intake가 생기지 않는다', async () => {
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });

    const res = await mockGetTodayIntakes(PARENT, '2026-05-29');
    expect(res.intakes).toHaveLength(0);
  });
});

describe('mockCheckIntake', () => {
  it('체크하면 status가 taken으로 바뀌고 다음 조회에서 반영된다', async () => {
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });

    const before = await mockGetTodayIntakes(PARENT, '2026-05-30');
    const target = before.intakes[0];
    await mockCheckIntake(target.intake_id, { status: 'taken', taken_at: '2026-05-30T08:12:00' });

    const after = await mockGetTodayIntakes(PARENT, '2026-05-30');
    expect(after.intakes[0].status).toBe('taken');
    expect(after.intakes[0].taken_at).toBe('2026-05-30T08:12:00');
  });
});

describe('item_name 전달 (mock 전용)', () => {
  it('mockCreateSchedule에 itemName을 주면 intake의 item_name으로 노출된다', async () => {
    await mockCreateSchedule(
      MED,
      PARENT,
      {
        route: 'oral',
        slots: ['morning'],
        frequency_type: 'daily',
        started_on: '2026-05-30',
        meal_offset_min: 0,
      },
      '메트포르민 500mg',
    );
    const res = await mockGetTodayIntakes(PARENT, '2026-05-30');
    expect(res.intakes[0].item_name).toBe('메트포르민 500mg');
  });
});

describe('약 삭제 시 일정 cascade', () => {
  it('약장에서 약을 삭제하면 그 약의 일정·intake도 함께 사라져야 한다', async () => {
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    await mockGetTodayIntakes(PARENT, '2026-05-30'); // intake lazy 생성

    // 약 삭제
    await mockDeleteMedication(PARENT, MED);

    // 같은 약의 일정·intake가 남아 있으면 회귀
    expect(await mockGetSchedule(MED)).toBeNull();
    const after = await mockGetTodayIntakes(PARENT, '2026-05-30');
    expect(after.intakes).toHaveLength(0);
  });
});

describe('mockDeleteSchedule', () => {
  it('일정 삭제 후 조회하면 null + intake도 사라진다 (cascade)', async () => {
    await mockCreateSchedule(MED, PARENT, {
      route: 'oral',
      slots: ['morning'],
      frequency_type: 'daily',
      started_on: '2026-05-30',
      meal_offset_min: 0,
    });
    await mockGetTodayIntakes(PARENT, '2026-05-30'); // intake 1개 lazy 생성

    await mockDeleteSchedule(MED);

    expect(await mockGetSchedule(MED)).toBeNull();
    const after = await mockGetTodayIntakes(PARENT, '2026-05-30');
    expect(after.intakes).toHaveLength(0);
  });
});
