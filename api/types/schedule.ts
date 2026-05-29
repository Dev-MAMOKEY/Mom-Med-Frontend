/**
 * schedule.ts — 복용 일정 + 복용 기록 (dev008 슬라이스 1)
 *
 * 백엔드 정합:
 *   - app.medication_schedules (반복 규칙, 약 1개당 0~1개)
 *   - app.intake_logs (회별 복용 기록, lazy 생성)
 *
 * Slice: S1. S2(meal_offset), S3(remaining/refill)은 nullable 필드로 미리 자리만.
 */

import { z } from 'zod';

export const RouteEnum = z.enum(['oral', 'eye', 'topical', 'injection']);
export type Route = z.infer<typeof RouteEnum>;

export const SlotEnum = z.enum(['morning', 'noon', 'evening', 'bedtime']);
export type Slot = z.infer<typeof SlotEnum>;

export const FrequencyTypeEnum = z.enum(['daily', 'weekly', 'every_n_days']);
export type FrequencyType = z.infer<typeof FrequencyTypeEnum>;

export const IntakeStatusEnum = z.enum(['taken', 'skipped', 'pending']);
export type IntakeStatus = z.infer<typeof IntakeStatusEnum>;

// ============================================================================
// 일정 (반복 규칙)
// ============================================================================

export const MedicationScheduleSchema = z.object({
  schedule_id: z.string(),
  medication_id: z.string(),
  route: RouteEnum,
  slots: z.array(SlotEnum).min(1),
  frequency_type: FrequencyTypeEnum,
  days_of_week: z.array(z.number()).optional(),     // weekly일 때만
  interval_days: z.number().optional(),              // every_n_days일 때만
  started_on: z.string(),                            // YYYY-MM-DD
  ends_on: z.string().nullable().optional(),
  remaining_count: z.number().nullable().optional(),  // S3
  refill_threshold: z.number().nullable().optional(), // S3
  meal_offset_min: z.number().default(0),             // S2
});
export type MedicationSchedule = z.infer<typeof MedicationScheduleSchema>;

// 일정 생성 요청 (schedule_id는 BE가 채움)
export const CreateScheduleReqSchema = MedicationScheduleSchema.omit({
  schedule_id: true,
  medication_id: true,
});
export type CreateScheduleReq = z.infer<typeof CreateScheduleReqSchema>;

// 일정 수정 요청 (전체 부분 갱신)
export const UpdateScheduleReqSchema = CreateScheduleReqSchema.partial();
export type UpdateScheduleReq = z.infer<typeof UpdateScheduleReqSchema>;

// ============================================================================
// 복용 기록 (회별)
// ============================================================================

export const IntakeLogSchema = z.object({
  intake_id: z.string(),
  schedule_id: z.string(),
  medication_id: z.string(),
  item_name: z.string(),
  route: RouteEnum,
  slot: SlotEnum,
  scheduled_at: z.string(),  // ISO local "YYYY-MM-DDTHH:mm:ss"
  status: IntakeStatusEnum,
  taken_at: z.string().nullable().optional(),
});
export type IntakeLog = z.infer<typeof IntakeLogSchema>;

export const IntakeListResponseSchema = z.object({
  date: z.string(),
  intakes: z.array(IntakeLogSchema),
});
export type IntakeListResponse = z.infer<typeof IntakeListResponseSchema>;

export const CheckIntakeReqSchema = z.object({
  status: z.enum(['taken', 'skipped']),
  taken_at: z.string().optional(),  // 생략 시 BE가 now() 사용 (후입력 지원)
});
export type CheckIntakeReq = z.infer<typeof CheckIntakeReqSchema>;
