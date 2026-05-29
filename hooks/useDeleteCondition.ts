import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiCall } from '@/api';
import { mockDeleteCondition } from '@/mocks/conditions';

const DeleteResultSchema = z.unknown().optional();
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// 질병 삭제 mutation — useAddCondition과 동일 invalidate 3종 (목록·약장 경고·응급카드)
export function useDeleteCondition(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conditionId: string): Promise<{ success: true }> => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200));
        return mockDeleteCondition(parentId, conditionId);
      }
      await apiCall(
        'DELETE',
        `/v1/parents/${parentId}/conditions/${conditionId}`,
        undefined,
        DeleteResultSchema,
        undefined,
        'always-real',
      );
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conditions', parentId] });
      qc.invalidateQueries({ queryKey: ['medications-with-warnings', parentId] });
      qc.invalidateQueries({ queryKey: ['emergency-card', parentId] });
    },
  });
}
