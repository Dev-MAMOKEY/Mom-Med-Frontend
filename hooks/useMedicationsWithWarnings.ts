import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import {
  ConditionDrugWarningSchema,
  MedicationListSchema,
  OverallSafetyCheckSchema,
} from '@/api/types';
import { mockConditionWarnings } from '@/mocks/condition-warnings';
import { mockMedications, mockSafetyCheck } from '@/mocks/medications';

const ConditionWarningsResSchema = z.array(ConditionDrugWarningSchema);

// 약장 + 사전 안전점검 + 질병↔약 경고를 한 번에 — F3 약장 ⚠ 뱃지 연동 (#43 useAddCondition/useDeleteCondition가
// ['medications-with-warnings', parentId] 키를 invalidate하므로 질병 변경 시 자동 refetch됨)
export function useMedicationsWithWarnings(parentId: string) {
  return useQuery({
    queryKey: ['medications-with-warnings', parentId],
    enabled: !!parentId,
    queryFn: async () => {
      const [list, safety, warnings] = await Promise.all([
        apiCall(
          'GET',
          `/v1/parents/${parentId}/medications`,
          undefined,
          MedicationListSchema,
          () => mockMedications(parentId),
        ),
        apiCall(
          'GET',
          `/v1/parents/${parentId}/safety-check`,
          undefined,
          OverallSafetyCheckSchema,
          () => mockSafetyCheck(parentId),
        ),
        apiCall(
          'GET',
          `/v1/parents/${parentId}/condition-warnings`,
          undefined,
          ConditionWarningsResSchema,
          () => mockConditionWarnings(parentId),
        ),
      ]);

      // 약별 warnings 매핑 — item_seq 기준 inner join 형태
      const medicationsWithWarnings = list.medications.map((m) => ({
        medication: m,
        warnings: warnings.filter((w) => w.item_seq === m.item_seq),
      }));

      return { medicationsWithWarnings, safety };
    },
  });
}
