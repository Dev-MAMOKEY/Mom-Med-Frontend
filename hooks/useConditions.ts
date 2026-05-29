import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { BeConditionListResSchema, beConditionListToFe } from '@/api/adapters';
import { type ConditionList } from '@/api/types';
import { mockConditions } from '@/mocks/conditions';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 부모 질병 목록 — F3 질병 화면·F4 응급카드·약장 ⚠ 뱃지에서 공유
export function useConditions(parentId: string) {
  return useQuery({
    queryKey: ['conditions', parentId],
    enabled: !!parentId,
    queryFn: async (): Promise<ConditionList> => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockConditions(parentId);
      }
      const be = await apiCall(
        'GET',
        `/v1/parents/${parentId}/conditions`,
        undefined,
        BeConditionListResSchema,
        undefined,
        'always-real',
      );
      return beConditionListToFe(be);
    },
  });
}
