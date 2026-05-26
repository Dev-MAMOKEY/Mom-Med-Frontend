import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { mockDeleteCondition } from '@/mocks/conditions';

const DeleteConditionResSchema = z.object({
  success: z.literal(true),
});

// 질병 삭제 mutation — useAddCondition과 동일 invalidate 3종 (목록·약장 경고·응급카드 모두 갱신)
export function useDeleteCondition(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conditionId: string) =>
      apiCall(
        'DELETE',
        `/v1/parents/${parentId}/conditions/${conditionId}`,
        undefined,
        DeleteConditionResSchema,
        () => mockDeleteCondition(parentId, conditionId),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conditions', parentId] });
      qc.invalidateQueries({ queryKey: ['medications-with-warnings', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
