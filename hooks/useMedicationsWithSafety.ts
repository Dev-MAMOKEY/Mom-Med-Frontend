import { useQuery } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { BeMedicationListResSchema, beMedicationListToFe } from '@/api/adapters';
import { type MedicationList, OverallSafetyCheckSchema } from '@/api/types';
import { mockMedications, mockSafetyCheck } from '@/mocks/medications';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

async function fetchMedicationList(parentId: string): Promise<MedicationList> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return mockMedications(parentId);
  }
  const be = await apiCall(
    'GET',
    `/v1/parents/${parentId}/medications`,
    undefined,
    BeMedicationListResSchema,
    undefined,
    'always-real',
  );
  return beMedicationListToFe(be);
}

// 약장 + 사전 안전 점검을 한 번에
// 약장: 실서버 연동 (어댑터 적용)
// safety-check: 백엔드 형태가 달라서(POST /v1/safety/check) mock 고정
export function useMedicationsWithSafety(parentId: string) {
  return useQuery({
    queryKey: ['medications', parentId],
    enabled: !!parentId,
    queryFn: async () => {
      const list = await fetchMedicationList(parentId);
      const safety = await apiCall(
        'GET',
        `/v1/parents/${parentId}/safety-check`,
        undefined,
        OverallSafetyCheckSchema,
        () => mockSafetyCheck(parentId),
        'always-mock',
      );
      return { list, safety };
    },
  });
}
