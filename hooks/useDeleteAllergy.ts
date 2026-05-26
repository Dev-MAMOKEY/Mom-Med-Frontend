import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { mockDeleteAllergy } from '@/mocks/allergies';

const DeleteAllergyResSchema = z.object({
  success: z.literal(true),
});

// 알레르기 삭제 mutation — useAddAllergy와 동일 invalidate 2종 (목록·응급카드)
export function useDeleteAllergy(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allergyId: string) =>
      apiCall(
        'DELETE',
        `/v1/parents/${parentId}/allergies/${allergyId}`,
        undefined,
        DeleteAllergyResSchema,
        () => mockDeleteAllergy(parentId, allergyId),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allergies', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
