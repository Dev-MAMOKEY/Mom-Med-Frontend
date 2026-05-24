import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { MedicationListSchema, OverallSafetyCheckSchema } from '@/api/types';
import { mockMedications, mockSafetyCheck } from '@/mocks/medications';

// 약장 + 사전 안전 점검을 한 번에 — 약장 화면(#41 이후)에서 사용
export function useMedicationsWithSafety(parentId: string) {
  return useQuery({
    queryKey: ['medications', parentId],
    enabled: !!parentId,
    queryFn: async () => {
      const list = await apiCall(
        'GET',
        `/v1/parents/${parentId}/medications`,
        undefined,
        MedicationListSchema,
        () => mockMedications(parentId),
      );
      const safety = await apiCall(
        'GET',
        `/v1/parents/${parentId}/safety-check`,
        undefined,
        OverallSafetyCheckSchema,
        () => mockSafetyCheck(parentId),
      );
      return { list, safety };
    },
  });
}
