/**
 * allergy.ts — 알레르기(약물·음식·환경)
 *
 * 백엔드 정합:
 *   - 백엔드 04 v2.1 (app.patient_allergies CRUD)
 *
 * Slice: F3 (conditions-allergies), F4 응급카드 P1 영역에서 재사용
 *
 * AllergenTypeEnum·AllergySeverityEnum은 common.ts의 단일 소스 사용
 */

import { z } from 'zod';

import { AllergenTypeEnum, AllergySeverityEnum } from './common';

// ============================================================================
// 알레르기 (app.patient_allergies)
// ============================================================================

export const AllergySchema = z.object({
  allergy_id: z.string(),
  allergen_type: AllergenTypeEnum,
  allergen_name: z.string(),
  severity: AllergySeverityEnum,
  notes: z.string().nullable(),
});
export type Allergy = z.infer<typeof AllergySchema>;

export const AllergyListSchema = z.object({
  allergies: z.array(AllergySchema),
});
export type AllergyList = z.infer<typeof AllergyListSchema>;

export const AddAllergyReqSchema = z.object({
  allergen_type: AllergenTypeEnum,
  allergen_name: z.string(),
  severity: AllergySeverityEnum,
  notes: z.string().optional(),
});
export type AddAllergyReq = z.infer<typeof AddAllergyReqSchema>;
