import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { AllergyListSchema } from '@/api/types';
import { mockAllergies } from '@/mocks/allergies';

// 부모 알레르기 목록 — F3 알레르기 화면·F4 응급카드 P1에서 공유
export function useAllergies(parentId: string) {
  return useQuery({
    queryKey: ['allergies', parentId],
    enabled: !!parentId,
    queryFn: () =>
      apiCall(
        'GET',
        `/v1/parents/${parentId}/allergies`,
        undefined,
        AllergyListSchema,
        () => mockAllergies(parentId),
      ),
  });
}
