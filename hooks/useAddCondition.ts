import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { BeConditionSchema, beConditionToFe, feAddConditionReqToBe } from '@/api/adapters';
import { type AddConditionReq } from '@/api/types';
import { mockAddCondition } from '@/mocks/conditions';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 질병 추가 mutation — ★ invalidate 3종:
//   1) ['conditions', ...]              — 본인 목록 갱신
//   2) ['medications-with-warnings', ...] — F2 약장 ⚠ 뱃지 갱신
//   3) ['emergency-card', ...]          — F4 응급카드 P1 갱신
// 체인 누락 시 다른 화면이 stale 데이터 유지하므로 모두 필수.
export function useAddCondition(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: AddConditionReq) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockAddCondition(parentId, req);
      }
      const beRes = await apiCall(
        'POST',
        `/v1/parents/${parentId}/conditions`,
        feAddConditionReqToBe(req, req.disease_name ?? req.disease_code),
        BeConditionSchema,
        undefined,
        'always-real',
      );
      return beConditionToFe(beRes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conditions', parentId] });
      qc.invalidateQueries({ queryKey: ['medications-with-warnings', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
