import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { ConditionListSchema } from '@/api/types';
import { mockConditions } from '@/mocks/conditions';

// 부모 질병 목록 — F3 질병 화면·F4 응급카드·#49 약장 ⚠ 뱃지에서 공유
export function useConditions(parentId: string) {
  return useQuery({
    queryKey: ['conditions', parentId],
    enabled: !!parentId,
    queryFn: () =>
      apiCall(
        'GET',
        `/v1/parents/${parentId}/conditions`,
        undefined,
        ConditionListSchema,
        () => mockConditions(parentId),
      ),
  });
}
