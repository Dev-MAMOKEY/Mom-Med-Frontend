import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiCall } from '@/api';
import { AddMedicationResSchema, type AddMedicationReq } from '@/api/types';
import { mockAddMedication } from '@/mocks/medications';

// 약 추가 mutation — BLOCK은 SafetyBlockError로 throw됨 (호출자가 instanceof 분기)
// onSuccess에서 약장 쿼리 무효화 → 약장 화면 자동 갱신
export function useAddMedication(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddMedicationReq) =>
      apiCall(
        'POST',
        `/v1/parents/${parentId}/medications`,
        req,
        AddMedicationResSchema,
        () => mockAddMedication(parentId, req),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications', parentId] });
    },
  });
}
