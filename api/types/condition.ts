/**
 * condition.ts — 질병(만성질환·진단) + KCD 검색 + 질병↔약 경고
 *
 * 백엔드 정합:
 *   - 백엔드 04 v2.1 (app.patient_conditions CRUD)
 *   - 백엔드 05 v2.1 (KCD HIRA 12904 search + condition-drug warning rules)
 *
 * Slice: F3 (conditions-allergies), F4·F6에서 응급카드·약장 경고로 재사용
 */

import { z } from 'zod';

// ============================================================================
// 질병 (app.patient_conditions)
// ============================================================================

export const ConditionSchema = z.object({
  condition_id: z.string(),
  disease_code: z.string(),
  disease_name: z.string(),
  diagnosed_at: z.string().nullable(),
  notes: z.string().nullable(),
});
export type Condition = z.infer<typeof ConditionSchema>;

export const ConditionListSchema = z.object({
  conditions: z.array(ConditionSchema),
});
export type ConditionList = z.infer<typeof ConditionListSchema>;

export const AddConditionReqSchema = z.object({
  disease_code: z.string(),
  diagnosed_at: z.string().optional(),
  notes: z.string().optional(),
});
export type AddConditionReq = z.infer<typeof AddConditionReqSchema>;

// ============================================================================
// KCD 검색 (HIRA 12904 API — sickCd/sickNm/sickEngNm)
// ============================================================================

export const DiseaseSearchResultSchema = z.object({
  sickCd: z.string(),
  sickNm: z.string(),
  sickEngNm: z.string(),
});
export type DiseaseSearchResult = z.infer<typeof DiseaseSearchResultSchema>;

export const DiseaseSearchResListSchema = z.object({
  results: z.array(DiseaseSearchResultSchema),
});

// ============================================================================
// 질병↔약 경고 (백엔드 05 condition-drug rules) — F2 약장 카드에 ⚠ 뱃지 표시
// ============================================================================

export const ConditionDrugWarningSchema = z.object({
  item_seq: z.string(),
  condition_code: z.string(),
  warning_message: z.string(),
  citation: z.string().optional(),
});
export type ConditionDrugWarning = z.infer<typeof ConditionDrugWarningSchema>;
