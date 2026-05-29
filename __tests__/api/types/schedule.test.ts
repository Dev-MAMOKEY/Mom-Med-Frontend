// dev008 슬라이스 1 Cycle 2 — schedule 도메인 zod 스키마 검증.
// 잘못된 enum 값과 빈 슬롯 배열은 거부해야 한다 (BE 정합).

import {
  MedicationScheduleSchema,
  IntakeLogSchema,
  RouteEnum,
  SlotEnum,
  IntakeStatusEnum,
  FrequencyTypeEnum,
} from '../../../api/types/schedule';

describe('RouteEnum', () => {
  it('네 가지 약 종류만 허용한다', () => {
    expect(RouteEnum.safeParse('oral').success).toBe(true);
    expect(RouteEnum.safeParse('eye').success).toBe(true);
    expect(RouteEnum.safeParse('topical').success).toBe(true);
    expect(RouteEnum.safeParse('injection').success).toBe(true);
    expect(RouteEnum.safeParse('vitamin').success).toBe(false);
  });
});

describe('SlotEnum', () => {
  it('네 가지 슬롯만 허용한다', () => {
    expect(SlotEnum.safeParse('morning').success).toBe(true);
    expect(SlotEnum.safeParse('bedtime').success).toBe(true);
    expect(SlotEnum.safeParse('lunch').success).toBe(false);
  });
});

describe('FrequencyTypeEnum', () => {
  it('daily / weekly / every_n_days만 허용한다', () => {
    expect(FrequencyTypeEnum.safeParse('daily').success).toBe(true);
    expect(FrequencyTypeEnum.safeParse('weekly').success).toBe(true);
    expect(FrequencyTypeEnum.safeParse('every_n_days').success).toBe(true);
    expect(FrequencyTypeEnum.safeParse('hourly').success).toBe(false);
  });
});

describe('IntakeStatusEnum', () => {
  it('taken / skipped / pending만 허용한다', () => {
    expect(IntakeStatusEnum.safeParse('taken').success).toBe(true);
    expect(IntakeStatusEnum.safeParse('pending').success).toBe(true);
    expect(IntakeStatusEnum.safeParse('expired').success).toBe(false);
  });
});

describe('MedicationScheduleSchema', () => {
  const baseSchedule = {
    schedule_id: 'sch_1',
    medication_id: 'med_1',
    route: 'oral' as const,
    slots: ['morning', 'evening'] as const,
    frequency_type: 'daily' as const,
    started_on: '2026-05-30',
    meal_offset_min: 0,
  };

  it('유효한 daily 일정을 파싱한다', () => {
    expect(MedicationScheduleSchema.safeParse(baseSchedule).success).toBe(true);
  });

  it('슬롯이 비면 거부한다', () => {
    const empty = { ...baseSchedule, slots: [] };
    expect(MedicationScheduleSchema.safeParse(empty).success).toBe(false);
  });

  it('meal_offset_min은 기본 0이다', () => {
    const { meal_offset_min, ...withoutOffset } = baseSchedule;
    const parsed = MedicationScheduleSchema.parse(withoutOffset);
    expect(parsed.meal_offset_min).toBe(0);
  });
});

describe('IntakeLogSchema', () => {
  it('필수 필드 누락 시 거부한다', () => {
    expect(IntakeLogSchema.safeParse({}).success).toBe(false);
  });

  it('유효한 intake 응답을 파싱한다', () => {
    const valid = {
      intake_id: 'i_1',
      schedule_id: 'sch_1',
      medication_id: 'med_1',
      item_name: '메트포르민',
      route: 'oral',
      slot: 'morning',
      scheduled_at: '2026-05-30T08:00:00',
      status: 'pending',
    };
    expect(IntakeLogSchema.safeParse(valid).success).toBe(true);
  });
});
