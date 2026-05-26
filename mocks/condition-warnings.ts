import type { ConditionDrugWarning } from '@/api/types';

// ============================================================================
// 부모별 질병↔약 경고 매핑 — F2 약장 카드의 ⚠ 뱃지에 사용 (#49에서 약장 연동)
// ============================================================================
//
// 시연 흐름상 단순화:
//   - 어머니가 K25(위궤양)를 추가했을 때만 warning이 보여야 정상이지만
//     mock은 정적이라 동적 매핑이 어려움
//   - 일단 mom-001에 K25↔NSAID 매핑 1건을 항상 반환하고
//     #49에서 useMedicationsWithWarnings가 mockConditions와 교집합 분기 추가 예정
//   - item_seq '200610660'은 현 mom 약장의 식별자 1개를 placeholder로 사용
//
export const mockConditionWarnings = async (
  parentId: string,
): Promise<ConditionDrugWarning[]> => {
  if (parentId === 'mom-001') {
    return [
      {
        item_seq: '200610660',
        condition_code: 'K25',
        warning_message: '위궤양 환자 주의 (NSAID 계열)',
        citation: '위장관 부작용 발생 위험 ↑ (식약처 NB_DOC_DATA)',
      },
    ];
  }
  return [];
};
