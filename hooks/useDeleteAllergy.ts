import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { mockDeleteAllergy } from '@/mocks/allergies';

const DeleteResultSchema = z.unknown().optional();
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 알레르기 삭제 mutation — useAddAllergy와 동일 invalidate 2종 (목록·응급카드)
export function useDeleteAllergy(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (allergyId: string): Promise<{ success: true }> => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockDeleteAllergy(parentId, allergyId);
      }
      await apiCall(
        'DELETE',
        `/v1/parents/${parentId}/allergies/${allergyId}`,
        undefined,
        DeleteResultSchema,
        undefined,
        'always-real',
      );
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allergies', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
