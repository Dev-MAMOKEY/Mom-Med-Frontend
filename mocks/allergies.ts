import type { AddAllergyReq, Allergy, AllergyList } from '@/api/types';

// ============================================================================
// 1) 부모별 알레르기 목록 — 어머니(mom-001) 페니실린(severe)·아스피린(moderate)
// ============================================================================

const momAllergies: Allergy[] = [
  {
    allergy_id: 'alg-001',
    allergen_type: 'drug',
    allergen_name: '페니실린',
    severity: 'severe',
    notes: '두드러기·기관지 부종 이력',
  },
  {
    allergy_id: 'alg-002',
    allergen_type: 'drug',
    allergen_name: '아스피린',
    severity: 'moderate',
    notes: '복용 후 위통',
  },
];

export const mockAllergies = async (parentId: string): Promise<AllergyList> => {
  if (parentId === 'mom-001') return { allergies: momAllergies };
  return { allergies: [] };
};

// ============================================================================
// 2) 알레르기 추가 — 요청 그대로 echo (id만 생성)
// ============================================================================

export const mockAddAllergy = async (
  _parentId: string,
  req: AddAllergyReq,
): Promise<Allergy> => ({
  allergy_id: `alg-mock-${Date.now()}`,
  allergen_type: req.allergen_type,
  allergen_name: req.allergen_name,
  severity: req.severity,
  notes: req.notes ?? null,
});

// ============================================================================
// 3) 알레르기 삭제 — 항상 성공
// ============================================================================

export const mockDeleteAllergy = async (
  _parentId: string,
  _allergyId: string,
): Promise<{ success: true }> => ({ success: true });
