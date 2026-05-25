import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { mockDeleteMedication } from '@/mocks/medications';

const DeleteMedicationResSchema = z.object({
  success: z.literal(true),
});

// 약 삭제 mutation — safety-result(WARN)의 "제거" 액션·약 상세 삭제 버튼에서 사용
// onSuccess에서 약장 쿼리 무효화 → 약장 화면 자동 갱신 (useAddMedication과 동일 패턴)
export function useDeleteMedication(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (medicationId: string) =>
      apiCall(
        'DELETE',
        `/v1/parents/${parentId}/medications/${medicationId}`,
        undefined,
        DeleteMedicationResSchema,
        () => mockDeleteMedication(parentId, medicationId),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications', parentId] });
    },
  });
}
