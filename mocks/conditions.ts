import type {
  AddConditionReq,
  Condition,
  ConditionList,
} from '@/api/types';

// ============================================================================
// 1) 부모별 질병 목록 — 어머니(mom-001) I10 + E11, 그 외 빈 배열
// ============================================================================

const momConditions: Condition[] = [
  {
    condition_id: 'cond-001',
    disease_code: 'I10',
    disease_name: '본태성 고혈압',
    diagnosed_at: '2020-03-15',
    notes: '경북대병원에서 진단',
  },
  {
    condition_id: 'cond-002',
    disease_code: 'E11',
    disease_name: '2형 당뇨병',
    diagnosed_at: '2021-08-22',
    notes: null,
  },
];

export const mockConditions = async (parentId: string): Promise<ConditionList> => {
  if (parentId === 'mom-001') return { conditions: momConditions };
  return { conditions: [] };
};

// ============================================================================
// 2) 질병 추가 — KCD 9개 disease_name 매핑 (백엔드가 채워주는 필드를 mock에서 시뮬레이션)
// ============================================================================

const diseaseNameByCode: Record<string, string> = {
  I10: '본태성 고혈압',
  E11: '2형 당뇨병',
  K25: '위궤양',
  J45: '천식',
  M19: '기타 골관절염',
  I20: '협심증',
  I63: '뇌경색증',
  N18: '만성 신장병',
  J44: '기타 만성 폐쇄성 폐질환',
};

export const mockAddCondition = async (
  _parentId: string,
  req: AddConditionReq,
): Promise<Condition> => ({
  condition_id: `cond-mock-${Date.now()}`,
  disease_code: req.disease_code,
  disease_name: diseaseNameByCode[req.disease_code] ?? req.disease_code,
  diagnosed_at: req.diagnosed_at ?? null,
  notes: req.notes ?? null,
});

// ============================================================================
// 3) 질병 삭제 — 항상 성공
// ============================================================================

export const mockDeleteCondition = async (
  _parentId: string,
  _conditionId: string,
): Promise<{ success: true }> => ({ success: true });
