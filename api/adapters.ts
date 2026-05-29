/**
 * adapters.ts — BE ↔ FE 형태 변환 레이어
 *
 * 백엔드는 camelCase + RsData 래퍼 + { active, history } 구조를 쓰지만,
 * 프론트엔드 스키마/컴포넌트는 snake_case + 단순 리스트 구조를 가정한다.
 * 본 파일은 양방향(요청·응답) 변환만 담당하며, FE는 항상 FE-shape만 다루도록 한다.
 *
 * apiCall 자체는 RsData 래퍼만 자동 unwrap한다 (api/client.ts 참고).
 * 추가 필드 변환·구조 변환은 각 hook의 queryFn / mutationFn 안에서 본 어댑터 호출.
 */

import { z } from 'zod';

import type {
  AddAllergyReq,
  AddConditionReq,
  AddMedicationReq,
  Allergy,
  Condition,
  Medication,
} from './types';
import type { Evidence } from './types/safety';

// ============================================================================
// BE 응답 Zod 스키마 (RsData 자동 unwrap 이후의 `data` 부분)
// ============================================================================

export const BeMedicationSchema = z.object({
  id: z.number(),
  parentId: z.string(),
  itemSeq: z.string(),
  drugName: z.string(),
  ingredientNorm: z.string().nullable().optional(),
  startedOn: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const BeMedicationListResSchema = z.object({
  active: z.array(BeMedicationSchema),
  history: z.array(BeMedicationSchema),
});

export const BeSafetyCheckSchema = z.object({
  decision: z.enum(['ALLOW', 'WARN']),
  evidences: z.array(z.unknown()).optional(),
});

export const BeAddMedicationResSchema = BeMedicationSchema.extend({
  safety_check: BeSafetyCheckSchema,
});

// BLOCK 409 body — 백엔드 04 BlockErrorResponse
const BeBlockEvidenceSchema = z
  .object({
    source: z.string(),
    type: z.string().optional(),
    ingredient_a: z.string().optional(),
    ingredient_b: z.string().optional(),
    reason: z.string().optional(),
    gazette_no: z.string().optional(),
    gazette_date: z.string().optional(),
  })
  .passthrough();

export const BeBlockErrorBodySchema = z.object({
  error: z.literal('block'),
  verdict: z.object({
    decision: z.literal('BLOCK'),
    evidences: z.array(BeBlockEvidenceSchema),
  }),
});

export const BeConditionSchema = z.object({
  id: z.number(),
  parentId: z.string(),
  conditionName: z.string(),
  conditionNorm: z.string().nullable().optional(),
  kcdCode: z.string(),
  severity: z.string().optional(),
  diagnosedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const BeConditionListResSchema = z.object({
  active: z.array(BeConditionSchema),
  history: z.array(BeConditionSchema),
});

export const BeAllergySchema = z.object({
  id: z.number(),
  parentId: z.string(),
  allergenType: z.string(),
  allergenName: z.string(),
  allergenNorm: z.string().nullable().optional(),
  severity: z.string(),
  notes: z.string().nullable().optional(),
  confirmedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const BeAllergyListResSchema = z.object({
  active: z.array(BeAllergySchema),
  history: z.array(BeAllergySchema),
});

// ============================================================================
// 응답 어댑터 (BE → FE)
// ============================================================================

type BeMedication = z.infer<typeof BeMedicationSchema>;
type BeCondition = z.infer<typeof BeConditionSchema>;
type BeAllergy = z.infer<typeof BeAllergySchema>;

export function beMedicationToFe(be: BeMedication): Medication {
  return {
    item_seq: be.itemSeq,
    item_name: be.drugName,
    main_ingr_en: be.ingredientNorm ?? null,
    atc_code: null,
    specialty_type: null,
    medication_id: String(be.id),
    source: undefined,
    dosage_schedule: be.memo ?? undefined,
    added_at: be.startedOn ?? be.createdAt,
  };
}

export function beMedicationListToFe(
  be: z.infer<typeof BeMedicationListResSchema>,
): { medications: Medication[] } {
  // 활성만 노출 (history는 삭제된 약 — 약장 UI엔 안 보임)
  return { medications: be.active.map(beMedicationToFe) };
}

export function beAddMedicationToFe(
  be: z.infer<typeof BeAddMedicationResSchema>,
): { medication_id: string; item_seq: string; safety_check: { decision: 'ALLOW' | 'WARN'; evidences: Evidence[] } } {
  return {
    medication_id: String(be.id),
    item_seq: be.itemSeq,
    safety_check: {
      decision: be.safety_check.decision,
      evidences: [], // 201 응답의 evidences는 현재 UI에서 미사용 (BLOCK 시연만 필요)
    },
  };
}

export function beConditionToFe(be: BeCondition): Condition {
  return {
    condition_id: String(be.id),
    disease_code: be.kcdCode,
    disease_name: be.conditionName,
    diagnosed_at: be.diagnosedAt ?? null,
    notes: be.notes ?? null,
  };
}

export function beConditionListToFe(
  be: z.infer<typeof BeConditionListResSchema>,
): { conditions: Condition[] } {
  return { conditions: be.active.map(beConditionToFe) };
}

export function beAllergyToFe(be: BeAllergy): Allergy {
  return {
    allergy_id: String(be.id),
    allergen_type: be.allergenType as Allergy['allergen_type'],
    allergen_name: be.allergenName,
    severity: be.severity as Allergy['severity'],
    notes: be.notes ?? null,
  };
}

export function beAllergyListToFe(
  be: z.infer<typeof BeAllergyListResSchema>,
): { allergies: Allergy[] } {
  return { allergies: be.active.map(beAllergyToFe) };
}

/**
 * BE의 BLOCK evidence를 FE Evidence 형태로 변환.
 * BE: `{ source, type, ingredient_a, ingredient_b, reason, gazette_no, gazette_date }`
 * FE: `{ source, severity, message, citation?, citation_source?, conflicting_drug? }`
 *
 * type→severity 매핑: 병용금기=high, 주의=medium, 그 외=low.
 * citation_source는 식약처 고시 번호+일자로 재구성.
 */
export function beBlockEvidenceToFe(be: z.infer<typeof BeBlockEvidenceSchema>): Evidence {
  const sourceType = (be.source === 'DUR' || be.source === 'NB' || be.source === 'patient_class')
    ? be.source
    : 'DUR';

  const severity: 'high' | 'medium' | 'low' =
    be.type === '병용금기' ? 'high' : be.type === '주의' ? 'medium' : 'low';

  const ingredients = [be.ingredient_a, be.ingredient_b].filter(Boolean).join(' × ');
  const message = be.reason ?? (ingredients ? `${ingredients} 병용금기` : 'BLOCK');

  const citation_source =
    be.gazette_no && be.gazette_date
      ? `식약처 고시 ${be.gazette_no} (${be.gazette_date})`
      : be.gazette_no
        ? `식약처 고시 ${be.gazette_no}`
        : undefined;

  return {
    source: sourceType,
    severity,
    message,
    citation: be.reason,
    citation_source,
  };
}

/**
 * BE의 BlockErrorResponse 전체를 FE 형태로 변환.
 * SafetyBlockError.payload가 가질 형태 — safety-result 모달이 이걸 그대로 사용.
 */
export function beBlockErrorToFe(rawBody: unknown): {
  error: 'block';
  verdict: { decision: 'BLOCK'; evidences: Evidence[] };
} {
  const parsed = BeBlockErrorBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return { error: 'block', verdict: { decision: 'BLOCK', evidences: [] } };
  }
  return {
    error: 'block',
    verdict: {
      decision: 'BLOCK',
      evidences: parsed.data.verdict.evidences.map(beBlockEvidenceToFe),
    },
  };
}

// ============================================================================
// 요청 어댑터 (FE → BE)
// ============================================================================

export function feAddMedReqToBe(fe: AddMedicationReq): unknown {
  return {
    itemSeq: fe.item_seq,
    drugName: '', // BE가 itemSeq로 마스터 조회하므로 비워둬도 됨
    startedOn: new Date().toISOString().slice(0, 10),
    memo: fe.dosage ?? null,
  };
}

export function feAddConditionReqToBe(fe: AddConditionReq, diseaseName: string): unknown {
  return {
    kcdCode: fe.disease_code,
    conditionName: diseaseName,
    severity: 'unknown',
    diagnosedAt: fe.diagnosed_at ?? null,
    notes: fe.notes ?? null,
  };
}

export function feAddAllergyReqToBe(fe: AddAllergyReq): unknown {
  return {
    allergenType: fe.allergen_type,
    allergenName: fe.allergen_name,
    severity: fe.severity,
    notes: fe.notes ?? null,
  };
}
