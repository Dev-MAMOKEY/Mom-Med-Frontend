// dev008 슬라이스 1 — schedule mock.
// BE 미구현 동안 FE 흐름 검증용. 인메모리 스토어로 schedule + intake_log 시뮬레이션.
// 실 BE 도착하면 hook의 USE_MOCK 분기만 false로 바꾸면 됨.

import { SLOT_DEFAULTS } from '@/utils/schedule';
import type {
  CheckIntakeReq,
  CreateScheduleReq,
  IntakeListResponse,
  IntakeLog,
  MedicationSchedule,
  Slot,
  UpdateScheduleReq,
} from '@/api/types/schedule';

// ============================================================================
// 인메모리 스토어
// ============================================================================

interface StoredSchedule extends MedicationSchedule {
  parent_id: string;
  /** mock 전용 — 호출자가 알려준 약 이름. intake_log 응답의 item_name으로 사용. */
  item_name?: string;
}

const schedulesByMedId = new Map<string, StoredSchedule>();
const intakesByKey = new Map<string, IntakeLog>(); // key: `${schedule_id}|${scheduled_at}`
const intakesById = new Map<string, IntakeLog>();  // key: intake_id

export function resetScheduleMocks(): void {
  schedulesByMedId.clear();
  intakesByKey.clear();
  intakesById.clear();
}

// ============================================================================
// 일정 CRUD
// ============================================================================

export async function mockGetSchedule(
  medicationId: string,
): Promise<MedicationSchedule | null> {
  const found = schedulesByMedId.get(medicationId);
  if (!found) return null;
  const { parent_id: _ignored, item_name: _ignored2, ...rest } = found;
  return rest;
}

export async function mockCreateSchedule(
  medicationId: string,
  parentId: string,
  req: CreateScheduleReq,
  itemName?: string,
): Promise<MedicationSchedule> {
  if (schedulesByMedId.has(medicationId)) {
    throw new Error('Schedule already exists for this medication (mock 409)');
  }
  const schedule: StoredSchedule = {
    schedule_id: `sch_${Math.random().toString(36).slice(2, 10)}`,
    medication_id: medicationId,
    parent_id: parentId,
    item_name: itemName,
    ...req,
  };
  schedulesByMedId.set(medicationId, schedule);
  const { parent_id: _ignored, item_name: _ignored2, ...rest } = schedule;
  return rest;
}

export async function mockUpdateSchedule(
  medicationId: string,
  req: UpdateScheduleReq,
): Promise<MedicationSchedule> {
  const existing = schedulesByMedId.get(medicationId);
  if (!existing) {
    throw new Error('Schedule not found (mock 404)');
  }
  const updated: StoredSchedule = { ...existing, ...req };
  schedulesByMedId.set(medicationId, updated);

  // 일정이 바뀌면 그 schedule의 lazily-생성된 intake 중 status='pending'인 것은 정리한다.
  // (간단화: 일정 수정 시 미체크 intake는 다음 GET 호출 시 재생성됨)
  for (const [key, intake] of intakesByKey) {
    if (intake.schedule_id === existing.schedule_id && intake.status === 'pending') {
      intakesByKey.delete(key);
      intakesById.delete(intake.intake_id);
    }
  }

  const { parent_id: _ignored, ...rest } = updated;
  return rest;
}

export async function mockDeleteSchedule(medicationId: string): Promise<void> {
  const existing = schedulesByMedId.get(medicationId);
  if (!existing) return;
  schedulesByMedId.delete(medicationId);

  // cascade: 해당 schedule의 intake 모두 제거
  for (const [key, intake] of intakesByKey) {
    if (intake.schedule_id === existing.schedule_id) {
      intakesByKey.delete(key);
      intakesById.delete(intake.intake_id);
    }
  }
}

// ============================================================================
// 오늘의 복용 (lazy intake 생성)
// ============================================================================

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function parseLocalDate(dateStr: string): Date {
  // 'YYYY-MM-DD' → 로컬 자정. UTC가 아니라 로컬 비교가 의도.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isWeekdayInList(date: Date, daysOfWeek: number[]): boolean {
  // 1=월, 7=일 (BE 정의). JS Date.getDay(): 0=일 ~ 6=토
  const jsDay = date.getDay();
  const beDay = jsDay === 0 ? 7 : jsDay;
  return daysOfWeek.includes(beDay);
}

function diffDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function scheduleAppliesOn(schedule: StoredSchedule, targetDate: Date): boolean {
  const start = parseLocalDate(schedule.started_on);
  if (targetDate < start) return false;
  if (schedule.ends_on) {
    const end = parseLocalDate(schedule.ends_on);
    if (targetDate > end) return false;
  }

  switch (schedule.frequency_type) {
    case 'daily':
      return true;
    case 'weekly':
      return schedule.days_of_week
        ? isWeekdayInList(targetDate, schedule.days_of_week)
        : false;
    case 'every_n_days':
      if (!schedule.interval_days || schedule.interval_days < 1) return false;
      return diffDays(targetDate, start) % schedule.interval_days === 0;
  }
}

function scheduledAtFor(dateStr: string, slot: Slot): string {
  const meta = SLOT_DEFAULTS[slot];
  return `${dateStr}T${pad(meta.hour)}:${pad(meta.minute)}:00`;
}

// 단순화: 부모-약 관계는 mockMedications와 분리되어 있어서 schedule.parent_id를 직접 사용.
// 실 BE에선 medication_schedules.parent_id FK 조회.
export async function mockGetTodayIntakes(
  parentId: string,
  date: string,
): Promise<IntakeListResponse> {
  const targetDate = parseLocalDate(date);
  const result: IntakeLog[] = [];

  for (const schedule of schedulesByMedId.values()) {
    if (schedule.parent_id !== parentId) continue;
    if (!scheduleAppliesOn(schedule, targetDate)) continue;

    for (const slot of schedule.slots) {
      const scheduledAt = scheduledAtFor(date, slot);
      const key = `${schedule.schedule_id}|${scheduledAt}`;
      let intake = intakesByKey.get(key);
      if (!intake) {
        intake = {
          intake_id: `i_${Math.random().toString(36).slice(2, 10)}`,
          schedule_id: schedule.schedule_id,
          medication_id: schedule.medication_id,
          item_name: schedule.item_name ?? schedule.medication_id,
          route: schedule.route,
          slot,
          scheduled_at: scheduledAt,
          status: 'pending',
        };
        intakesByKey.set(key, intake);
        intakesById.set(intake.intake_id, intake);
      }
      result.push(intake);
    }
  }

  result.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  return { date, intakes: result };
}

// ============================================================================
// 체크 (taken / skipped)
// ============================================================================

export async function mockCheckIntake(
  intakeId: string,
  req: CheckIntakeReq,
): Promise<IntakeLog> {
  const intake = intakesById.get(intakeId);
  if (!intake) {
    throw new Error('Intake not found (mock 404)');
  }
  intake.status = req.status;
  intake.taken_at = req.taken_at ?? new Date().toISOString();
  return intake;
}
