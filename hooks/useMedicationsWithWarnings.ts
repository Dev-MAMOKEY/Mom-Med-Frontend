import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { BeMedicationListResSchema, beMedicationListToFe } from '@/api/adapters';
import {
  ConditionDrugWarningSchema,
  type MedicationList,
  OverallSafetyCheckSchema,
} from '@/api/types';
import { mockConditionWarnings } from '@/mocks/condition-warnings';
import { mockMedications, mockSafetyCheck } from '@/mocks/medications';

const ConditionWarningsResSchema = z.array(ConditionDrugWarningSchema);
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

// 약장 + 사전 안전점검 + 질병↔약 경고를 한 번에 — F3 약장 ⚠ 뱃지 연동
// 약장 부분만 실서버 연동(어댑터 적용), safety-check 와 condition-warnings 는 BE 엔드포인트 형태가 달라서 mock 고정
export function useMedicationsWithWarnings(parentId: string) {
  return useQuery({
    queryKey: ['medications-with-warnings', parentId],
    enabled: !!parentId,
    queryFn: async () => {
      const [list, safety, warnings] = await Promise.all([
        fetchMedicationList(parentId),
        // 백엔드는 POST /v1/safety/check 형식 — 별도 어댑터 필요. 일단 mock 고정.
        apiCall(
          'GET',
          `/v1/parents/${parentId}/safety-check`,
          undefined,
          OverallSafetyCheckSchema,
          () => mockSafetyCheck(parentId),
          'always-mock',
        ),
        // 백엔드에 condition-warnings 엔드포인트 없음 — mock 고정
        apiCall(
          'GET',
          `/v1/parents/${parentId}/condition-warnings`,
          undefined,
          ConditionWarningsResSchema,
          () => mockConditionWarnings(parentId),
          'always-mock',
        ),
      ]);

      const medicationsWithWarnings = list.medications.map((m) => ({
        medication: m,
        warnings: warnings.filter((w) => w.item_seq === m.item_seq),
      }));

      return { medicationsWithWarnings, safety };
    },
  });
}
