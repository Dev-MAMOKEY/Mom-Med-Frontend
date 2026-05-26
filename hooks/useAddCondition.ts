import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { ConditionSchema, type AddConditionReq } from '@/api/types';
import { mockAddCondition } from '@/mocks/conditions';

// 질병 추가 mutation — ★ invalidate 3종:
//   1) ['conditions', ...]              — 본인 목록 갱신
//   2) ['medications-with-warnings', ...] — F2 약장 ⚠ 뱃지 갱신 (#49)
//   3) ['emergency-card', ...]          — F4 응급카드 P1 갱신
// 체인 누락 시 다른 화면이 stale 데이터 유지하므로 모두 필수.
export function useAddCondition(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddConditionReq) =>
      apiCall(
        'POST',
        `/v1/parents/${parentId}/conditions`,
        req,
        ConditionSchema,
        () => mockAddCondition(parentId, req),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conditions', parentId] });
      qc.invalidateQueries({ queryKey: ['medications-with-warnings', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
