import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { BeAllergyListResSchema, beAllergyListToFe } from '@/api/adapters';
import { type AllergyList } from '@/api/types';
import { mockAllergies } from '@/mocks/allergies';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 부모 알레르기 목록 — F3 알레르기 화면·F4 응급카드 P1에서 공유
export function useAllergies(parentId: string) {
  return useQuery({
    queryKey: ['allergies', parentId],
    enabled: !!parentId,
    queryFn: async (): Promise<AllergyList> => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockAllergies(parentId);
      }
      const be = await apiCall(
        'GET',
        `/v1/parents/${parentId}/allergies`,
        undefined,
        BeAllergyListResSchema,
        undefined,
        'always-real',
      );
      return beAllergyListToFe(be);
    },
  });
}
